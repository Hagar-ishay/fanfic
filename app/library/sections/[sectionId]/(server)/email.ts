"use server";
import { AO3_LINK } from "@/consts";
import { updateSectionFanfic } from "@/db/fanfics";
import type { UserFanfic } from "@/db/types";
import { getAo3Client } from "@/lib/ao3Client";
import { errorMessage } from "@/lib/utils";
import {
  translateChapter,
  translateMetadata,
} from "@/library/sections/[sectionId]/(server)/translator";
import EPub from "epub";
import EpubGen from "epub-gen";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import nodemailer from "nodemailer";
import { ENV } from "../../../../config";
import { getSettings } from "@/db/settings";
import { getUserEmailAddress, updateFanficIntegrationLastTriggered } from "@/db/integrations";

const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);

interface Chapter {
  title: string;
  id: string;
}

export async function emailSender({
  fanfic,
  sendLatestChapters,
  latestFinalChapter,
}: {
  fanfic: UserFanfic;
  sendLatestChapters: boolean;
  latestFinalChapter: number;
}) {
  const settings = await getSettings(fanfic.userId);
  const translationLanguage = settings.languageCode;
  const readerEmail = await getUserEmailAddress(fanfic.userId);
  if (!readerEmail) {
    throw new Error("No email integration configured");
  }
  const startingChapter = fanfic.latestStartingChapter
    ? fanfic.latestStartingChapter + 1
    : null;
  const shouldTranslate = Boolean(
    fanfic.language &&
      translationLanguage &&
      fanfic.language !== translationLanguage
  );
  let title = fanfic.title.trim();
  let downloadPath = path.resolve(`/tmp/${title}.epub`);
  let author = fanfic.author;

  try {
    const ao3Client = await getAo3Client();
    await ao3Client.downloadFanfic(fanfic.downloadLink, downloadPath);
    if (shouldTranslate) {
      const { translatedTitle, translatedAuthor } = await translateMetadata({
        title: title,
        author: fanfic.author,
      });

      title = translatedTitle;
      author = translatedAuthor;
    }
    if (shouldTranslate || sendLatestChapters) {
      const chapters = await ParseFanfic(
        downloadPath,
        startingChapter,
        sendLatestChapters,
        shouldTranslate
      );

      const data = {
        title: title,
        author: author,
        publisher: AO3_LINK,
        content: chapters,
      };
      await unlinkAsync(downloadPath);
      downloadPath = path.resolve(
        `/tmp/${title} - Chapters ${fanfic.latestStartingChapter} - ${latestFinalChapter}.epub`
      );
      await buildNewEpub(data, downloadPath);
    }

    const stats = await statAsync(downloadPath);
    if (stats.size === 0) {
      await unlinkAsync(downloadPath);
      throw new Error("Downloaded file is empty.");
    }

    await send(
      readerEmail,
      title,
      downloadPath.replace("/tmp/", "").trim(),
      downloadPath
    );
    await updateSectionFanfic(fanfic.sectionId, fanfic.id, {
      latestStartingChapter: latestFinalChapter,
    });
    
    // Update the fanficIntegration lastTriggered
    await updateFanficIntegrationLastTriggered(fanfic.id, fanfic.userId);

    return { success: true, message: "" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: errorMessage(error) };
  } finally {
    if (fs.existsSync(downloadPath)) {
      await unlinkAsync(downloadPath);
    }
  }
}

async function ParseFanfic(
  downloadPath: string,
  startingChapter: number | null,
  sendLatestChapters: boolean,
  shouldTranslate: boolean
) {
  const imageDir = path.resolve("/tmp/images");
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  const epub = new EPub(downloadPath); // IMAGES DO NOT WORK!!! need to set the correct path to the <img src= /> in html :/
  const chapters: { data: string; title: string }[] = [];

  return new Promise<{ data: string; title: string }[]>((resolve, reject) => {
    epub.on("end", async () => {
      try {
        const startingSlice =
          sendLatestChapters && startingChapter ? startingChapter : 0;
        for (const chapter of epub.flow.slice(startingSlice) as Chapter[]) {
          const chapterText = await getChapter(epub, chapter.id);
          if (shouldTranslate) {
            const chapterData = await translateChapter(
              chapterText,
              chapter.title
            );
            chapters.push(chapterData);
          } else {
            chapters.push({
              data: chapterText,
              title: chapter.title,
            });
          }
        }
        resolve(chapters);
      } catch (error) {
        reject(error);
      }
    });

    epub.parse();

    return chapters;
  });
}

function getChapter(epub: EPub, chapterId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    epub.getChapter(chapterId, (err, text) => {
      if (err) {
        reject(err);
      } else {
        resolve(text);
      }
    });
  });
}

async function buildNewEpub(newEpub: EpubGen.Options, downloadPath: string) {
  const tempDir = path.resolve("/tmp/tempDir");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const epub = new EpubGen(
    { ...newEpub, tempDir: tempDir } as EpubGen.Options,
    downloadPath
  );
  return epub.promise
    .then(() => {
      return {
        downloadPath: downloadPath,
        fileName: `${newEpub.title}.epub`,
        title: newEpub.title,
      };
    })
    .catch((err) => {
      throw new Error(`Failed to generate EPUB: ${err.message}`);
    });
}

export async function send(
  readerEmail: string,
  title: string,
  fileName: string,
  downloadPath: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ENV.GMAIL_EMAIL,
      pass: ENV.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: ENV.GMAIL_EMAIL,
    to: readerEmail,
    subject: title,
    text: "Please find the attached book.",
    attachments: [
      {
        filename: fileName,
        path: downloadPath,
        contentType: "application/epub+zip",
        headers: {
          "Content-Disposition": "attachment",
        },
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}
