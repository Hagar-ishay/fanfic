import SendToKindle from "@/components/SendToKindle";
import { Button } from "@/components/ui/Button";
import {
	Card,
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
import type { Fanfic } from "@/db/types";
import { cn } from "@/lib/utils";
import type { action } from "@/routes/sections.$sectionId.fanfics.$fanficId.send-to-kindle";
import { useFetcher } from "@remix-run/react";
import { CircleCheck, CircleEllipsis, Trash2 } from "lucide-react";

export default function FanficCard({
	fanfic,
	sectionId,
}: {
	fanfic: Fanfic;
	sectionId: number;
}) {
	const fetcher = useFetcher<typeof action>();

	const deleteFanfic = () => {
		fetcher.submit(
			{},
			{
				method: "DELETE",
				action: `/api/sections/${sectionId}/fanfics/${fanfic.id}`,
			},
		);
	};

	const TagList = ({ category }: { category: string }) => {
		const values = fanfic.tags[category];
		return values?.map((value) => (
			<Badge className="w-fit" key={value} title={category.toLowerCase()}>
				{value}
			</Badge>
		));
	};

	return (
		<Card className={cn("p-2 my-2 bg-accent shadow-md rounded h-50")}>
			<CardHeader>
				<div className="flex flex-row justify-between items-center">
					<CardTitle className="flex flex-col mb-4 gap-1">
						<h3 className="text-xl text-accent-foreground flex-row">
							<a
								href={fanfic.sourceUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:underline flex flex-row gap-3 items-center"
							>
								{fanfic.title}
								<CircleCheck className="text-success" size="18" />
							</a>
						</h3>
						<h3 className="text-sm text-zinc-600">
							{fanfic.authorUrl ? (
								<a
									href={fanfic.authorUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:underline"
								>
									{fanfic.author}
								</a>
							) : (
								fanfic.author
							)}
						</h3>
					</CardTitle>
					<div className="flex flex-col gap-2">
						<div className="flex gap-2 flex-row justify-end">
							{fanfic.wordCount && (
								<Badge title="Word Count">
									W: {fanfic.wordCount.toLocaleString()}
								</Badge>
							)}
							<TagList category={consts.TAGS.RATING} />
							<TagList category={consts.TAGS.FANDOM} />
						</div>
						<div className="flex gap-2 flex-row">
							<TagList category={consts.TAGS.CATEGORIES} />
							<TagList category={consts.TAGS.RELATIONSHIPS} />
						</div>
					</div>
				</div>
				{fanfic.summary && (
					<CardDescription className="w-[50%] h-20 overflow-hidden text-ellipsis">
						{fanfic.summary.split("\n").map((line, index) => (
							<span key={index}>
								{line}
								<br />
							</span>
						))}
					</CardDescription>
				)}
				<div className="flex justify-end gap-2">
					<SendToKindle fanfic={fanfic} sectionId={sectionId} />
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button>
								<CircleEllipsis />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onSelect={deleteFanfic}>
								<Trash2 />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
		</Card>
	);
}
