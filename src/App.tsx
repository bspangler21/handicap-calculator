import "./App.css";
import { makeStyles, tokens } from "@fluentui/react-components";

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

	return (
		<div className={styles.pageContainer}>
			<div className={styles.header}></div>
			<div className={styles.contentContainer}>
				<p>Click on the Vite and React logos to learn more</p>
			</div>
			<div className={styles.footer}></div>
		</div>
	);
}

export default App;
