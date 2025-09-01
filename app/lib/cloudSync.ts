"use server";

import { updateSyncStatus } from "@/db/fanficIntegrations";
import type { Integration, UserFanficIntegration } from "@/db/types";
import axios from "axios";
import path from "path";
import { getAo3Client } from "@/lib/ao3Client";
import { updateIntegration } from "@/db/integrations";
import logger from "@/logger";

interface CloudSyncResult {
  success: boolean;
  message: string;
  cloudPath?: string;
}

type IntegrationConfig = {
  id: number;
  name: string;
  type: string;
  config: Record<string, any>;
};

type CloudIntegrations = Record<
  string,
  (params: {
    fanficIntegration: UserFanficIntegration;
    sectionName: string;
    epubPath: string;
    fileName: string;
  }) => Promise<CloudSyncResult>
>;

export async function syncToCloud({
  fanficIntegration,
  sectionName,
  fanficTitle,
  downloadLink,
}: {
  fanficIntegration: UserFanficIntegration;
  sectionName: string;
  fanficTitle: string;
  downloadLink: string;
}) {
  const cloudIntegrations: CloudIntegrations = {
    google_drive: syncToGoogleDrive,
    webdav: syncToWebDAV,
    dropbox: syncToDropbox,
  };
  const ao3Client = await getAo3Client();
  const fileName = `${fanficTitle.replace(/[^a-zA-Z0-9\-_]/g, "_")}.epub`;
  const epubPath = `/tmp/${fileName}`;

  await ao3Client.downloadFanfic(downloadLink, epubPath);

  try {
    await updateSyncStatus(fanficIntegration.fanficIntegrationId, "syncing");

    let result: CloudSyncResult;

    if (fanficIntegration.integration.type in cloudIntegrations) {
      const syncFunction =
        cloudIntegrations[fanficIntegration.integration.type];
      if (!syncFunction) {
        throw new Error("Unsupported cloud provider");
      }

      result = await syncFunction({
        fanficIntegration,
        sectionName,
        epubPath,
        fileName,
      });

      if (result.success) {
        await updateSyncStatus(
          fanficIntegration.fanficIntegrationId,
          "success",
          null,
          result.cloudPath
        );
      } else {
        await updateSyncStatus(
          fanficIntegration.fanficIntegrationId,
          "error",
          result.message
        );
      }
      return {
        success: result.success,
        message: result.message,
        cloudPath: result.cloudPath,
      };
    }
  } catch (error) {
    logger.error(`Cloud sync error: ${error instanceof Error ? error.message : String(error)}`);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown cloud sync error";
    await updateSyncStatus(
      fanficIntegration.fanficIntegrationId,
      "error",
      errorMessage
    );
    return {
      success: false,
      message: errorMessage,
    };
  } finally {
    const fs = await import("fs/promises");
    await fs.unlink(epubPath);
  }
  return {
    success: false,
    message: "Unknown error",
  };
}

async function syncToGoogleDrive({
  fanficIntegration,
  sectionName,
  epubPath,
  fileName,
}: {
  fanficIntegration: UserFanficIntegration;
  sectionName: string;
  epubPath: string;
  fileName: string;
}): Promise<CloudSyncResult> {
  let { accessToken, refreshToken, folderId } = fanficIntegration.integration.config as {
    accessToken?: string;
    refreshToken?: string;
    folderId?: string;
  };

  if (!accessToken) {
    return {
      success: false,
      message: "Google Drive access token not configured",
    };
  }

  // Create an updated integration object with refreshed token
  let updatedIntegration = { ...fanficIntegration.integration };

  // Check if we have a refresh token to attempt refresh
  if (!refreshToken) {
    return {
      success: false,
      message:
        "Google Drive access has expired and no refresh token is available. Please sign out and sign back in to re-authenticate your Google account.",
    };
  }

  // Try to refresh the token if we have a refresh token
  if (refreshToken) {
    try {
      const refreshedTokens = await refreshGoogleDriveToken(refreshToken);
      if (refreshedTokens.accessToken) {
        accessToken = refreshedTokens.accessToken;
        // Update the integration with the new token
        await updateIntegrationTokens(
          fanficIntegration.integration.id,
          refreshedTokens,
          fanficIntegration.integration.config
        );
        // Update our working copy of the integration with the new token
        updatedIntegration = {
          ...fanficIntegration.integration,
          config: {
            ...fanficIntegration.integration.config,
            accessToken: refreshedTokens.accessToken,
          },
        };
      }
    } catch (error) {
      logger.warn(`Failed to refresh Google Drive token: ${error instanceof Error ? error.message : String(error)}`);
      // If refresh token is invalid, we should return an error indicating re-authentication is needed
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.error === "invalid_grant"
      ) {
        return {
          success: false,
          message:
            "Google Drive access has expired. Please remove and re-add your Google Drive integration in Settings to authenticate again.",
        };
      }
    }
  }

  try {
    // Build cloud path using section name as folder
    const folderName = sectionName;

    // Read EPUB file
    const fs = await import("fs/promises");
    const epubBuffer = await fs.readFile(epubPath);

    // Resolve parent folder ID (convert folder name to ID if needed)
    let parentFolderId = folderId;
    if (folderId && folderId !== "root" && !folderId.includes("-")) {
      // This looks like a folder name, not an ID - try to find it
      const foundFolderId = await findGoogleDriveFile(
        updatedIntegration,
        folderId,
        "root",
        true
      );
      if (foundFolderId) {
        parentFolderId = foundFolderId;
      } else {
        // Folder doesn't exist, create it
        parentFolderId = await createGoogleDriveFolder(
          updatedIntegration,
          folderId,
          "root"
        );
      }
    }

    // Find or create folder structure
    const finalFolderId = await createGoogleDriveFolder(
      updatedIntegration,
      folderName,
      parentFolderId
    );

    // Check if file already exists and get its ID
    const existingFileId =
      (await findGoogleDriveFile(
        updatedIntegration,
        fileName,
        finalFolderId
      )) || "";

    const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;

    const metadata = {
      name: fileName,
      parents: [finalFolderId],
    };

    if (existingFileId) {
      await axios.patch(uploadUrl, epubBuffer, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/epub+zip",
        },
        timeout: 60000,
      });
    } else {
      const delimiter = "-------314159265358979323846";
      const close_delim = `\r\n--${delimiter}--`;
      let body = `--${delimiter}\r\n`;
      body += "Content-Type: application/json\r\n\r\n";
      body += JSON.stringify(metadata) + "\r\n";
      body += `--${delimiter}\r\n`;
      body += "Content-Type: application/epub+zip\r\n\r\n";

      const bodyBuffer = Buffer.concat([
        Buffer.from(body, "utf8"),
        epubBuffer,
        Buffer.from(close_delim, "utf8"),
      ]);

      await axios.post(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        bodyBuffer,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary="${delimiter}"`,
            "Content-Length": bodyBuffer.length.toString(),
          },
          timeout: 60000,
        }
      );
    }

    return {
      success: true,
      message: existingFileId
        ? "Successfully updated file in Google Drive"
        : "Successfully uploaded to Google Drive",
      cloudPath: `/${folderName}/${fileName}`,
    };
  } catch (error) {
    logger.error(`Google Drive sync error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      message: `Google Drive sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function syncToWebDAV({
  fanficIntegration,
  sectionName,
  epubPath,
  fileName,
}: {
  fanficIntegration: UserFanficIntegration;
  sectionName: string;
  epubPath: string;
  fileName: string;
}): Promise<CloudSyncResult> {
  const { url, username, password } = fanficIntegration.integration.config as {
    url?: string;
    username?: string;
    password?: string;
  };
  logger.info(`WebDAV config: url=${url}, username=${username}, password=${password ? '***' : 'undefined'}`);
  if (!url || !username || !password) {
    return { success: false, message: "WebDAV credentials not configured" };
  }

  try {
    const cloudPath = path.posix.join("/PenioFanfic", sectionName, fileName);

    logger.info({ cloudPath });
    const fs = await import("fs/promises");
    const epubBuffer = await fs.readFile(epubPath);

    const dirPath = path.posix.dirname(cloudPath);
    await createWebDAVDirectory(fanficIntegration.integration, dirPath);

    const uploadUrl = new URL(cloudPath, url).toString();

    await axios.put(uploadUrl, epubBuffer, {
      auth: {
        username,
        password,
      },
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Length": epubBuffer.length.toString(),
      },
      timeout: 30000, // 30 second timeout
    });

    return {
      success: true,
      message: "Successfully synced to WebDAV",
      cloudPath: cloudPath,
    };
  } catch (error) {
    logger.error(`WebDAV sync error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      message: `WebDAV sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function createGoogleDriveFolder(
  integration: IntegrationConfig,
  folderName: string,
  parentFolderId?: string
): Promise<string> {
  const { accessToken } = integration.config;

  try {
    // Split folder path and create nested folders
    const folderParts = folderName.split("/").filter((part) => part.length > 0);
    let currentParentId = parentFolderId || "root";

    for (const folderPart of folderParts) {
      // Check if folder already exists
      const existingFolder = await findGoogleDriveFile(
        integration,
        folderPart,
        currentParentId,
        true
      );

      if (existingFolder) {
        currentParentId = existingFolder;
      } else {
        // Double-check that folder doesn't exist before creating (race condition protection)
        const doubleCheckFolder = await findGoogleDriveFile(
          integration,
          folderPart,
          currentParentId,
          true
        );
        
        if (doubleCheckFolder) {
          currentParentId = doubleCheckFolder;
        } else {
          // Create new folder
          const response = await axios.post(
            "https://www.googleapis.com/drive/v3/files",
            {
              name: folderPart,
              mimeType: "application/vnd.google-apps.folder",
              parents: [currentParentId],
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              timeout: 10000,
            }
          );
          currentParentId = response.data.id;
        }
      }
    }

    return currentParentId;
  } catch (error) {
    throw new Error(
      `Failed to create Google Drive folder: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

async function findGoogleDriveFile(
  integration: IntegrationConfig,
  fileName: string,
  parentFolderId: string,
  isFolder: boolean = false
): Promise<string | null> {
  const { accessToken } = integration.config;

  try {
    const mimeTypeQuery = isFolder
      ? "mimeType='application/vnd.google-apps.folder'"
      : "mimeType!='application/vnd.google-apps.folder'";

    // Escape single quotes in fileName to prevent query errors
    const escapedFileName = fileName.replace(/'/g, "\\'");
    const query = `name='${escapedFileName}' and '${parentFolderId}' in parents and ${mimeTypeQuery} and trashed=false`;

    logger.info(`Searching Google Drive with query: ${query}`);

    const response = await axios.get(
      "https://www.googleapis.com/drive/v3/files",
      {
        params: {
          q: query,
          fields: "files(id, name)",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      }
    );

    const files = response.data.files || [];
    logger.info(`Found ${files.length} matching files/folders`);
    
    if (files.length > 0) {
      logger.info(`Using first match: ${files[0].name} (${files[0].id})`);
    }
    
    return files.length > 0 ? files[0].id : null;
  } catch (error) {
    logger.error(
      `Error finding Google Drive file '${fileName}' in parent '${parentFolderId}': ${error instanceof Error ? error.message : "Unknown error"}`
    );
    
    // For authentication errors, we should let the parent function handle the token refresh
    // Rather than throwing here, return null and let the caller decide
    return null;
  }
}

async function createWebDAVDirectory(
  integration: IntegrationConfig,
  dirPath: string
): Promise<void> {
  try {
    const { url, username, password } = integration.config;

    // Split the path and create directories recursively
    const pathParts = dirPath.split("/").filter((part) => part.length > 0);
    let currentPath = "";

    for (const part of pathParts) {
      currentPath = path.posix.join(currentPath, part);
      const dirUrl = new URL(currentPath, url).toString();

      // Check if directory exists first
      try {
        await axios.request({
          method: "PROPFIND",
          url: dirUrl,
          auth: {
            username: username,
            password: password,
          },
          headers: {
            Depth: "0",
          },
          timeout: 5000,
        });
        // Directory exists, continue to next
        continue;
      } catch (error) {
        // Directory doesn't exist (404), try to create it
        if (!axios.isAxiosError(error) || error.response?.status !== 404) {
          logger.warn(
            `Could not check WebDAV directory ${currentPath}: ${error instanceof Error ? error.message : String(error)}`
          );
          continue;
        }
      }

      // Directory doesn't exist, create it
      try {
        await axios.request({
          method: "MKCOL",
          url: dirUrl,
          auth: {
            username: username,
            password: password,
          },
          timeout: 5000,
        });
      } catch (error) {
        // Directory might have been created by another process
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 405 || error.response?.status === 409)
        ) {
          continue;
        }
        logger.warn(`Could not create WebDAV directory ${currentPath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch (error) {
    logger.warn(`Could not create WebDAV directory structure: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function syncToDropbox({
  fanficIntegration,
  sectionName,
  epubPath,
  fileName,
}: {
  fanficIntegration: UserFanficIntegration;
  sectionName: string;
  epubPath: string;
  fileName: string;
}): Promise<CloudSyncResult> {
  const { accessToken } = fanficIntegration.integration.config;
  if (!accessToken) {
    return { success: false, message: "Dropbox access token not configured" };
  }

  try {
    // Build cloud path: /PenioFanfic/SectionName/filename.epub
    const cloudPath = path.posix.join("/PenioFanfic", sectionName, fileName);

    // Read EPUB file
    const fs = await import("fs/promises");
    const epubBuffer = await fs.readFile(epubPath);

    // Upload to Dropbox
    await axios.post(
      "https://content.dropboxapi.com/2/files/upload",
      epubBuffer,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/octet-stream",
          "Dropbox-API-Arg": JSON.stringify({
            path: cloudPath,
            mode: "overwrite",
            autorename: false,
          }),
        },
        timeout: 30000,
      }
    );

    return {
      success: true,
      message: "Successfully synced to Dropbox",
      cloudPath: cloudPath,
    };
  } catch (error) {
    logger.error(`Dropbox sync error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      message: `Dropbox sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function testCloudConnection(
  integration: Integration
): Promise<CloudSyncResult> {
  try {
    switch (integration.type) {
      case "webdav":
        return await testWebDAVConnection(integration);
      case "dropbox":
        return await testDropboxConnection(integration);
      case "google_drive":
        return await testGoogleDriveConnection(integration);
      default:
        return { success: false, message: "Unsupported cloud provider" };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Connection test failed",
    };
  }
}

async function testWebDAVConnection(
  integration: Integration
): Promise<CloudSyncResult> {
  const { url, username, password } = integration.config;
  if (!url || !username) {
    return { success: false, message: "WebDAV credentials not configured" };
  }

  try {
    const testUrl = new URL("/PenioFanfic/", url).toString();

    await axios.request({
      method: "PROPFIND",
      url: testUrl,
      auth: {
        username: username,
        password: password,
      },
      headers: {
        Depth: "0",
      },
      timeout: 5000,
    });

    return { success: true, message: "WebDAV connection successful" };
  } catch (error) {
    return {
      success: false,
      message: `WebDAV connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function testGoogleDriveConnection(
  integration: Integration
): Promise<CloudSyncResult> {
  let { accessToken, refreshToken } = integration.config;
  if (!accessToken) {
    return {
      success: false,
      message: "Google Drive access token not configured",
    };
  }

  try {
    // Try with current token first
    try {
      await axios.get("https://www.googleapis.com/drive/v3/about?fields=user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 5000,
      });
    } catch (tokenError) {
      // If token expired, try to refresh
      if (
        refreshToken &&
        axios.isAxiosError(tokenError) &&
        tokenError.response?.status === 401
      ) {
        const refreshedTokens = await refreshGoogleDriveToken(refreshToken);
        accessToken = refreshedTokens.accessToken;
        await updateIntegrationTokens(
          integration.id,
          refreshedTokens,
          integration.config
        );

        // Retry with new token
        await axios.get(
          "https://www.googleapis.com/drive/v3/about?fields=user",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            timeout: 5000,
          }
        );
      } else {
        throw tokenError;
      }
    }

    return { success: true, message: "Google Drive connection successful" };
  } catch (error) {
    return {
      success: false,
      message: `Google Drive connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function testDropboxConnection(
  integration: Integration
): Promise<CloudSyncResult> {
  const { accessToken } = integration.config;
  if (!accessToken) {
    return { success: false, message: "Dropbox access token not configured" };
  }

  try {
    await axios.post(
      "https://api.dropboxapi.com/2/users/get_current_account",
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    return { success: true, message: "Dropbox connection successful" };
  } catch (error) {
    return {
      success: false,
      message: `Dropbox connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function refreshGoogleDriveToken(refreshToken: string) {
  const url = "https://oauth2.googleapis.com/token";

  const response = await axios.post(
    url,
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token || refreshToken,
    expiresAt: Math.floor(Date.now() / 1000 + response.data.expires_in),
  };
}

async function updateIntegrationTokens(
  integrationId: number,
  tokens: { accessToken: string; refreshToken: string; expiresAt: number },
  existingConfig: Record<string, any>
) {
  await updateIntegration(integrationId, {
    config: {
      ...existingConfig,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt.toString(),
    },
  });
}
