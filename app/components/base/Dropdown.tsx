import { Tooltip } from "@/components/base/Tooltip";
import {
	DropdownMenu as BaseDropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Item = {
	value?: string | boolean | number | null;
	// biome-ignore lint/suspicious/noExplicitAny: It could be anything here
	onSelect: (...args: any[]) => void;
	title: string;
};

export function DropdownMenu({
	tooltip,
	trigger,
	items,
}: { tooltip: string; trigger: React.ReactNode; items: Item[] }) {
	return (
		<BaseDropdownMenu>
			<Tooltip description={tooltip}>
				<DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
			</Tooltip>
			<DropdownMenuContent>
				{items.map((item) => (
					<DropdownMenuItem
						key={item.title}
						onSelect={() => item.onSelect(item.value)}
					>
						<span>{item.title}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</BaseDropdownMenu>
	);
}
