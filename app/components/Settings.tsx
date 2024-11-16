import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
import { useState } from "react";

export function SettingsModal() {
	const setEmail = useSettingsStore((state) => state.setEmail);
	const kindleEmail = useSettingsStore((state) => state.kindleEmail);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		const form = event.target as HTMLFormElement;
		const emailInput = form.elements.namedItem("email") as HTMLInputElement;
		const email = emailInput.value;
		setEmail(email);
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>
					<SettingsIcon />
				</Button>
			</SheetTrigger>
			<SheetContent className="flex flex-col gap-3" side={"bottom"}>
				<form onSubmit={handleSubmit}>
					<SheetHeader>
						<SheetTitle>Settings</SheetTitle>
						<SheetDescription>
							Configuration here is kept in your browser's cache
						</SheetDescription>
					</SheetHeader>
					<div className="gap-4 py-4">
						<Input
							id="email"
							name="email"
							defaultValue={kindleEmail}
							placeholder="Kindle email"
						/>
					</div>
					<SheetFooter>
						<SheetClose asChild>
							<Button type="submit">Save changes</Button>
						</SheetClose>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
