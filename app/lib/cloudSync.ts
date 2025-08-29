"use server";
import { updateSyncStatus } from "@/db/fanficIntegrations";
import type { Integration, FanficIntegration } from "@/db/types";
import axios from "axios";
import path from "path";

interface CloudSyncResult {
  success: boolean;
  message: string;
  cloudPath?: string;
}

export async function syncToCloud(
  fanficIntegrationId: number,
  integration: Integration,
  sectionName: string,
  fanficTitle: string,
  epubPath: string
): Promise<CloudSyncResult> {
  const fileName = `${fanficTitle.replace(/[^a-zA-Z0-9\-_]/g, "_")}.epub`;

  try {
    // Update status to syncing
    await updateSyncStatus(fanficIntegrationId, "syncing");

    let result: CloudSyncResult;

    switch (integration.type) {
      case "google_drive":
        result = await syncToGoogleDrive(
          integration,
          sectionName,
          epubPath,
          fileName
        );
        break;
      case "webdav":
        result = await syncToWebDAV(
          integration,
          sectionName,
          epubPath,
          fileName
        );
        break;
      case "dropbox":
        result = await syncToDropbox(
          integration,
          sectionName,
          epubPath,
          fileName
        );
        break;
      default:
        result = { success: false, message: "Unsupported cloud provider" };
    }

    // Update final status
    if (result.success) {
      await updateSyncStatus(fanficIntegrationId, "success", null, result.cloudPath);
    } else {
      await updateSyncStatus(fanficIntegrationId, "error", result.message);
    }

    return result;
  } catch (error) {
    console.error("Cloud sync error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown cloud sync error";
    await updateSyncStatus(fanficIntegrationId, "error", errorMessage);
    return {
      success: false,
      message: errorMessage,
    };
  }
}

async function syncToGoogleDrive(
  integration: Integration,
  sectionName: string,
  epubPath: string,
  fileName: string
): Promise<CloudSyncResult> {
  const { accessToken, folderId } = integration.config;
  if (!accessToken) {
    return { success: false, message: "Google Drive access token not configured" };
  }

  try {
    // Build cloud path using /PenioFanfic/ as base
    const folderName = `PenioFanfic/${sectionName}`;

    // Read EPUB file
    const fs = await import("fs/promises");
    const epubBuffer = await fs.readFile(epubPath);

    // Find or create folder structure
    const finalFolderId = await createGoogleDriveFolder(integration, folderName, folderId);

    // Check if file already exists and get its ID
    const existingFileId = await findGoogleDriveFile(integration, fileName, finalFolderId);

    const uploadUrl = existingFileId 
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const metadata = {
      name: fileName,
      parents: [finalFolderId],
    };

    let response;
    
    if (existingFileId) {
      // Update existing file
      response = await axios.patch(uploadUrl, epubBuffer, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/epub+zip',
        },
        timeout: 60000,
      });
    } else {
      // Create new file using multipart upload
      const delimiter = '-------314159265358979323846';
      const close_delim = `\r\n--${delimiter}--`;
      let body = `--${delimiter}\r\n`;
      body += 'Content-Type: application/json\r\n\r\n';
      body += JSON.stringify(metadata) + '\r\n';
      body += `--${delimiter}\r\n`;
      body += 'Content-Type: application/epub+zip\r\n\r\n';
      
      const bodyBuffer = Buffer.concat([
        Buffer.from(body, 'utf8'),
        epubBuffer,
        Buffer.from(close_delim, 'utf8')
      ]);

      response = await axios.post(uploadUrl, bodyBuffer, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary="${delimiter}"`,
          'Content-Length': bodyBuffer.length.toString(),
        },
        timeout: 60000,
      });
    }

    return {
      success: true,
      message: existingFileId ? "Successfully updated file in Google Drive" : "Successfully uploaded to Google Drive",
      cloudPath: `/${folderName}/${fileName}`,
    };
  } catch (error) {
    console.error("Google Drive sync error:", error);
    return {
      success: false,
      message: `Google Drive sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function syncToWebDAV(
  integration: Integration,
  sectionName: string,
  epubPath: string,
  fileName: string
): Promise<CloudSyncResult> {
  const { url, username, password } = integration.config;
  if (!url || !username) {
    return { success: false, message: "WebDAV credentials not configured" };
  }

  try {
    // Build cloud path: /PenioFanfic/SectionName/filename.epub
    const cloudPath = path.posix.join(
      "/PenioFanfic",
      sectionName,
      fileName
    );

    // Read EPUB file
    const fs = await import("fs/promises");
    const epubBuffer = await fs.readFile(epubPath);

    // Create directory structure first
    const dirPath = path.posix.dirname(cloudPath);
    await createWebDAVDirectory(integration, dirPath);

    // Upload file to WebDAV
    const uploadUrl = new URL(cloudPath, url).toString();

    await axios.put(uploadUrl, epubBuffer, {
      auth: {
        username: username,
        password: password,
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
    console.error("WebDAV sync error:", error);
    return {
      success: false,
      message: `WebDAV sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function createGoogleDriveFolder(
  integration: Integration,
  folderName: string,
  parentFolderId?: string
): Promise<string> {
  const { accessToken } = integration.config;
  
  try {
    // Split folder path and create nested folders
    const folderParts = folderName.split('/').filter(part => part.length > 0);
    let currentParentId = parentFolderId || 'root';
    
    for (const folderPart of folderParts) {
      // Check if folder already exists
      const existingFolder = await findGoogleDriveFile(integration, folderPart, currentParentId, true);
      
      if (existingFolder) {
        currentParentId = existingFolder;
      } else {
        // Create new folder
        const response = await axios.post(
          'https://www.googleapis.com/drive/v3/files',
          {
            name: folderPart,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [currentParentId]
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        currentParentId = response.data.id;
      }
    }
    
    return currentParentId;
  } catch (error) {
    throw new Error(`Failed to create Google Drive folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function findGoogleDriveFile(
  integration: Integration,
  fileName: string,
  parentFolderId: string,
  isFolder: boolean = false
): Promise<string | null> {
  const { accessToken } = integration.config;
  
  try {
    const mimeTypeQuery = isFolder 
      ? "mimeType='application/vnd.google-apps.folder'" 
      : "mimeType!='application/vnd.google-apps.folder'";
    
    const query = `name='${fileName}' and '${parentFolderId}' in parents and ${mimeTypeQuery} and trashed=false`;
    
    const response = await axios.get(
      'https://www.googleapis.com/drive/v3/files',
      {
        params: {
          q: query,
          fields: 'files(id, name)',
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        timeout: 10000,
      }
    );
    
    const files = response.data.files || [];
    return files.length > 0 ? files[0].id : null;
  } catch (error) {
    console.warn(`Error finding Google Drive file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

async function createWebDAVDirectory(
  integration: Integration,
  dirPath: string
): Promise<void> {
  try {
    const { url, username, password } = integration.config;
    const dirUrl = new URL(dirPath, url).toString();

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
    // Directory might already exist, which is fine
    if (axios.isAxiosError(error) && error.response?.status === 405) {
      // 405 Method Not Allowed usually means directory exists
      return;
    }
    // For other errors, we'll try to continue anyway
    console.warn("Could not create WebDAV directory:", error);
  }
}

async function syncToDropbox(
  integration: Integration,
  sectionName: string,
  epubPath: string,
  fileName: string
): Promise<CloudSyncResult> {
  const { accessToken } = integration.config;
  if (!accessToken) {
    return { success: false, message: "Dropbox access token not configured" };
  }

  try {
    // Build cloud path: /PenioFanfic/SectionName/filename.epub
    const cloudPath = path.posix.join(
      "/PenioFanfic",
      sectionName,
      fileName
    );

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
    console.error("Dropbox sync error:", error);
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
  const { accessToken } = integration.config;
  if (!accessToken) {
    return { success: false, message: "Google Drive access token not configured" };
  }

  try {
    await axios.get(
      "https://www.googleapis.com/drive/v3/about?fields=user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 5000,
      }
    );

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
