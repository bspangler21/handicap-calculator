import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SortBy, SortOrder } from "@/types/sort";

interface SortControlsProps {
	sortBy: SortBy;
	order: SortOrder;
	onSortByChange: (value: SortBy) => void;
	onOrderChange: (value: SortOrder) => void;
}

// Value -> label maps. Base UI's Select.Value reads these (via the `items` prop)
// so the closed trigger shows the label ("Date") instead of the raw value ("date"),
// even while the option list is unmounted.
const SORT_BY_LABELS: Record<SortBy, string> = {
	date: "Date",
	course: "Course",
	score: "Score",
};
const ORDER_LABELS: Record<SortOrder, string> = {
	asc: "Ascending",
	desc: "Descending",
};

export function SortControls({ sortBy, order, onSortByChange, onOrderChange }: SortControlsProps) {
	return (
		<div className="flex w-full flex-col gap-2 px-1 pb-2 sm:flex-row sm:items-center sm:gap-6">
			<div className="flex flex-1 items-center gap-2 sm:flex-none">
				<label id="sort-by-label" className="text-sm font-semibold whitespace-nowrap text-app-foreground">
					Sort by
				</label>
				<Select
					items={SORT_BY_LABELS}
					value={sortBy}
					onValueChange={(v) => onSortByChange(v as SortBy)}
				>
					<SelectTrigger aria-labelledby="sort-by-label">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="date">Date</SelectItem>
						<SelectItem value="course">Course</SelectItem>
						<SelectItem value="score">Score</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="flex flex-1 items-center gap-2 sm:flex-none">
				<label id="order-label" className="text-sm font-semibold whitespace-nowrap text-app-foreground">
					Order
				</label>
				<Select
					items={ORDER_LABELS}
					value={order}
					onValueChange={(v) => onOrderChange(v as SortOrder)}
				>
					<SelectTrigger aria-labelledby="order-label">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="asc">Ascending</SelectItem>
						<SelectItem value="desc">Descending</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
