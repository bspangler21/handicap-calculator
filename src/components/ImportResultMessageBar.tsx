import { Badge, MessageBar, MessageBarBody, Text } from "@fluentui/react-components";
import type { ISkippedRow } from "../types/ISkippedRow";

interface ImportMessageBarProps {
	importedCount: number;
	skipped: ISkippedRow[];
	onDismiss: () => void;
}

export function ImportResultMessageBar({
	importedCount,
	skipped,
	onDismiss,
}: ImportMessageBarProps) {
	if (importedCount === 0 && skipped.length === 0) return null;

	return (
		<div className="flex flex-col gap-2 p-2 mx-2">
			{/* Summary badges */}
			<div className="flex gap-2 flex-wrap items-center">
				{importedCount > 0 && (
					<Badge color="success" size="large">
						{importedCount} imported
					</Badge>
				)}
				{skipped.length > 0 && (
					<Badge color="warning" size="large">
						{skipped.length} skipped
					</Badge>
				)}
				<button
					onClick={onDismiss}
					className="ml-auto text-sm underline text-app-foreground"
					aria-label="Dismiss import results"
				>
					Dismiss
				</button>
			</div>

			{/* Per-row error list */}
			{skipped.length > 0 && (
				<div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
					{skipped.map((row) => (
						<MessageBar key={row.rowIndex} intent="warning">
							<MessageBarBody>
								<Text size={200}>
									<strong>Row {row.rowIndex}:</strong> {row.reason}
								</Text>
							</MessageBarBody>
						</MessageBar>
					))}
				</div>
			)}
		</div>
	);
}
