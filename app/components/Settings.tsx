import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
import { useSettingsStore } from "@/store";
import { SettingsIcon } from "lucide-react";
import React from "react";

export function SettingsModal() {
	const setEmail = useSettingsStore((state) => state.setEmail);
	const setLanguageCode = useSettingsStore((state) => state.setLanguageCode);
	const kindleEmail = useSettingsStore((state) => state.kindleEmail);

	const [shouldTranslate, setShouldTranslate] = React.useState(
		useSettingsStore((state) => Boolean(state.languageCode)),
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
			<SheetTrigger>
				<Tooltip description="Settings">
					<Button>
						<SettingsIcon />
					</Button>
				</Tooltip>
			</SheetTrigger>
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

						<div className="gap-4 py-4 flex flex-col">
							<Input
								id="email"
								name="email"
								defaultValue={kindleEmail}
								placeholder="Kindle email"
							/>
							<Separator />
							<div className="flex flex-row gap-2 text-sm font-medium">
								<Checkbox
									id="enableTranslation"
									name="enableTranslation"
									checked={shouldTranslate}
									onCheckedChange={() => setShouldTranslate(!shouldTranslate)}
								/>
								<Label>Translate Fanfictions to English</Label>
							</div>
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
