import { BlockQuote } from "@/components/base/BlockQuote";

function formatLine(text: string) {
  if (text.startsWith("_") && text.endsWith("_") && text.length > 2) {
    return <span className="italic">{text.slice(1, -1)}</span>;
  }
  return text;
}

export function SummaryContent({ summary }: { summary: string }) {
  const lines = summary
    .split("\n")
    .reduce((acc: JSX.Element[], line: string, index: number) => {
      const isBlockquote = line.startsWith("> ");
      const content = formatLine(isBlockquote ? line.substring(2) : line);
      const lastElement = acc[acc.length - 1];

      if (isBlockquote && lastElement?.type === BlockQuote) {
        const updatedQuote = (
          <BlockQuote key={lastElement.key}>
            {lastElement.props.children}
            <br key={`br-${index}`} />
            {content}
          </BlockQuote>
        );
        return [...acc.slice(0, -1), updatedQuote];
      }

      const element = isBlockquote ? (
        <BlockQuote key={`quote-${index}`}>{content}</BlockQuote>
      ) : (
        <span
          key={`line-${index}`}
          className="block text-sm text-muted-foreground"
        >
          {content}
        </span>
      );

      return [...acc, element];
    }, []);

  return <div className="space-y-2 text-pretty">{lines}</div>;
}
