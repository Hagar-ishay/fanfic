import { Help } from "@/(top-bar)/(components)/Help";
import {
  ClipboardPlus,
  ListPlus,
  Search,
  SendHorizontal,
  Trash2,
} from "lucide-react";

const HELP_DESCRIPTION =
  "Add your fanfics to your library and organize them into sections.";

export function LibraryHelp() {
  const helpContent = [
    {
      icon: <ClipboardPlus />,
      content:
        "Paste a valid Fanfic link from a supported site into the clipboard to add it (e.g. https://archiveofourown.org/works/1234567890)",
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

  return (
    <Help
      title="Library"
      description={HELP_DESCRIPTION}
      helpContent={helpContent}
    />
  );
}
