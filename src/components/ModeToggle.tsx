import { ChevronDown, MoonStar, SunMedium, LaptopMinimal } from "lucide-react";
import { useTheme } from "../hooks/use-theme";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "./ui/dropdown-menu";

const themeOptions = [
	{ value: "light" as const, label: "Light", icon: SunMedium },
	{ value: "dark" as const, label: "Dark", icon: MoonStar },
	{ value: "system" as const, label: "System", icon: LaptopMinimal },
];

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const activeOption = themeOptions.find((option) => option.value === theme) ?? themeOptions[2];
	const ActiveIcon = activeOption.icon;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						type="button"
						aria-label="Toggle theme"
						variant="secondary"
						className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border border-primary-foreground/30 h-10 sm:w-auto sm:min-w-35 justify-center text-input-text"
					>
						<ActiveIcon className="h-4 w-4" />
						<span className="hidden sm:inline text-sm">{activeOption.label}</span>
						<ChevronDown className="h-4 w-4" />
					</Button>
				}
			/>
			<DropdownMenuContent align="end" className="w-32 bg-app-background text-app-foreground">
				{themeOptions.map((option) => {
					const OptionIcon = option.icon;
					return (
						<DropdownMenuItem key={option.value} onSelect={() => setTheme(option.value)}>
							<OptionIcon className="h-4 w-4" />
							{option.label}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
