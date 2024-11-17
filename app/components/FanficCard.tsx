import SendToKindle from "@/components/SendToKindle";
import { Tooltip } from "@/components/base/Tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import * as consts from "@/consts";
import type { Fanfic, Section } from "@/db/types";
import { cn } from "@/lib/utils";
import type { action } from "@/routes/api.sections.$sectionId.fanfics.$fanficId.send-to-kindle";
import { useFetcher } from "@remix-run/react";
import { CircleCheck, CircleChevronRight, ExpandIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function FanficCard({
	fanfic,
	sectionId,
	isDragging,
	transferableSections,
	onTranfserSection,
}: {
	fanfic: Fanfic;
	sectionId: number;
	isDragging: boolean;
	transferableSections: Section[];
	onTranfserSection: (
		newSectionId: number,
		fanficId: number,
		oldSectionId: number,
	) => void;
}) {
	const fetcher = useFetcher<typeof action>();

	React.useEffect(() => {
		if (fetcher.data?.success) {
			toast(`Fanfic ${fanfic.title} deleted`);
		} else if (fetcher.data && !fetcher.data.success && fetcher.data.message) {
			toast.error(`Failed deleting fanfic: ${fanfic.title}`);
		}
	}, [fetcher.data, fanfic.title]);

	const TagList = ({ category }: { category: string }) => {
		const values = fanfic.tags[category];
		return values?.map((value) => (
			<Badge className="w-fit" key={value} title={category.toLowerCase()}>
				{value}
			</Badge>
		));
	};

	const Description = () => {
		return fanfic.summary?.split("\n").map((line, index) => (
			<span key={index}>
				{line}
				<br />
			</span>
		));
	};

	const Title = ({ showComplete }: { showComplete: boolean }) => {
		return (
			<>
				<h3 className="text-xl text-accent-foreground flex-row">
					<a
						href={fanfic.sourceUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline flex flex-row gap-3 items-center"
					>
						{fanfic.title}
						{showComplete && fanfic.completedAt && (
							<CircleCheck className="text-success" size="18" />
						)}
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
			</>
		);
	};

	async function handleTranfser(newSectionId: number) {
		await onTranfserSection(newSectionId, fanfic.id, sectionId);
	}

	return (
		<Card
			className={`p-2 my-2 bg-accent shadow-md rounded -space-y-4 ${isDragging ? "" : "transition-all duration-300 ease-in-out"}`}
		>
			<CardHeader>
				<div className="flex flex-row justify-between">
					<CardTitle className="flex flex-col mb-4 gap-2">
						<Title showComplete />
					</CardTitle>

					<Sheet>
						<SheetTrigger className="flex p-3">
							<Tooltip description="Expand">
								<ExpandIcon size={20} />
							</Tooltip>
						</SheetTrigger>
						<SheetContent side="bottom" className="bg-secondary ">
							<SheetHeader>
								<SheetTitle className="flex flex-col gap-2 items-center justify-center">
									<Title showComplete={false} />
								</SheetTitle>
								<SheetDescription>
									<div className="overflow-auto max-h-80 gap-1 flex flex-col mt-1 bg-secondary ml-10 mr-10">
										<Description />
									</div>
									<div className="flex flex-col flex-wrap gap-2 mt-5">
										<Separator />
										<div className="flex gap-2 flex-row flex-wrap text-xs justify-center">
											{fanfic.wordCount && (
												<Badge title="Word Count">
													Words: {fanfic.wordCount.toLocaleString()}
												</Badge>
											)}
											{fanfic.chapterCount && (
												<Badge title="Chapter Count">
													Chapters: {fanfic.chapterCount}
												</Badge>
											)}
											<TagList category={consts.TAGS.RATING} />
											<TagList category={consts.TAGS.FANDOM} />
										</div>
										<div className="flex gap-2 flex-row flex-wrap justify-center items-center text-xs">
											<Badge title="Status">
												{fanfic.completedAt ? <>Complete</> : <>In Progress</>}
											</Badge>
											<TagList category={consts.TAGS.CATEGORIES} />
											<TagList category={consts.TAGS.RELATIONSHIPS} />
										</div>
									</div>
								</SheetDescription>
							</SheetHeader>
						</SheetContent>
					</Sheet>
				</div>
			</CardHeader>

			<div>
				<CardDescription
					className={cn(
						`w-[50%] h-20 overflow-hidden text-ellipsis ml-6 transition-all duration-300 ease-in-out ${isDragging ? "h-0 opacity-0" : "h-20 opacity-100"}`,
					)}
				>
					<Description />
				</CardDescription>
				<div className="flex justify-end gap-2 items-baseline p-6">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Tooltip description="Transfer fanfic">
								<Button>
									<CircleChevronRight />
								</Button>
							</Tooltip>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							{transferableSections.map((section) => (
								<DropdownMenuItem
									key={section.id}
									onSelect={() => handleTranfser(section.id)}
								>
									<span>{section.displayName}</span>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					<SendToKindle fanfic={fanfic} sectionId={sectionId} />
				</div>
			</div>
		</Card>
	);
}
