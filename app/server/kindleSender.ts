"use server";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import EPub from "epub";
import EpubGen from "epub-gen";
import nodemailer from "nodemailer";
import { updateFanfic } from "../db/db";
import type { Fanfic } from "../db/types";
import { getAo3Client } from "./ao3Client";
import { ENV } from "../config";
import { translateChapter, translateMetadata } from "@/server/translator";
import { errorMessage } from "@/lib/utils";
import { AO3_LINK } from "@/consts";

const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);

interface Chapter {
  title: string;
  id: string;
}

export async function kindleSender({
  fanfic,
  kindleEmail,
  translationLanguage,
  sendLatestChapters,
  latestFinalChapter,
}: {
  fanfic: Fanfic;
  kindleEmail: string;
  translationLanguage: string | null;
  sendLatestChapters: boolean;
  latestFinalChapter: number;
}) {
  const startingChapter = fanfic.latestStartingChapter
    ? fanfic.latestStartingChapter + 1
    : null;
  const shouldTranslate = Boolean(
    fanfic.language &&
      translationLanguage &&
      fanfic.language !== translationLanguage
  );

  let downloadPath = path.resolve(
    `/tmp/${fanfic.title.replace(" ", " ")}.epub`
  );
  let title = fanfic.title;
  let author = fanfic.author;

  try {
    const ao3Client = await getAo3Client();
    await ao3Client.downloadFanfic(fanfic.downloadLink, downloadPath);
    if (shouldTranslate) {
      const { translatedTitle, translatedAuthor } = await translateMetadata({
        title: fanfic.title,
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
        `/tmp/${fanfic.title.replace(" ", " ")} - Chapters ${fanfic.latestStartingChapter} - ${latestFinalChapter}.epub`
      );
      await buildNewEpub(data, downloadPath);
    }

    const stats = await statAsync(downloadPath);
    if (stats.size === 0) {
      await unlinkAsync(downloadPath);
      throw new Error("Downloaded file is empty.");
    }

    await sendToKindle(
      kindleEmail,
      title,
      downloadPath.replace("/tmp/", ""),
      downloadPath
    );
    await updateFanfic(fanfic.id, {
      lastSent: new Date(Date.now()),
      latestStartingChapter: latestFinalChapter,
    });

    return { success: true, message: "" };
  } catch (error) {
    console.error("Error sending to Kindle:", error);
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
  const epub = new EpubGen(newEpub, downloadPath);

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

export async function sendToKindle(
  kindleEmail: string,
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
    to: kindleEmail,
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
