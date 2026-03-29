import "./App.css";
import { makeStyles, tokens, Text, Input, Button } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { DeleteFilled } from "@fluentui/react-icons";
import type { IEntry } from "./types/IEntry";
import React from "react";
import { calculateHandicap } from "./lib/util";

const useStyles = makeStyles({
	pageContainer: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		height: "100%",
		margin: "0",
	},
	contentContainer: {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		boxSizing: "border-box",
		padding: "20px",
	},
	header: {
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: tokens.colorBrandBackground,
		color: "#FFFFFF",
		minHeight: "50px",
		width: "100%",
		boxSizing: "border-box",
		padding: "10px",
	},
	headerText: {
		fontSize: "600",
		color: "#FFFFFF",
		fontWeight: "semibold",
	},
	footer: {
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: tokens.colorBrandBackground,
		color: "#FFFFFF",
		minHeight: "50px",
		width: "100%",
		boxSizing: "border-box",
	},
	columnHeaderContainer: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		boxSizing: "border-box",
		padding: "5px",
		gap: "20px",
	},
	iconColumn: {
		width: "40px",
		minWidth: "40px",
		flexShrink: 0,
	},
	columnHeader: {
		flex: 1,
		textAlign: "center",
		padding: "5px",
	},
	button: {
		width: "150px",
		height: "30px",
	},
	smallIcon: {
		fontSize: "20px",
		alignItems: "center",
	},
	buttonContainer: {
		display: "flex",
		alignItems: "center",
		flexDirection: "column",
	},
});

const EMPTY_ENTRY = (): IEntry => ({
	id: crypto.randomUUID(),
	date: new Date(),
	courseName: "",
	courseRating: 0,
	slopeRating: 0,
	score: 0,
});

function App() {
	const styles = useStyles();
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
		<div className={styles.pageContainer}>
			<div className={styles.header}>
				<Text weight="semibold" size={600} style={{ flexShrink: 0 }}>
					Golf Handicap Calculator
				</Text>
				<Button onClick={newEntry} appearance="secondary" className={styles.button}>
					Add Entry
				</Button>
			</div>
			<div className={styles.contentContainer}>
				<div className={styles.columnHeaderContainer}>
					<div className={styles.iconColumn} />
					{columnHeaders.map((header) => (
						<Text key={header} size={300} weight="bold" className={styles.columnHeader}>
							{header}
						</Text>
					))}
				</div>
				{entries.map((entry) => (
					<div key={entry.id} className={styles.columnHeaderContainer}>
						<Button
							appearance="subtle"
							className={styles.iconColumn}
							onClick={() => removeEntry(entry.id)}
						>
							<DeleteFilled className={styles.smallIcon} />
						</Button>
						<DatePicker
							className={styles.columnHeader}
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
							className={styles.columnHeader}
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
							className={styles.columnHeader}
						/>
						<Input
							type="number"
							value={entry.slopeRating.toString()}
							onChange={(e) => updateEntry(entry.id, "slopeRating", Number(e.target.value))}
							className={styles.columnHeader}
						/>
						<Input
							type="number"
							value={entry.score.toString()}
							onChange={(e) => updateEntry(entry.id, "score", Number(e.target.value))}
							className={styles.columnHeader}
						/>
					</div>
				))}
				<div className={styles.buttonContainer}>
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
		</div>
	);
}

export default App;
