import { Text, Input, Button, Label, Card, CardHeader } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { AddRegular, DeleteFilled } from "@fluentui/react-icons";
import type { IEntry } from "./types/IEntry";
import React from "react";
import { calculateHandicap } from "./lib/util";
import { FluentThemeProvider } from "./providers/FluentThemeProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ModeToggle } from "./components/ModeToggle";
import versionData from "./version.json";
import { mockScores } from "./mockData/mockScores";

const VERSION = `v1.0.${versionData.version}`;
const mockEntries: IEntry[] = mockScores;

const EMPTY_ENTRY = (): IEntry => ({
	id: crypto.randomUUID(),
	date: new Date(),
	courseName: "",
	courseRating: 0,
	slopeRating: 0,
	score: 0,
});

const createInitialEntries = (): IEntry[] =>
	window.location.hostname === "localhost"
		? [...mockEntries]
		: [EMPTY_ENTRY(), EMPTY_ENTRY(), EMPTY_ENTRY()];

function App() {
	const [entries, setEntries] = React.useState<IEntry[]>(createInitialEntries());
	const [handicapVisible, setHandicapVisible] = React.useState(false);
	const [courseRatingInput, setCourseRatingInput] = React.useState<Record<string, string>>({});

	const columnHeaders = ["Date", "Course Name", "Course Rating", "Slope Rating", "Score"];
	let csvContent = "Date,Course Name,Course Rating,Slope Rating,Score\n";

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

	const exportData = () => {
		entries.map((entry) => {
			csvContent += `${entry.date.toLocaleDateString()},${entry.courseName.replaceAll(",", "")},${entry.courseRating},${entry.slopeRating},${entry.score.toString()}\n`;
		});
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "handicap-scores.csv";
		link.click();
		URL.revokeObjectURL(url);
	};

	// const parseFile = useCallback((file: File) => {
	// 	setFileName()
	// })

	return (
		<ThemeProvider defaultTheme="light" storageKey="theme">
			<FluentThemeProvider>
				<div className="flex flex-col h-full w-full m-0 bg-app-background">
					{/* Header */}
					<div className="flex flex-row sm:flex-wrap flex-nowrap justify-between items-center bg-primary text-primary-foreground min-h-[50px] w-full box-border p-3">
						<Text className="text-base sm:text-xl font-semibold">Golf Handicap Calculator</Text>
						<div className="flex gap-3">
							<Button
								onClick={() => {
									newEntry();
									setHandicapVisible(false);
								}}
								appearance="secondary"
								className="invisible items-center text-base sm:text-lg min-w-[125px] sm:min-w-[150px]"
								icon={<AddRegular />}
							>
								Add Entry
							</Button>
							<Button
								onClick={() => {
									newEntry();
									setHandicapVisible(false);
								}}
								appearance="secondary"
								className="items-center text-base sm:text-lg min-w-[125px] sm:min-w-[150px]"
								icon={<AddRegular />}
							>
								Add Entry
							</Button>
							<ModeToggle />
						</div>
					</div>
					<div>
						<p className="text-lg text-app-foreground font-semibold p-2">
							To get started, add at least three entries, then click "Calculate Handicap".
						</p>
						<p className="text-app-foreground p-2 mb-5">
							The calculator removes your highest and lowest scores, then averages the handicap
							differential of the remaining scores to determine your handicap index. You only need 3
							scores to calculate a handicap, but the handicap will be more accurate if you add more
							scores.
							<br />
							<br />
							The formula for handicap differential is{" "}
							<strong>(Score - Course Rating) * 113 / Slope Rating</strong>. Your handicap index is
							rounded to one decimal place.
						</p>
					</div>
					<div className="flex flex-col flex-1 box-border p-2 mx-2 overflow-y-auto">
						{/* Column headers — hidden on mobile, visible on sm+ */}
						<div className="hidden sm:flex flex-row w-full box-border p-1 gap-10">
							<div className="w-10 min-w-10 shrink-0" />
							{columnHeaders.map((header) => (
								<Label
									key={header}
									size="large"
									weight="semibold"
									className="flex-1 text-center p-1 text-app-foreground"
								>
									{header}
								</Label>
							))}
						</div>
						{entries.map((entry) => (
							<div
								key={entry.id}
								className="flex flex-col sm:flex-row w-full box-border p-1 gap-2 sm:gap-10 sm:mb-5 mb-2"
							>
								<Card className="flex-1 sm:flex-row flex-col w-full border-gray-300 border">
									<CardHeader
										className="sm:hidden w-full "
										action={
											<Button
												appearance="transparent"
												onClick={() => removeEntry(entry.id)}
												className="ml-auto bg-red-400 text-app-background"
												icon={<DeleteFilled />}
											>
												Delete
											</Button>
										}
									/>
									<div className="hidden sm:flex w-10 min-w-10 items-center">
										<Button
											appearance="transparent"
											icon={<DeleteFilled />}
											size="large"
											onClick={() => removeEntry(entry.id)}
											className="min-w-full min-h-full flex items-center justify-center p-0 text-red-600"
										></Button>
									</div>
									<div className="flex flex-col flex-1 min-w-0 p-1">
										<Label
											size="small"
											weight="semibold"
											className="sm:hidden mb-1 text-app-foreground"
										>
											Date
										</Label>
										<DatePicker
											className="w-full"
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
									</div>
									<div className="flex flex-col flex-1 min-w-0 p-1">
										<Label
											size="small"
											weight="semibold"
											className="sm:hidden mb-1 text-app-foreground"
										>
											Course Name
										</Label>
										<Input
											value={entry.courseName}
											onChange={(e) => updateEntry(entry.id, "courseName", e.target.value)}
											className="w-full text-app-foreground"
										/>
									</div>
									<div className="flex flex-col flex-1 min-w-0 p-1">
										<Label
											size="small"
											weight="semibold"
											className="sm:hidden mb-1 text-app-foreground"
										>
											Course Rating
										</Label>
										<Input
											type="number"
											step="0.1"
											inputMode="decimal"
											value={courseRatingInput[entry.id] ?? entry.courseRating.toString()}
											onChange={(e) => {
												setCourseRatingInput((prev) => ({ ...prev, [entry.id]: e.target.value }));
												setHandicapVisible(false);
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
											className="w-full text-app-foreground"
										/>
									</div>
									<div className="flex flex-col flex-1 min-w-0 p-1">
										<Label
											size="small"
											weight="semibold"
											className="sm:hidden mb-1 text-app-foreground"
										>
											Slope Rating
										</Label>
										<Input
											type="number"
											value={entry.slopeRating.toString()}
											onChange={(e) => {
												updateEntry(entry.id, "slopeRating", Number(e.target.value));
												setHandicapVisible(false);
											}}
											className="w-full text-app-foreground"
										/>
									</div>
									<div className="flex flex-col flex-1 min-w-0 p-1">
										<Label
											size="small"
											weight="semibold"
											className="sm:hidden mb-1 text-app-foreground"
										>
											Score
										</Label>
										<Input
											type="number"
											value={entry.score.toString()}
											onChange={(e) => {
												updateEntry(entry.id, "score", Number(e.target.value));
												setHandicapVisible(false);
											}}
											className="w-full text-app-foreground"
										/>
									</div>
								</Card>
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
								className="min-w-[200px]"
							>
								Calculate Handicap
							</Button>
						</div>
						<div>
							{handicapVisible && (
								<div>
									<Text size={500} weight="semibold" className="text-app-foreground">
										Your Handicap: {calculateHandicap(entries)}
									</Text>
									<Button
										className="block mt-2 bg-secondary-button text-secondary-text"
										appearance="primary"
										onClick={exportData}
									>
										Export Data
									</Button>
								</div>
							)}
						</div>
					</div>
					<div className="flex bg-primary w-full min-h-[50px]">
						<p className="flex h-full text-primary-foreground text-base items-center ml-auto pr-2">
							{VERSION}
						</p>
					</div>
				</div>
			</FluentThemeProvider>
		</ThemeProvider>
	);
}

export default App;
