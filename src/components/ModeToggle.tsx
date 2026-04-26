import {
	Menu,
	MenuTrigger,
	MenuPopover,
	MenuList,
	MenuItem,
	Button,
} from "@fluentui/react-components";
import { WeatherMoonRegular, WeatherSunnyRegular } from "@fluentui/react-icons";
import { useTheme } from "../hooks/useTheme";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<Menu>
			<MenuTrigger disableButtonEnhancement>
				<Button
					appearance="transparent"
					icon={
						theme === "dark" ? (
							<WeatherMoonRegular />
						) : (
							<WeatherSunnyRegular
								primaryFill="#FFFFFF"
								className="hover:text-background hover:fill-black"
							/>
						)
					}
					aria-label="Toggle theme"
				/>
			</MenuTrigger>
			<MenuPopover>
				<MenuList>
					<MenuItem onClick={() => setTheme("light")}>Light</MenuItem>
					<MenuItem onClick={() => setTheme("dark")}>Dark</MenuItem>
					<MenuItem onClick={() => setTheme("system")}>System</MenuItem>
				</MenuList>
			</MenuPopover>
		</Menu>
	);
}
