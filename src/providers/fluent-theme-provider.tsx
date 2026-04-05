import { FluentProvider, createDarkTheme, createLightTheme } from "@fluentui/react-components";
import { useTheme } from "../hooks/use-theme";

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

const darkTheme: Theme = {
  ...createDarkTheme(theMasters),
};

darkTheme.colorBrandForeground1 = theMasters[110];
darkTheme.colorBrandForeground2 = theMasters[120];

type Props = { children: React.ReactNode };

export function FluentThemeProvider({ children }: Props) {
	const { theme } = useTheme();
	const isDark =
		theme === "dark" ||
		(theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
	return (
		<FluentProvider
			theme={isDark ? darkTheme : lightTheme}
			className="flex h-full w-full"
			style={{ background: "transparent" }}
		>
			{children}
		</FluentProvider>
	);
}
