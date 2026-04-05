import { Text, Input, Button, Label } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { DeleteFilled } from "@fluentui/react-icons";
import type { IEntry } from "./types/IEntry";
import React from "react";
import { calculateHandicap } from "./lib/util";

const EMPTY_ENTRY = (): IEntry => ({
	id: crypto.randomUUID(),
	date: new Date(),
	courseName: "",
	courseRating: 0,
	slopeRating: 0,
	score: 0,
});

function App() {
	const [entries, setEntries] = React.useState<IEntry[]>([EMPTY_ENTRY()]);
	const [handicapVisible, setHandicapVisible] = React.useState(false);
	const [courseRatingInput, setCourseRatingInput] = React.useState<Record<string, string>>({});

	const columnHeaders = ["Date", "Course Name", "Course Rating", "Slope Rating", "Score"];

	const parseDateFromString = React.useCallback((dateString: string): Date => {
		const [month, day, year] = dateString.trim().split("/").map(Number);
		return new Date(year, month - 1, day);
	}, []);

	const newEntry = (): void => {
		const entry = EMPTY_ENTRY();
		setEntries((prev) => [...prev, entry]);
	};

	const updateEntry = (id: string, field: keyof IEntry, value: string | number | Date): void => {
		setEntries((prev) =>
			prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
		);
	};

	const removeEntry = (id: string): void => {
		setEntries((prev) => prev.filter((e) => e.id !== id));
		setCourseRatingInput((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
		setHandicapVisible(false);
	};

	return (
		<div className="flex flex-col h-full w-full m-0">
			{/* Header */}
			<div className="flex flex-row flex-wrap justify-between items-center bg-(--background) text-white min-h-[50px] w-full box-border p-3">
				<Text size={600} weight={"semibold"}>
					Golf Handicap Calculator
				</Text>
				<Button
					onClick={newEntry}
					appearance="secondary"
					className="items-center text-xl min-w-[150px]!"
				>
					Add Entry
				</Button>
			</div>
			<div>
				<p className="text-lg font-semibold p-2">
					To get started, add at least three entries, then click "Calculate Handicap".
				</p>
				<p className="p-2 mb-5">
					The calculator removes your highest and lowest scores, then averages the handicap
					differential of the remaining scores to determine your handicap index. The formula for
					handicap differential is <strong>(Score - Course Rating) * 113 / Slope Rating</strong>.
					Your handicap index is rounded to one decimal place.
				</p>
			</div>
			<div className="flex flex-col flex-1 box-border p-2 mx-2 overflow-y-auto">
				<div className="flex flex-row w-full box-border p-1 gap-10">
					<div className="w-10 min-w-10 shrink-0" />
					{columnHeaders.map((header) => (
						<Label key={header} size="large" weight="semibold" className="flex-1 text-center! p-1">
							{header}
						</Label>
					))}
				</div>
				{entries.map((entry) => (
					<div key={entry.id} className="flex flex-row w-full box-border p-1 gap-10 mb-2">
						<div className="w-10! min-w-10! shrink-0!">
							<Button appearance="subtle" onClick={() => removeEntry(entry.id)}>
								<DeleteFilled className="text-xl items-center" />
							</Button>
						</div>
						<DatePicker
							className="flex flex-1 text-center p-1"
							value={entry.date}
							onSelectDate={(date) => date && updateEntry(entry.id, "date", date)}
							showGoToToday={true}
							allowTextInput={true}
							highlightCurrentMonth={false}
							highlightSelectedMonth={true}
							formatDate={(date?: Date) => (date ? date.toLocaleDateString() : "")}
							initialPickerDate={entry.date ?? new Date()}
							parseDateFromString={parseDateFromString}
						/>
						<Input
							value={entry.courseName}
							onChange={(e) => updateEntry(entry.id, "courseName", e.target.value)}
							className="flex flex-1 text-center p-1"
						/>
						<Input
							type="number"
							step="0.1"
							inputMode="decimal"
							value={courseRatingInput[entry.id] ?? entry.courseRating.toString()}
							onChange={(e) => {
								setCourseRatingInput((prev) => ({ ...prev, [entry.id]: e.target.value }));
							}}
							onBlur={() => {
								const raw = courseRatingInput[entry.id];
								if (raw === undefined || raw.trim() === "") {
									setCourseRatingInput((prev) => {
										const next = { ...prev };
										delete next[entry.id];
										return next;
									});
									return;
								}

								const parsed = Number(raw);
								if (!Number.isNaN(parsed)) {
									updateEntry(entry.id, "courseRating", parsed);
								}
								setCourseRatingInput((prev) => {
									const next = { ...prev };
									delete next[entry.id];
									return next;
								});
							}}
							className="flex flex-1 text-center p-1"
						/>
						<Input
							type="number"
							value={entry.slopeRating.toString()}
							onChange={(e) => updateEntry(entry.id, "slopeRating", Number(e.target.value))}
							className="flex flex-1 text-center p-1"
						/>
						<Input
							type="number"
							value={entry.score.toString()}
							onChange={(e) => updateEntry(entry.id, "score", Number(e.target.value))}
							className="flex flex-1 text-center p-1"
						/>
					</div>
				))}
				<div className="flex flex-col items-center">
					<Button
						appearance="primary"
						disabled={
							entries.filter(
								(entry) => entry.score > 0 && entry.courseRating > 0 && entry.slopeRating > 0
							).length < 3
						}
						onClick={() => {
							setHandicapVisible(true);
						}}
					>
						Calculate Handicap
					</Button>
				</div>
				<div>
					{handicapVisible && (
						<Text size={500} weight="semibold">
							Your Handicap: {calculateHandicap(entries)}
						</Text>
					)}
				</div>
			</div>
			<div className="flex bg-(--background) w-full min-h-[50px]"></div>
		</div>
	);
}

export default App;
