"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "@/config";

const ERROR_MESSSAGE = "***ERROR FOUND***";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const translationBookPrompt = `
	You are a book translator. You should translate content provided in the context and tone of the writer. Make sure to add newlines, commas and other styling
	when required.
	Try to handle typos and writing inconsistencies as a writing editor might. If you encounter an unknown word, try to decipher it to the best of your ability. 
	If you encounter an error during the process of translation and you are unable to continue, please do not return the translated content. 
	Instead, write - ${ERROR_MESSSAGE} with an appropriate error and return.
	
	Content to translate:
	`;

const translationBookMetadataPrompt = `
	You are a translator. You are to translates values provided from a json format. Return it in a raw json format without additional input
	for example, if you recieve a json of {"title": "שלום", "author": "הגר"}, 
	return a raw json string with a translated prefix - ie {"translatedTitle": "hello", "translatedAuthor": "Hagar"}
	or {"chapterTitle": "אני הולך"} - return it as {"translatedChapterTitle": "I'm going"}
	
	Content to translate:
	`;

export async function translateChapter(
  chapterText: string,
  chapterTitle: string
) {
  const response = await model.generateContentStream(
    `${translationBookPrompt}\n${chapterText}`
  );
  let chapterChunks = "";
  for await (const chunk of response.stream) {
    const chunkText = chunk.text();
    chapterChunks += chunkText;
  }
  const { translatedChapterTitle } = await translateMetadata({
    chatperTitle: chapterTitle,
  });
  return {
    title: translatedChapterTitle,
    data: chapterChunks,
  };
}

export async function translateMetadata(contents: object) {
  const metadata = JSON.stringify({ contents });
  const result = await model.generateContent(
    `${translationBookMetadataPrompt}\n${metadata}`
  );
  const response =  result.response;
  return JSON.parse(response.text());
}
