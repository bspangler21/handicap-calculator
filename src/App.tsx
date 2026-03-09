import "./App.css";
import { makeStyles, tokens, Text, useId, Input, Button } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import type { IEntry } from "./types/IEntry";
import { useState } from "react";
import { mockScores } from "./mockData/mockScores";
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
	},
	contentHeader: {
		minWidth: "100%",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: "10px",
	},
	row: {
		minWidth: "100%",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "row",
		flexWrap: "nowrap",
		justifyContent: "center",
		alignItems: "center",
		gap: "10px",
	},
	scoreColumn: {
		width: "200px",
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
	button: {
		backgroundColor: tokens.colorBrandForeground,
	},
});

const testData: IEntry[] = mockScores;

function App() {
	const styles = useStyles();
	const [scores, setScores] = useState<IEntry[]>(testData);
	const inputId = useId("score-input");

	const onNewButtonClick = () => {
		scores.push({
			id: scores.length + 1,	
			date: new Date(),
			courseName: "",
			courseRating: 0,
			slopeRating: 0,
			score: 0,
		})
		setScores([...scores]);
	}

	return (
		<div className={styles.pageContainer}>
			<div className={styles.header}>
				<Text weight="semibold" size={600} style={{ flexShrink: 0 }}>
					Golf Handicap Calculator
				</Text>
				<Button onClick={onNewButtonClick}>Add New</Button>
			</div>
			<div className={styles.contentContainer}>
				<div className={styles.row}>
					<Text weight="semibold" size={300} className={styles.scoreColumn}>
						Date
					</Text>
					<Text weight="semibold" size={300} className={styles.scoreColumn}>
						Course
					</Text>
					<Text weight="semibold" size={300} className={styles.scoreColumn}>
						Course Rating
					</Text>
					<Text weight="semibold" size={300} className={styles.scoreColumn}>
						Slope Rating
					</Text>
					<Text weight="semibold" size={300} className={styles.scoreColumn}>
						Score
					</Text>
				</div>
				{scores.map((entry, index) => (
					<div key={index} className={styles.row}>
						<DatePicker value={entry.date} className={styles.scoreColumn} allowTextInput={true} />
						<Input id={inputId} value={entry.courseName} className={styles.scoreColumn} />
						<Input
							id={inputId}
							value={entry.courseRating.toString()}
							className={styles.scoreColumn}
						/>
						<Input
							id={inputId}
							value={entry.slopeRating.toString()}
							className={styles.scoreColumn}
						/>
						<Input id={inputId} value={entry.score.toString()} className={styles.scoreColumn} />
					</div>
				))}
			</div>
			<div className={styles.footer}>
				<Text>
					{calculateHandicap(scores)?.toString() === "NaN"
						? "N/A"
						: calculateHandicap(scores)?.toString()}
				</Text>
			</div>
		</div>
	);
}

export default App;
