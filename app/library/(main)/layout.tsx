import { AddNewSectionButton } from "@/library/(components)/AddNewSectionButton";
import { Header } from "@/library/(components)/Header";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header title="Library">
        <AddNewSectionButton sectionId={null} />
      </Header>
      {children}
    </>
  );
}
