import { Tooltip } from "./base/Tooltip";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

import { useSettingsStore } from "../store";
import { SettingsIcon } from "lucide-react";
import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "./ui/switch";

export function SettingsModal() {
  const setEmail = useSettingsStore((state) => state.setEmail);
  const setLanguageCode = useSettingsStore((state) => state.setLanguageCode);
  const kindleEmail = useSettingsStore((state) => state.kindleEmail);

  const [shouldTranslate, setShouldTranslate] = React.useState(
    useSettingsStore((state) => Boolean(state.languageCode))
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    setEmail(emailInput.value);
    setLanguageCode((shouldTranslate ? "en" : null) || null);
  };

  return (
    <Sheet>
      <Tooltip description="Settings">
        <SheetTrigger asChild>
          <Button size="icon" className="w-10">
            <SettingsIcon />
          </Button>
        </SheetTrigger>
      </Tooltip>
      <SheetContent
        className="flex flex-col gap-3 justify-center items-center"
        side={"bottom"}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
              <SheetDescription>
                Configuration here is kept in your browser's cache
              </SheetDescription>
            </SheetHeader>
            <div className="gap-5 py-4 flex flex-col">
              <Input
                id="email"
                name="email"
                defaultValue={kindleEmail}
                placeholder="Kindle email"
              />
              <div className="flex flex-row gap-2 justify-between text-sm font-medium">
                <Label className="ml-1">Translate to English</Label>
                <Switch
                  id="enableTranslation"
                  name="enableTranslation"
                  checked={shouldTranslate}
                  onCheckedChange={() => setShouldTranslate(!shouldTranslate)}
                />
              </div>
              <Separator />
            </div>

            <SheetFooter className="">
              <SheetClose asChild>
                <Button type="submit">Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
