import { ChevronDown, MoonStar, SunMedium, LaptopMinimal } from "lucide-react";
import { useTheme } from "../hooks/use-theme";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup } from "./ui/dropdown-menu";

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
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-primary-foreground/30 px-3 py-2 text-input-text sm:w-auto sm:min-w-35"
          >
            <ActiveIcon className="h-4 w-4" />
            <span className="hidden text-sm sm:inline">{activeOption.label}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-32 bg-app-background text-app-foreground">
        <DropdownMenuGroup>
          {themeOptions.map((option) => {
            const OptionIcon = option.icon;
            return (
              <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
                <OptionIcon className="h-4 w-4" />
                {option.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
