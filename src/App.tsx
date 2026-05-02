import React from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { ImportResultMessageBar } from "@/components/ImportResultMessageBar";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import { calculateHandicap } from "@/lib/utils";
import { COLUMN_HEADERS } from "@/lib/constants";
import { useFileImport } from "@/hooks/useFileImport";
import { ThemeProvider } from "@/providers/theme-provider";
import type { IEntry } from "@/types/IEntry";
import type { IFileImportResult } from "@/types/IFileImportResult";
import versionData from "@/version.json";
import { Download, Plus, Trash2, Upload } from "lucide-react";
import { mockScores } from "./mockData/mockScores";

const mockEntries: IEntry[] = mockScores;
const VERSION = `v1.0.${versionData.version}`;

const tailwindStyles = {
	primaryButton:
		"inline-flex items-center gap-2 rounded border border-button-border bg-button-bg px-3 py-2 text-sm text-button-text shadow-sm transition hover:opacity-90 active:translate-y-px sm:min-w-37.5 sm:px-4 sm:text-base h-10",
	inputContainer: "flex flex-col min-w-0 flex-1 p-1",
	inputLabel: "mb-1 text-sm font-semibold sm:hidden",
};

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

function formatDateForInput(date: Date): string {
	return date.toISOString().slice(0, 10);
}

function parseDateInputValue(value: string): Date {
	if (!value) return new Date();
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year, month - 1, day);
}

export function App() {
	const [entries, setEntries] = React.useState<IEntry[]>(createInitialEntries);
	const [handicapVisible, setHandicapVisible] = React.useState(false);
	const [courseRatingInput, setCourseRatingInput] = React.useState<Record<string, string>>({});
	const [importResult, setImportResult] = React.useState<IFileImportResult | null>(null);

	const handleImport = React.useCallback((result: IFileImportResult) => {
		setImportResult(result);
		if (result.imported.length > 0) {
			setEntries(result.imported);
			setHandicapVisible(false);
		}
	}, []);

	const { fileInputRef, triggerFilePicker, handleFileChange } = useFileImport(handleImport);

	const exportData = () => {
		let csvContent = `${COLUMN_HEADERS.join(",")}\n`;
		for (const entry of entries) {
			csvContent += `${entry.date.toLocaleDateString()},${entry.courseName.replaceAll(",", "")},${entry.courseRating},${entry.slopeRating},${entry.score}\n`;
		}
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "golf-handicap-calculator-scores.csv";
		link.click();
		URL.revokeObjectURL(url);
	};

	const columnHeaders = COLUMN_HEADERS;

	const getEligibleEntries = (): IEntry[] =>
		entries.filter((e) => e.score > 0 && e.courseRating > 0 && e.slopeRating > 0);

	const newEntry = () => {
		setEntries((prev) => [...prev, EMPTY_ENTRY()]);
	};

	const updateEntry = (id: string, field: keyof IEntry, value: string | number | Date) => {
		setEntries((prev) =>
			prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
		);
	};

	const removeEntry = (id: string) => {
		setEntries((prev) => prev.filter((entry) => entry.id !== id));
		setCourseRatingInput((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
		setHandicapVisible(false);
	};

	return (
		<ThemeProvider defaultTheme="light" storageKey="theme">
			<div className="inline-flex min-h-screen w-full flex-col bg-app-background text-app-foreground">
				<header className="flex min-h-12.5 w-full items-center justify-between bg-primary px-3 text-primary-foreground">
					<h1 className="text-base font-semibold sm:text-xl">Golf Handicap Calculator</h1>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={triggerFilePicker}
							className={tailwindStyles.primaryButton}
							aria-label="Import CSV"
						>
							<Upload className="h-4 w-4" />
							<span className="hidden sm:inline">Import CSV</span>
						</button>
						<button
							type="button"
							onClick={() => {
								newEntry();
								setHandicapVisible(false);
							}}
							className={tailwindStyles.primaryButton}
							aria-label="Add Entry"
						>
							<Plus className="h-4 w-4" />
							<span className="hidden sm:inline">Add Entry</span>
						</button>
						<ModeToggle />
					</div>
				</header>

				{importResult && (
					<ImportResultMessageBar
						importedCount={importResult.imported.length}
						skipped={importResult.skipped}
						onDismiss={() => setImportResult(null)}
					/>
				)}

				<main className="flex flex-1 flex-col overflow-y-auto px-2 py-2">
					<section className="mb-5 px-2">
						<p className="p-2 text-lg font-semibold">
							To get started, add at least three entries, then click "Calculate Handicap".
						</p>
						<p className="mb-5 p-2">
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
					</section>

					<section className="flex flex-1 flex-col">
						<div className="hidden w-full flex-row gap-10 px-1 py-1 sm:flex">
							<div className="w-10 min-w-10 shrink-0" />
							{columnHeaders.map((header) => (
								<span key={header} className="flex-1 p-1 text-center font-semibold">
									{header}
								</span>
							))}
						</div>

						{entries.map((entry) => (
							<div
								key={entry.id}
								className="mb-2 flex w-full flex-col gap-2 rounded-md bg-surface p-1 shadow-[0_1px_3px_rgba(0,0,0,0.12)] sm:mb-5 sm:flex-row sm:items-stretch sm:gap-10"
							>
								<div className="flex justify-end px-1 pt-1 sm:hidden">
									<button
										type="button"
										onClick={() => removeEntry(entry.id)}
										className="flex h-8 w-8 items-center justify-center rounded text-red-600"
										aria-label={`Delete entry ${entry.courseName || ""}`.trim()}
									>
										<Trash2 className="h-5 w-5" />
									</button>
								</div>

								<div className="hidden w-10 min-w-10 items-center sm:flex">
									<button
										type="button"
										onClick={() => removeEntry(entry.id)}
										className="flex h-8 w-8 items-center justify-center rounded text-red-600"
										aria-label={`Delete entry ${entry.courseName || ""}`.trim()}
									>
										<Trash2 className="h-5 w-5" />
									</button>
								</div>

								<div className={tailwindStyles.inputContainer}>
									<label className={tailwindStyles.inputLabel}>Date</label>
									<input
										type="date"
										value={formatDateForInput(entry.date)}
										onChange={(e) =>
											updateEntry(entry.id, "date", parseDateInputValue(e.target.value))
										}
										className="w-full rounded border border-input-border bg-input-bg px-2 py-1 text-input-text"
									/>
								</div>

								<div className={tailwindStyles.inputContainer}>
									<label className={tailwindStyles.inputLabel}>Course Name</label>
									<input
										type="text"
										value={entry.courseName}
										onChange={(e) => updateEntry(entry.id, "courseName", e.target.value)}
										className="w-full rounded border border-input-border bg-input-bg px-2 py-1 text-input-text"
									/>
								</div>

								<div className={tailwindStyles.inputContainer}>
									<label className={tailwindStyles.inputLabel}>Course Rating</label>
									<input
										type="number"
										step="0.1"
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
										className="w-full rounded border border-input-border bg-input-bg px-2 py-1 text-input-text"
									/>
								</div>

								<div className={tailwindStyles.inputContainer}>
									<label className={tailwindStyles.inputLabel}>Slope Rating</label>
									<input
										type="number"
										value={entry.slopeRating.toString()}
										onChange={(e) => {
											updateEntry(entry.id, "slopeRating", Number(e.target.value));
											setHandicapVisible(false);
										}}
										className="w-full rounded border border-input-border bg-input-bg px-2 py-1 text-input-text"
									/>
								</div>

								<div className={tailwindStyles.inputContainer}>
									<label className={tailwindStyles.inputLabel}>Score</label>
									<input
										type="number"
										value={entry.score.toString()}
										onChange={(e) => {
											updateEntry(entry.id, "score", Number(e.target.value));
											setHandicapVisible(false);
										}}
										className="w-full rounded border border-input-border bg-input-bg px-2 py-1 text-input-text"
									/>
								</div>
							</div>
						))}

						<div className="flex flex-col items-center py-3">
							<button
								type="button"
								disabled={getEligibleEntries().length < 3}
								onClick={() => setHandicapVisible(true)}
								className="min-w-50 rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50 disabled:bg-[#d9d9d9] disabled:text-[#a9a9a9]"
								aria-label="Calculate Handicap"
							>
								Calculate Handicap
							</button>
						</div>

						{handicapVisible ? (
							<div className="px-2 py-3">
								<p className="text-lg font-semibold text-app-foreground">
									Your Handicap: {calculateHandicap(getEligibleEntries())}
								</p>
								<button
									type="button"
									onClick={exportData}
									title="Download your scores so they can be re-imported to the tool at a later date."
									className="mt-3 inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:opacity-90 active:translate-y-px"
								>
									<Download className="h-4 w-4" />
									Export Data
								</button>
							</div>
						) : null}
					</section>
				</main>

				<footer className="flex min-h-12.5 w-full items-center bg-primary">
					<p className="ml-auto pr-2 text-base leading-none text-primary-foreground">{VERSION}</p>
				</footer>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept=".csv"
				className="hidden"
				onChange={handleFileChange}
				aria-label="CSV file input"
			/>
		</ThemeProvider>
	);
}
