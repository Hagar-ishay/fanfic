import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Header({
  segments,
  children,
}: {
  segments: { label: string; href: string }[];
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center sticky top-16 bg-background/80 backdrop-blur-sm z-40 shadow-md py-6">
      <div className="pl-10 pb-3">
        <Breadcrumb>
          <BreadcrumbList className="flex flex-row text-2xl font-bold items-center">
            {segments.map((segment, index) => (
              <BreadcrumbItem className="font-semibold" key={segment.href}>
                <BreadcrumbLink href={segment.href}>
                  {segment.label}
                </BreadcrumbLink>
                {segments.length > index + 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="pr-4 ">
        <div className="gap-4 flex flex-row">{children}</div>
      </div>
    </div>
  );
}
