import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Trash2 } from "lucide-react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import type { IEntry } from "@/types/IEntry";
import { Input } from "@/components/ui/input";

interface EntryRowProps {
	entry: IEntry;
	onUpdate: (id: string, field: keyof IEntry, value: string | number | Date) => void;
	onRemove: (id: string) => void;
	onResetHandicap: () => void;
}

function formatDate(date: Date | undefined): string {
	if (!date) return "";
	return date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const INPUT_CONTAINER_CLASS = "flex flex-col min-w-0 flex-1 p-1";
const INPUT_LABEL_CLASS = "mb-1 text-sm font-semibold sm:hidden";
const INPUT_FIELD_CLASS =
	"w-full rounded border border-input-border bg-input-bg px-2 py-1 text-input-text";

export function EntryRow({ entry, onUpdate, onRemove, onResetHandicap }: EntryRowProps) {
	const [open, setOpen] = React.useState(false);
	const [month, setMonth] = React.useState<Date>(entry.date);
	const [dateInput, setDateInput] = React.useState(() => formatDate(entry.date));
	const [courseRatingInput, setCourseRatingInput] = React.useState<string | undefined>(undefined);
	const [slopeRatingInput, setSlopeRatingInput] = React.useState<string | undefined>(undefined);
	const [scoreInput, setScoreInput] = React.useState<string | undefined>(undefined);

	return (
		<div
			className="mb-2 flex w-full flex-col gap-2 rounded-md bg-surface p-1 shadow-[0_1px_3px_rgba(0,0,0,0.12)]
  sm:mb-5 sm:flex-row sm:items-stretch sm:gap-10"
		>
			<div className="flex justify-end px-1 pt-1 sm:hidden">
				<button
					type="button"
					onClick={() => onRemove(entry.id)}
					className="flex h-8 w-8 items-center justify-center rounded text-red-600"
					aria-label={`Delete entry ${entry.courseName || ""}`.trim()}
				>
					<Trash2 className="h-5 w-5" />
				</button>
			</div>

			<div className="hidden w-10 min-w-10 items-center sm:flex">
				<button
					type="button"
					onClick={() => onRemove(entry.id)}
					className="flex h-8 w-8 items-center justify-center rounded text-red-600"
					aria-label={`Delete entry ${entry.courseName || ""}`.trim()}
				>
					<Trash2 className="h-5 w-5" />
				</button>
			</div>

			<div className={INPUT_CONTAINER_CLASS}>
				<label className={INPUT_LABEL_CLASS}>Date</label>
				<InputGroup className="bg-input-bg!">
					<InputGroupInput
						value={dateInput}
						placeholder="June 01, 2025"
						onChange={(e) => setDateInput(e.target.value)}
						onBlur={() => {
							const parsed = new Date(dateInput);
							if (!isNaN(parsed.getTime())) {
								onUpdate(entry.id, "date", parsed);
								setMonth(parsed);
							}
						}}
						onKeyDown={(e) => {
							if (e.key === "ArrowDown") {
								e.preventDefault();
								setOpen(true);
							}
						}}
					/>
					<InputGroupAddon align="inline-end">
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger
								render={
									<InputGroupButton variant="ghost" size="icon-xs" aria-label="Select date">
										<CalendarIcon />
										<span className="sr-only">Select date</span>
									</InputGroupButton>
								}
							/>
							<PopoverContent
								className="w-auto overflow-hidden p-0"
								align="end"
								alignOffset={-8}
								sideOffset={10}
							>
								<Calendar
									className="text-input-text"
									mode="single"
									selected={entry.date}
									month={month}
									onMonthChange={setMonth}
									onSelect={(date) => {
										if (date) {
											onUpdate(entry.id, "date", date);
											setDateInput(formatDate(date));
											setMonth(date);
										}
										setOpen(false);
									}}
								/>
							</PopoverContent>
						</Popover>
					</InputGroupAddon>
				</InputGroup>
			</div>

			<div className={INPUT_CONTAINER_CLASS}>
				<label className={INPUT_LABEL_CLASS}>Course Name</label>
				<Input
					type="text"
					value={entry.courseName}
					onChange={(e) => onUpdate(entry.id, "courseName", e.target.value)}
					className={INPUT_FIELD_CLASS}
				/>
			</div>

			<div className={INPUT_CONTAINER_CLASS}>
				<label className={INPUT_LABEL_CLASS}>Course Rating</label>
				<Input
					type="number"
					step="0.1"
					value={courseRatingInput ?? entry.courseRating.toString()}
					onChange={(e) => {
						setCourseRatingInput(e.target.value);
						onResetHandicap();
					}}
					onBlur={() => {
						if (!courseRatingInput || courseRatingInput.trim() === "") {
							setCourseRatingInput(undefined);
							return;
						}
						const parsed = Number(courseRatingInput);
						if (!Number.isNaN(parsed)) onUpdate(entry.id, "courseRating", parsed);
						setCourseRatingInput(undefined);
					}}
					className={INPUT_FIELD_CLASS}
				/>
			</div>

			<div className={INPUT_CONTAINER_CLASS}>
				<label className={INPUT_LABEL_CLASS}>Slope Rating</label>
				<Input
					type="number"
					value={slopeRatingInput ?? entry.slopeRating.toString()}
					onChange={(e) => {
						setSlopeRatingInput(e.target.value);
						onResetHandicap();
					}}
					onBlur={() => {
						if (!slopeRatingInput || slopeRatingInput.trim() === "") {
							setSlopeRatingInput(undefined);
							return;
						}
						const parsed = Number(slopeRatingInput);
						if (!Number.isNaN(parsed)) onUpdate(entry.id, "slopeRating", parsed);
						setSlopeRatingInput(undefined);
					}}
					className={INPUT_FIELD_CLASS}
				/>
			</div>

			<div className={INPUT_CONTAINER_CLASS}>
				<label className={INPUT_LABEL_CLASS}>Score</label>
				<Input
					type="number"
					value={scoreInput ?? entry.score.toString()}
					onChange={(e) => {
						setScoreInput(e.target.value);
						onResetHandicap();
					}}
					onBlur={() => {
						if (!scoreInput || scoreInput.trim() === "") {
							setScoreInput(undefined);
							return;
						}
						const parsed = Number(scoreInput);
						if (!Number.isNaN(parsed)) onUpdate(entry.id, "score", parsed);
						setScoreInput(undefined);
					}}
					className={INPUT_FIELD_CLASS}
				/>
			</div>
		</div>
	);
}