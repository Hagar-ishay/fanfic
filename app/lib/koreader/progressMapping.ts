/**
 * Progress mapping between KOReader (byte position/percentage) and
 * web app (chapter number/percentage)
 */

/**
 * Convert KOReader percentage to chapter number
 *
 * @param percentage - Reading percentage (0.0 to 1.0)
 * @param chapterBoundaries - Object mapping chapter numbers to byte offsets
 * @param totalBytes - Total file size in bytes
 * @returns Chapter number (1-indexed)
 */
export function percentageToChapter(
  percentage: number,
  chapterBoundaries: Record<string, number>,
  totalBytes: number
): number {
  // Calculate current byte position
  const bytePosition = percentage * totalBytes;

  // Sort chapters by their byte offset
  const chapters = Object.entries(chapterBoundaries)
    .map(([chapterStr, offset]) => ({
      chapter: parseInt(chapterStr),
      offset,
    }))
    .sort((a, b) => a.offset - b.offset);

  // Find the chapter containing this byte position
  // Start from the end and find the first chapter whose offset is <= bytePosition
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (bytePosition >= chapters[i].offset) {
      return chapters[i].chapter;
    }
  }

  // Default to chapter 1 if no match found
  return 1;
}

/**
 * Convert chapter number to byte position (for syncing web → KOReader)
 *
 * @param chapter - Current chapter number
 * @param chapterBoundaries - Object mapping chapter numbers to byte offsets
 * @returns Byte offset for the start of this chapter
 */
export function chapterToBytePosition(
  chapter: number,
  chapterBoundaries: Record<string, number>
): number {
  const chapterStr = chapter.toString();

  // Return the offset for this chapter, or 0 if not found
  return chapterBoundaries[chapterStr] || 0;
}

/**
 * Convert byte position to percentage
 *
 * @param bytePosition - Current byte position
 * @param totalBytes - Total file size in bytes
 * @returns Percentage (0.0 to 1.0)
 */
export function bytePositionToPercentage(
  bytePosition: number,
  totalBytes: number
): number {
  if (totalBytes === 0) return 0;
  return Math.min(1.0, Math.max(0.0, bytePosition / totalBytes));
}

/**
 * Convert chapter and progress percentage to byte position
 * This is more accurate than just using the chapter boundary,
 * as it accounts for progress within the chapter
 *
 * @param chapter - Current chapter number
 * @param progressPercentage - Overall progress percentage (0-100)
 * @param chapterBoundaries - Object mapping chapter numbers to byte offsets
 * @param totalBytes - Total file size in bytes
 * @returns Byte offset
 */
export function chapterProgressToBytePosition(
  chapter: number,
  progressPercentage: number,
  chapterBoundaries: Record<string, number>,
  totalBytes: number
): number {
  // Simply convert percentage to bytes
  const percentage = progressPercentage / 100;
  return Math.floor(percentage * totalBytes);
}

/**
 * Estimate chapter progress percentage from byte position
 *
 * @param bytePosition - Current byte position
 * @param chapter - Current chapter number
 * @param chapterBoundaries - Object mapping chapter numbers to byte offsets
 * @param totalBytes - Total file size in bytes
 * @returns Progress percentage within the chapter (0-100)
 */
export function estimateChapterProgress(
  bytePosition: number,
  chapter: number,
  chapterBoundaries: Record<string, number>,
  totalBytes: number
): number {
  const chapterOffset = chapterBoundaries[chapter.toString()] || 0;

  // Find the next chapter's offset (or use totalBytes if this is the last chapter)
  const chapters = Object.entries(chapterBoundaries)
    .map(([ch, offset]) => ({ chapter: parseInt(ch), offset }))
    .sort((a, b) => a.offset - b.offset);

  const currentChapterIndex = chapters.findIndex((c) => c.chapter === chapter);

  const nextChapterOffset =
    currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1
      ? chapters[currentChapterIndex + 1].offset
      : totalBytes;

  // Calculate progress within this chapter
  const chapterBytes = nextChapterOffset - chapterOffset;
  if (chapterBytes === 0) return 0;

  const bytesIntoChapter = bytePosition - chapterOffset;
  const chapterProgress = Math.min(
    100,
    Math.max(0, (bytesIntoChapter / chapterBytes) * 100)
  );

  return Math.round(chapterProgress);
}

/**
 * Resolve conflict between two progress states
 * Uses last-write-wins strategy with a grace period for higher progress
 *
 * @param state1 - First progress state
 * @param state2 - Second progress state
 * @returns The winning progress state
 */
export function resolveProgressConflict(
  state1: { percentage: number; timestamp: Date },
  state2: { percentage: number; timestamp: Date }
): "state1" | "state2" {
  const time1 = state1.timestamp.getTime();
  const time2 = state2.timestamp.getTime();
  const timeDiff = Math.abs(time1 - time2);

  // Grace period: 5 minutes (300000 ms)
  const GRACE_PERIOD_MS = 300000;

  // If timestamps are within grace period, prefer higher progress
  if (timeDiff < GRACE_PERIOD_MS) {
    return state1.percentage >= state2.percentage ? "state1" : "state2";
  }

  // Otherwise, use last-write-wins
  return time1 > time2 ? "state1" : "state2";
}
