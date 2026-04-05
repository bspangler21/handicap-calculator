import { FluentProvider, webLightTheme, webDarkTheme } from "@fluentui/react-components";
import { useTheme } from "../hooks/use-theme";

type Props = { children: React.ReactNode };

export function FluentThemeProvider({ children }: Props) {
	const { theme } = useTheme();
	const isDark =
		theme === "dark" ||
		(theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
	return (
		<FluentProvider
			theme={isDark ? webDarkTheme : webLightTheme}
			style={{ background: "transparent" }}
		>
			{children}
		</FluentProvider>
	);
}
