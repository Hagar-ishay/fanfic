import { notFound } from "next/navigation";
import React from "react";
import { getFanficById } from "@/db/fanfics";
import Fanfic from "@/library/sections/[sectionId]/@fanfics/fanfics/[sectionFanficId]/(components)/Fanfic";
import { currentUser } from "@clerk/nextjs/server";
import { listUserSections } from "@/db/sections";
import { connection } from "next/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sectionId: string; sectionFanficId: string }>;
}) {
  await connection();
  const requestParams = await params;
  const sectionId = parseInt(requestParams.sectionId);
  const fanficId = parseInt(requestParams.sectionFanficId);
  const fanfic = await getFanficById(fanficId);
  if (!fanfic || fanfic.sectionId !== sectionId) {
    notFound();
  }
  const displayName = fanfic.title;
  return {
    title: `Penio Fanfic - ${displayName}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ sectionId: string; sectionFanficId: string }>;
}) {
  await connection();
  const requestParams = await params;
  const user = await currentUser();
  const sectionId = parseInt(requestParams.sectionId);
  const fanficId = parseInt(requestParams.sectionFanficId);
  const fanfic = await getFanficById(fanficId);
  if (!user || !fanfic || fanfic.sectionId !== sectionId) {
    notFound();
  }

  const userSections = await listUserSections(user.id);
  const transferableSections = userSections.filter(
    (section) => section.id !== sectionId
  );

  return (
    <div className="w-full">
      <Fanfic fanfic={fanfic} transferableSections={transferableSections} />
    </div>
  );
}
