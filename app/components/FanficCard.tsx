import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as consts from "@/consts";
import { cn } from "@/lib/utils";
import { useSectionsStore } from "@/store";
import type { Fanfic } from "@/types";
import {
	CircleEllipsis,
	RefreshCw,
	SendHorizontal,
	Trash2,
} from "lucide-react";
import type React from "react";
import { useDrag } from "react-dnd";

interface Props {
	fanfic: Fanfic;
	sectionId: string;
}

const FanficCard: React.FC<Props> = ({ fanfic, sectionId }) => {
	const deleteFanfic = useSectionsStore((state) => state.deleteFanfic);
	const [{ isDragging }, drag] = useDrag({
		type: "FANFIC",
		item: { fanficId: fanfic.id, sourceSectionId: sectionId },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const handleUpdate = () => {
		// Logic to check for updates and update fanfic.hasUpdate
	};

	const handleSendToKindle = () => {
		// Logic to send the fanfic to Kindle email address
	};

	return (
		<Card
			className={cn(
				"p-2 my-2 bg-accent shadow-md rounded",
				isDragging ? "opacity-50" : "opacity-100",
			)}
			ref={drag}
		>
			<CardHeader>
				<div className="flex flex-row justify-between items-center">
					<CardTitle className="flex flex-col mb-4 gap-1">
						<h3 className="text-xl text-accent-foreground">
							<a
								href={fanfic.sourceUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:underline"
							>
								{fanfic.title}
							</a>
						</h3>
						<h3 className="text-sm text-zinc-600">
							<a
								href={fanfic.authorUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:underline"
							>
								{fanfic.author}
							</a>
						</h3>
					</CardTitle>
					<div className="flex flex-col items-end">
						{fanfic.tags?.map(({ category, values }) => (
							<Badge variant="outline" key={category}>
								{values.join(", ")}
							</Badge>
						))}
					</div>
				</div>
				<CardDescription className="w-[50%]">{fanfic.summary}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex justify-end gap-2">
					<Button
						onClick={handleUpdate}
						disabled={
							fanfic.downloadedAt &&
							fanfic.updatedAt &&
							fanfic.downloadedAt > fanfic.updatedAt
						}
					>
						<RefreshCw />
					</Button>
					<Button onClick={handleSendToKindle}>
						<SendHorizontal />
						Kindle
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button>
								<CircleEllipsis />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onSelect={() => deleteFanfic(fanfic.id)}>
								<Trash2 />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardContent>
		</Card>
	);
};

export default FanficCard;
