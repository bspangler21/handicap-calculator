import { useState } from "react";
import { ChevronDown, MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "../hooks/use-theme";

const themeOptions = [
	{ value: "light" as const, label: "Light", icon: SunMedium },
	{ value: "dark" as const, label: "Dark", icon: MoonStar },
	{ value: "system" as const, label: "System", icon: ChevronDown },
];

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const [open, setOpen] = useState(false);
	const activeOption = themeOptions.find((option) => option.value === theme) ?? themeOptions[2];
	const ActiveIcon = activeOption.icon;

	return (
		<div className="relative">
			<button
				type="button"
				aria-label="Toggle theme"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => setOpen((current) => !current)}
				className="inline-flex items-center gap-2 rounded px-3 py-2 text-primary-foreground border border-primary-foreground/30"
			>
				<ActiveIcon className="h-4 w-4" />
				<span className="hidden sm:inline text-sm">{activeOption.label}</span>
				<ChevronDown className="h-4 w-4" />
			</button>
			{open ? (
				<div className="absolute right-0 z-10 mt-2 w-32 overflow-hidden rounded border bg-white shadow-lg">
					{themeOptions.map((option) => {
						const OptionIcon = option.icon;
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => {
									setTheme(option.value);
									setOpen(false);
								}}
								className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-100"
							>
								<OptionIcon className="h-4 w-4" />
								{option.label}
							</button>
						);
					})}
				</div>
			) : null}
		</div>
	);
}
