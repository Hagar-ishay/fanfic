export async function Header({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center sticky top-16 bg-background/80 backdrop-blur-sm z-40 shadow-md py-6">
      <div className="text-2xl font-bold pl-10 pb-3">{title}</div>
      <div className="pr-4 ">
        <div className="gap-4 flex flex-row">{children}</div>
      </div>
    </div>
  );
}
