"use server";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import EPub from "epub";
import EpubGen from "epub-gen";
import nodemailer from "nodemailer";
import { updateFanfic } from "../db/db";
import type { Fanfic } from "../db/types";
import { downloadFanfic } from "./ao3Client";
import { ENV } from "../config";
import { translateChapter, translateMetadata } from "@/server/translator";

const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);

interface Chapter {
  title: string;
  id: string;
}

export async function KindleSender(
  fanfic: Fanfic,
  kindleEmail: string,
  translationLanguage: string | null
) {
  const startingChapter = fanfic.latestStartingChapter;
  const shouldTranslate = Boolean(
    fanfic.language &&
      translationLanguage &&
      fanfic.language !== translationLanguage
  );
  const fileName = `${fanfic.title.replace(" ", "_")}.epub`;
  const downloadPath = path.resolve(`/tmp/${fileName}`);
  let title = fanfic.title;
  let author = fanfic.author;

  try {
    await downloadFanfic(fanfic.downloadLink, downloadPath);
    console.log({ startingChapter, shouldTranslate });
    if (shouldTranslate) {
      console.log("Translating");

      const { translatedTitle, translatedAuthor } = await translateMetadata({
        title: fanfic.title,
        author: fanfic.author,
      });

      title = translatedTitle;
      author = translatedAuthor;
    }
    if (shouldTranslate || startingChapter) {
      const chapters = await ParseFanfic(
        downloadPath,
        startingChapter,
        shouldTranslate
      );

      const data = {
        title: title,
        author: author,
        publisher: "https://archiveofourown.org",
        content: chapters,
      };

      await buildNewEpub(data, downloadPath);
    }

    const stats = await statAsync(downloadPath);
    if (stats.size === 0) {
      await unlinkAsync(downloadPath);
      throw new Error("Downloaded file is empty.");
    }

    await sendToKindle(kindleEmail, title, fileName, downloadPath);

    await unlinkAsync(downloadPath);

    updateFanfic(fanfic.id, { lastSent: new Date(Date.now()) });

    console.log("am i here???");
    return { success: true, message: "" };
  } catch (error) {
    let errorMessage =
      (typeof error === "string" && error) ||
      (error instanceof Error && error.message) ||
      "";

    if (
      errorMessage.includes("The model is overloaded. Please try again later")
    ) {
      errorMessage =
        "Gemini Translation is unavailable. Please try again later.";
    }

    if (fs.existsSync(downloadPath)) {
      await unlinkAsync(downloadPath);
    }
    return { success: false, message: errorMessage };
  }
}

async function ParseFanfic(
  downloadPath: string,
  startingChapter: number | null,
  shouldTranslate: boolean
) {
  const epub = new EPub(downloadPath);
  const chapters: { data: string; title: string }[] = [];

  epub.on("end", async (_, reject) => {
    try {
      const startingSlice = startingChapter || 0;
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
    } catch (error) {
      reject(error);
    }
  });

  await epub.parse();

  return chapters;
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

  console.log({ mailOptions });
  await transporter.sendMail(mailOptions);
  console.log("hello");
}
