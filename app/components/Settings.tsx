import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/store";
import { Settings } from "lucide-react";
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
		setIsDialogOpen(false);
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button>
					<Settings />
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Settings</DialogTitle>
						<DialogDescription>
							Configuration here is kept in your browser's cache
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="email" className="text-right">
								Kindle Email
							</Label>
							<Input
								id="email"
								name="email"
								defaultValue={kindleEmail}
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Save changes</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
