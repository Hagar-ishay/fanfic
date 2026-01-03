import { createHash } from "crypto";
import { openSync, fstatSync, readSync, closeSync } from "fs";

/**
 * Calculate KOReader's partial MD5 hash (Document:fastDigest algorithm)
 *
 * KOReader uses a specific hash algorithm that reads 10 samples of 1KB each
 * at exponentially increasing offsets throughout the file. This creates a
 * stable document identifier that survives minor changes to the file.
 *
 * The algorithm samples at byte offsets:
 * - 512 bytes (2^-1 * 1024)
 * - 2048 bytes (2^1 * 1024)
 * - 8192 bytes (2^3 * 1024)
 * - 32768 bytes (2^5 * 1024)
 * - ... up to 2^17 * 1024
 *
 * @param filePath - Path to the EPUB file
 * @returns MD5 hash (32 character hex string)
 */
export function calculateKOReaderHash(filePath: string): string {
  const hash = createHash("md5");
  const fd = openSync(filePath, "r");
  const buffer = Buffer.alloc(1024); // 1KB buffer
  const fileStats = fstatSync(fd);
  const fileSize = fileStats.size;

  try {
    // Sample 10 positions: i from -1 to 8
    // Offset = 1024 * 2^(2*i)
    for (let i = -1; i <= 8; i++) {
      const offset = 1024 * Math.pow(2, 2 * i);

      // Skip if offset exceeds file size
      if (offset >= fileSize) {
        break;
      }

      // Read 1KB at this offset
      const bytesRead = readSync(fd, buffer, 0, 1024, offset);

      // Update hash with the read bytes
      if (bytesRead > 0) {
        hash.update(buffer.subarray(0, bytesRead));
      }
    }

    return hash.digest("hex");
  } finally {
    closeSync(fd);
  }
}

/**
 * Calculate KOReader hash from a Buffer
 * Useful when the EPUB is already loaded in memory
 *
 * @param fileBuffer - Buffer containing the EPUB file
 * @returns MD5 hash (32 character hex string)
 */
export function calculateKOReaderHashFromBuffer(fileBuffer: Buffer): string {
  const hash = createHash("md5");
  const fileSize = fileBuffer.length;

  // Sample 10 positions: i from -1 to 8
  for (let i = -1; i <= 8; i++) {
    const offset = 1024 * Math.pow(2, 2 * i);

    // Skip if offset exceeds file size
    if (offset >= fileSize) {
      break;
    }

    // Determine how many bytes to read (up to 1024)
    const bytesToRead = Math.min(1024, fileSize - offset);

    // Update hash with bytes from buffer
    hash.update(fileBuffer.subarray(offset, offset + bytesToRead));
  }

  return hash.digest("hex");
}

/**
 * Verify if a file's KOReader hash matches an expected hash
 *
 * @param filePath - Path to the EPUB file
 * @param expectedHash - Expected MD5 hash
 * @returns True if hashes match, false otherwise
 */
export function verifyKOReaderHash(
  filePath: string,
  expectedHash: string
): boolean {
  const actualHash = calculateKOReaderHash(filePath);
  return actualHash.toLowerCase() === expectedHash.toLowerCase();
}
