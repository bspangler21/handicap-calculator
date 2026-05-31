import type { ISkippedRow } from "../types/ISkippedRow";

interface ImportResultMessageBarProps {
	importedCount: number;
	skipped: ISkippedRow[];
	onDismiss: () => void;
}

export function ImportResultMessageBar({ importedCount, skipped, onDismiss }: ImportResultMessageBarProps) {
	if (importedCount === 0 && skipped.length === 0) return null;

	return (
		<div className="flex flex-col gap-2 px-4 py-2 mx-2 mt-2 rounded-md border border-surface-border bg-surface">
			<div className="flex flex-wrap items-center gap-2">
				{importedCount > 0 && (
					<span className="rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
						{importedCount} imported
					</span>
				)}
				{skipped.length > 0 && (
					<span className="rounded-full bg-yellow-100 px-3 py-0.5 text-sm font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
						{skipped.length} skipped
					</span>
				)}
				<button
					type="button"
					onClick={onDismiss}
					className="ml-auto text-sm underline text-app-foreground opacity-60 hover:opacity-100"
					aria-label="Dismiss import results"
				>
					Dismiss
				</button>
			</div>
			{skipped.length > 0 && (
				<ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
					{skipped.map((row) => (
						<li
							key={row.rowIndex}
							className="rounded border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-sm text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200"
						>
							<strong>Row {row.rowIndex}:</strong> {row.reason}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
