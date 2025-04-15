import { Help } from "@/(top-bar)/(components)/Help";
import { ClipboardPlus, Info, ListPlus, Search, SendHorizontal, Trash2 } from "lucide-react";

const HELP_DESCRIPTION = "Add your fanfics to your library and organize them into sections.";

export function LibraryHelp({ showAsPage, trigger }: { showAsPage?: boolean; trigger?: React.ReactNode }) {
  const helpContent = [
    {
      icon: <ClipboardPlus />,
      content: `Copy to your Clipboard a valid Fanfic link from a supported site (e.g. https://archiveofourown.org/works/1234567890).\n
Pressing on the Clipboard icon will add the fanfic to your library.`,
    },
    {
      icon: <ListPlus />,
      content: "Use the Plus icon to create new sections.",
    },
    {
      icon: <SendHorizontal />,
      content: "Right click on a section to transfer it to different locations",
    },
    {
      icon: <Trash2 />,
      content: "Right click on a section to delete it",
    },
    {
      icon: <Search />,
      content: "Use the Search bar to find fanfics by title or content.",
    },
  ];

  return showAsPage ? (
    <div className="flex flex-col items-center justify-center min-h-[calc(50vh-4rem)] mx-auto p-4 w-full sm:w-auto">
      <p className="text-xl text-muted-foreground mb-6 flex flex-row items-center">
        In This Page you can {HELP_DESCRIPTION}
      </p>
      <div className="flex flex-col gap-4 w-full">
        {helpContent.map(({ icon, content }) => (
          <div key={content} className="flex flex-row items-start gap-3 text-sm w-full">
            <div className="flex items-center justify-center p-1 h-6 w-6 text-muted-foreground shrink-0">{icon}</div>
            <p className="text-muted-foreground leading-tight pt-0.5 whitespace-pre-line break-words max-w-[calc(100%-2rem)]">
              {content}
            </p>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <Help title="Library" description={HELP_DESCRIPTION} helpContent={helpContent} trigger={trigger} />
  );
}
