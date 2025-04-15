import { Header } from "@/components/base/Header";
import { Button } from "@/components/ui/button";
import { SearchBuilder } from "@/explore/(components)/SearchBuilder";
import { PlusIcon } from "lucide-react";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header segments={[{ label: "Saved Searches", href: "/explore" }]}>
        {process.env.NODE_ENV === "development" && (
          <SearchBuilder
            trigger={
              <Button>
                <PlusIcon />
              </Button>
            }
          />
        )}
      </Header>
      <div className="flex-grow">{children}</div>
    </div>
  );
}
