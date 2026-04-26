import type { IEntry } from "./IEntry";
import type { ISkippedRow } from "./ISkippedRow";

export interface IFileImportResult {
  imported: IEntry[];
  skipped: ISkippedRow[];
}