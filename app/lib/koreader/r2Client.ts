"use server";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import logger from "@/logger";

// Initialize Cloudflare R2 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "fanfic-epubs";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

export interface UploadEpubResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface DownloadEpubResult {
  success: boolean;
  stream?: Readable;
  error?: string;
}

/**
 * Upload an EPUB file to Cloudflare R2
 * @param filePath - Path to the local EPUB file
 * @param userId - User ID for organization
 * @param fanficId - Fanfic ID for organization
 * @param fileBuffer - Buffer containing the EPUB file content
 * @returns Result with URL or error
 */
export async function uploadEpubToR2(
  userId: string,
  fanficId: number,
  fileBuffer: Buffer
): Promise<UploadEpubResult> {
  try {
    const key = `users/${userId}/fanfics/${fanficId}.epub`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: "application/epub+zip",
    });

    await r2Client.send(command);

    // Generate public URL
    const publicUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://${BUCKET_NAME}.r2.dev/${key}`;

    logger.info(`EPUB uploaded to R2: ${publicUrl}`);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    logger.error(
      `Failed to upload EPUB to R2: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Download an EPUB file from Cloudflare R2 as a stream
 * @param userId - User ID
 * @param fanficId - Fanfic ID
 * @returns Result with stream or error
 */
export async function downloadEpubFromR2(
  userId: string,
  fanficId: number
): Promise<DownloadEpubResult> {
  try {
    const key = `users/${userId}/fanfics/${fanficId}.epub`;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return {
        success: false,
        error: "Empty response from R2",
      };
    }

    return {
      success: true,
      stream: response.Body as Readable,
    };
  } catch (error) {
    logger.error(
      `Failed to download EPUB from R2: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if an EPUB file exists in R2
 * @param userId - User ID
 * @param fanficId - Fanfic ID
 * @returns True if file exists, false otherwise
 */
export async function epubExistsInR2(
  userId: string,
  fanficId: number
): Promise<boolean> {
  try {
    const key = `users/${userId}/fanfics/${fanficId}.epub`;

    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete an EPUB file from R2
 * @param userId - User ID
 * @param fanficId - Fanfic ID
 * @returns True if deleted successfully, false otherwise
 */
export async function deleteEpubFromR2(
  userId: string,
  fanficId: number
): Promise<boolean> {
  try {
    const key = `users/${userId}/fanfics/${fanficId}.epub`;

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    logger.info(`EPUB deleted from R2: ${key}`);
    return true;
  } catch (error) {
    logger.error(
      `Failed to delete EPUB from R2: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
}

/**
 * Generate a signed URL for temporary access to an EPUB
 * @param userId - User ID
 * @param fanficId - Fanfic ID
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL or null on error
 */
export async function getSignedEpubUrl(
  userId: string,
  fanficId: number,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const key = `users/${userId}/fanfics/${fanficId}.epub`;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    logger.error(
      `Failed to generate signed URL: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}
