import "./App.css";
import { makeStyles, tokens, Text, Input, Button } from "@fluentui/react-components";
import { DeleteFilled } from "@fluentui/react-icons";
import type { IEntry } from "./types/IEntry";
import React from "react";

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
		width: "100%",
		height: "100%",
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
		padding: "0 20px",
		padding: "10px",
	},
	headerText: {
		fontSize: "600",
		color: "#FFFFFF",
		weight: "semibold",
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
	columnHeader: {
		width: "20%",
		textAlign: "center",
		padding: "5px",
	},
	button: {
		width: "150px",
		height: "30px",
	},
	smallIcon: {
		fontSize: "32px"
	}
});

const EMPTY_ENTRY = (): IEntry => ({
	id: crypto.randomUUID(),
	date: new Date(),
	courseName: "",
	courseRating: 0,
	slopeRating: 0,
	score: 0,
	button: {
		backgroundColor: tokens.colorBrandForeground,
	},
});

const testData: IEntry[] = mockScores;

function App() {
	const styles = useStyles();
	const [entries, setEntries] = React.useState<IEntry[]>([EMPTY_ENTRY()]);

	const columnHeaders = ["trashIcon", "Date", "Course Name", "Course Rating", "Slope Rating", "Score"];

	const newEntry = (): void => setEntries((prev) => [...prev, EMPTY_ENTRY()]);

	const updateEntry = (id: string, field: keyof IEntry, value: string | number | Date): void => {
		setEntries((prev) =>
			prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
		);
	};

	const removeEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

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
					{columnHeaders.map((header) =>
						header === "trashIcon" ? (
							<DeleteFilled />
						) : (
							<Text size={300} weight="bold" className={styles.columnHeader}>
								{header}
							</Text>
						)
					)}
				</div>
				{entries.map((entry) => (
					<div key={entry.id} className={styles.columnHeaderContainer}>
						<Input
							value={entry.date.toDateString()}
							onChange={(e) => updateEntry(entry.id, "date", new Date(e.target.value))}
							className={styles.columnHeader}
						/>
						<Input
							value={entry.courseName}
							onChange={(e) => updateEntry(entry.id, "courseName", e.target.value)}
							className={styles.columnHeader}
						/>
						<Input
							value={entry.courseRating.toString()}
							onChange={(e) => updateEntry(entry.id, "courseRating", Number(e.target.value))}
							className={styles.columnHeader}
						/>
						<Input
							value={entry.slopeRating.toString()}
							onChange={(e) => updateEntry(entry.id, "slopeRating", Number(e.target.value))}
							className={styles.columnHeader}
						/>
						<Input
							value={entry.score.toString()}
							onChange={(e) => updateEntry(entry.id, "score", Number(e.target.value))}
							className={styles.columnHeader}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

export default App;
