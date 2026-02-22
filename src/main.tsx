import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {
	FluentProvider,
  createLightTheme,
} from "@fluentui/react-components";
import type { BrandVariants, Theme } from "@fluentui/react-components";

const theMasters: BrandVariants = {
	10: "#020402",
	20: "#101C15",
	30: "#162E21",
	40: "#193C2A",
	50: "#1D4A33",
	60: "#2E5640",
	70: "#3E634E",
	80: "#4E705C",
	90: "#5E7D6B",
	100: "#6F8B7A",
	110: "#7F9889",
	120: "#90A699",
	130: "#A2B4A9",
	140: "#B3C2B9",
	150: "#C5D0C9",
	160: "#D7DFDA",
};

const lightTheme: Theme = {
	...createLightTheme(theMasters),
};

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<FluentProvider theme={lightTheme} style={{ height: "100%", display: "flex", width: "100%" }}>
			<App />
		</FluentProvider>
	</StrictMode>
);
