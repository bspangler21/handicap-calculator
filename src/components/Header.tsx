import { Text, Button } from "@fluentui/react-components";
import { AddRegular, DocumentArrowUpRegular } from "@fluentui/react-icons";
import { ModeToggle } from "./ModeToggle";

interface HeaderProps {
	onImport: () => void;
	onAddEntry: () => void;
}

export function Header({ onImport, onAddEntry }: HeaderProps) {
	return (
		<div className="flex flex-row sm:flex-wrap flex-nowrap justify-between items-center bg-primary text-primary-foreground min-h-[50px] w-full box-border p-3">
			<Text className="text-base sm:text-xl font-semibold">Golf Handicap Calculator</Text>
			<div className="flex gap-3">
				<Button
					onClick={onImport}
					appearance="secondary"
					className="bg-slate-600 text-secondary-text items-center text-base sm:text-lg min-w-[125px] sm:min-w-[150px]"
					icon={<DocumentArrowUpRegular />}
				>
					Import CSV
				</Button>
				<Button
					onClick={onAddEntry}
					appearance="secondary"
					className="items-center text-base sm:text-lg min-w-[125px] sm:min-w-[150px]"
					icon={<AddRegular />}
				>
					Add Entry
				</Button>
				<ModeToggle />
			</div>
		</div>
	);
}
