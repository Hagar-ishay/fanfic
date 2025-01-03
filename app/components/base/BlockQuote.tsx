export function BlockQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-2 border-muted pl-4 text-sm italic text-muted-foreground">
      {children}
    </blockquote>
  );
}
