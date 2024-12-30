export async function Header({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center pt-10">
      <div className="text-2xl font-bold pl-10 pb-3">{title}</div>
      <div className="pr-4 ">
        <div className="gap-4 flex flex-row">{children}</div>
      </div>
    </div>
  );
}
