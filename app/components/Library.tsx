"use client";

import React, { useState, useEffect } from "react";
import { Section, UserFanfic } from "@/db/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useEmblaCarousel from "embla-carousel-react";

export default function Library({
  sections,
  userFanfics,
}: {
  sections: Section[];
  userFanfics: UserFanfic[];
}) {
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [viewportRef, embla] = useEmblaCarousel({ loop: false });

  const parentSections = sections.filter(
    (section) => section.parentId === null
  );
  const childSections = currentSection
    ? sections.filter((section) => section.parentId === currentSection.id)
    : [];
  const fanfics = currentSection
    ? userFanfics.filter(
        (userFanfic) =>
          userFanfic.section_fanfics.sectionId === currentSection.id
      )
    : [];

  const previous = currentSection?.parentId
    ? sections.find((section) => section.id === currentSection.parentId) || null
    : null;

  useEffect(() => {
    if (embla) {
      embla.reInit();
    }
  }, [currentSection, embla]);

  const handleSectionClick = (section: Section) => {
    setCurrentSection(section);
    if (embla) {
      embla.scrollTo(0, true);
    }
  };

  return (
    <div className="p-4">
      {currentSection ? (
        <div>
          {/* <Button
            size="icon"
            onClick={() => setCurrentSection(previous)}
            className="mb-4"
          >
            <ArrowLeft />
          </Button> */}
          <h2 className="text-2xl font-bold mb-4">
            {currentSection.displayName}
          </h2>
          <div className="embla" ref={viewportRef}>
            <div className="embla__container">
              {childSections.map((section) => (
                <div
                  className="embla__slide"
                  key={section.id}
                  onClick={() => handleSectionClick(section)}
                >
                  <Card className="cursor-pointer p-4 bg-gray-100 rounded-lg shadow-md">
                    <CardContent className="flex items-center p-3">
                      {section.displayName}
                    </CardContent>
                  </Card>
                </div>
              ))}
              {fanfics.map((userFanfic) => (
                <div
                  className="embla__slide"
                  key={userFanfic.section_fanfics.id}
                >
                  <Card className="p-4 bg-gray-100 rounded-lg shadow-md">
                    <CardContent>
                      <h3 className="text-lg font-semibold">
                        {userFanfic.fanfics.title}
                      </h3>
                      <p className="text-sm">{userFanfic.fanfics.summary}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Sections</h2>
          <div className="embla" ref={viewportRef}>
            <div className="embla__container flex flex-col ">
              {parentSections.map((section) => (
                <Button
                  className="embla__slide p-4 bg-muted border rounded-none justify-start border-none shadow-none h-fit"
                  key={section.id}
                  onClick={() => handleSectionClick(section)}
                >
                  {section.displayName}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
