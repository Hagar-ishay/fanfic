import { ExploreClientWrapper } from "@/explore/(components)/ExploreClientWrapper";
import { getSavedSearches } from "@/db/savedSearches";
import { auth } from "@/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penio Fanfic - Explore",
};

export default async function Page() {
  const { user } = (await auth())!;
  const savedSearches = await getSavedSearches(user.id);

  return <ExploreClientWrapper savedSearches={savedSearches} userId={user.id} />;
}
