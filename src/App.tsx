import "./App.css";
import {
	makeStyles,
	tokens,
	Text,
} from "@fluentui/react-components";

const useStyles = makeStyles({
	pageContainer: {
		display: "flex",
    flexDirection: "column",
		width: "100%",
		height: "100%",
		margin: 0,
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
});

function App() {
	const styles = useStyles();

	// const columns = [
	// 	createTableColumn()
	// ]

	return (
		<div className={styles.pageContainer}>
			<div className={styles.header}>
				<Text
					weight="semibold"
					size={600}
					className={styles.headerText}
					style={{ flexShrink: 0, padding: "10px" }}
				>
					Golf Handicap Calculator
				</Text>
			</div>
			<div className={styles.contentContainer}>
				<table>
					<thead>
						<tr>
							<th>Date</th>
							<th>Course Name</th>
							<th>Course Rating</th>
							<th>Slope Rating</th>
							<th>Score</th>
						</tr>
					</thead>
				</table>
			</div>
			<div className={styles.footer}></div>
		</div>
	);
}

export default App;
