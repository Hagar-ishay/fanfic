"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { errorMessage } from "@/lib/utils";
import { SavedSearch, UserFanfic } from "@/db/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const recommendFanficsPrompt = `
	You are a recommendation engine. You are to recommend fanfics to the user based on their interests.
    You are given a list of saved search queries the user has made.
    You are to recommend at least 3 fanfics to the user based on the search queries
    and based on the fanfics the user has already read and liked.
    Do not recommend fanfics that the user already has in their library.
    Search only in AO3 site for new fanfics to recommend based on the search queries.

    You are to return the fanfics in a json format with the following fields:
    - workId
    - title
    - author
    - description
    - tags
    - status
    - completed
    - chapters
    - words
	`;

export async function recommendFanfics({
  savedSearchQueries,
  allFanfics,
}: {
  savedSearchQueries: SavedSearch[];
  allFanfics: UserFanfic[];
}) {
  const likedFanfics = allFanfics
    .filter((fanfic) => fanfic.kudos)
    .sort((a, b) => {
      return Number(b.creationTime) - Number(a.creationTime);
    })
    .map(({ externalId, title, author, summary, tags, editableLabels }) => ({
      workId: externalId,
      title,
      author,
      summary,
      tags,
      userLabels: editableLabels,
    }))
    .slice(0, 10);
  const allFanficsWorkIds = allFanfics.map((fanfic) => fanfic.externalId);
  const savedSearchQueriesString = savedSearchQueries.map((query) => JSON.stringify(query.search)).join(", ");
  try {
    const response = await model.generateContentStream(
      `${recommendFanficsPrompt}
        \nList of saved search queries: ${savedSearchQueriesString}
        \nList of all fanfics work ids: ${allFanficsWorkIds.join(", ")}
        \nList of liked fanfics and their details: ${JSON.stringify(likedFanfics)}`
    );
    let fanfics = "";
    for await (const chunk of response.stream) {
      fanfics += chunk.text();
    }
    return JSON.parse(fanfics);
  } catch (error) {
    if (errorMessage(error).includes("The model is overloaded. Please try again later")) {
      throw Error("Recommendation is unavailable. Please try again later.");
    }
    throw error;
  }
}
