import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
	pageContainer: {
		display: "flex",
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
		boxSizing: "border-box",
	},
});

function App() {
	const styles = useStyles();

	return (
		<div className={styles.pageContainer}>
			<div className={styles.contentContainer}>
				<div className={styles.header}></div>
				<p>Click on the Vite and React logos to learn more</p>
			</div>
		</div>
	);
}

export default App;
