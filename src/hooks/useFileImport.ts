import React from "react";
import type { IEntry } from "../types/IEntry";
import type { ISkippedRow } from "../types/ISkippedRow";
import { COLUMN_HEADERS } from "../lib/constants";
import type { IFileImportResult } from "../types/IFileImportResult";

const EXPECTED_HEADERS = COLUMN_HEADERS;

function parseDate(raw: string): Date | null {
	const trimmed = raw.trim();
	const mdy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (mdy) {
		const dt = new Date(parseInt(mdy[3]), parseInt(mdy[1]) - 1, parseInt(mdy[2]));
		return isNaN(dt.getTime()) ? null : dt;
	}
	return null;
}

export function parseFile(text: string): IFileImportResult {
	const lines: string[] = text.split(/\r?\n/).filter((l) => l.trim() !== "");

	if (lines.length === 0) {
		return { imported: [], skipped: [] };
	}

	//--Validate headers
	const headerColumns: string[] = lines[0].split(",").map((h) => h.trim());
	const headersMatch: boolean = EXPECTED_HEADERS.every((h, i) => headerColumns[i] === h);
	if (!headersMatch) {
		return {
			imported: [],
			skipped: [
				{
					rowIndex: 0,
					raw: lines[0],
					reason: `Invalid header. Expected: "${EXPECTED_HEADERS.join(",")}", got "${lines[0]}"`,
				},
			],
		};
	}

	const imported: IEntry[] = [];
	const skipped: ISkippedRow[] = [];

	function pushFailedRow(rowIndex: number, raw: string, reason: string) {
		skipped.push({ rowIndex, raw, reason });
	}

	for (let i = 1; i < lines.length; i++) {
		const raw = lines[i];
		const rowIndex = i;
		const cols = raw.split(",");

		if (cols.length !== EXPECTED_HEADERS.length) {
			pushFailedRow(
				rowIndex,
				raw,
				`Expected ${EXPECTED_HEADERS.length} columns, got ${cols.length}.`
			);
			continue;
		}

		const [rawDate, rawCourseName, rawCourseRating, rawSlopeRating, rawScore] = cols.map((c) =>
			c.trim()
		);

		const date = parseDate(rawDate);
		if (!date) {
			pushFailedRow(rowIndex, raw, `Invalid date "${rawDate}". Expected M/D/YYYY.`);
			continue;
		}

		const courseRating: number = parseFloat(rawCourseRating);
		if (isNaN(courseRating)) {
			pushFailedRow(rowIndex, raw, `Invalid course rating "${rawCourseRating}". Must be a number.`);
			continue;
		}
		const slopeRating = parseInt(rawSlopeRating, 10);
		if (isNaN(slopeRating)) {
			pushFailedRow(
				rowIndex,
				raw,
				`Invalid slope rating "${rawSlopeRating}". Must be a whole number.`
			);
			continue;
		}

		const score = parseInt(rawScore, 10);
		if (isNaN(score)) {
			pushFailedRow(rowIndex, raw, `Invalid score "${rawScore}". Must be a whole number.`);
			continue;
		}

    if (!rawCourseName) {
      pushFailedRow(rowIndex, raw, "Course name is empty.");
      continue;
    }

    imported.push({
      id: crypto.randomUUID(),
      date,
      courseName: rawCourseName,
      courseRating,
      slopeRating,
      score,
    });
	}
  return { imported, skipped };
}

export function useFileImport(onImport: (result: IFileImportResult) => void) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const triggerFilePicker = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value= "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text !== "string") return;
      const result = parseFile(text);
      onImport(result);
    };
    reader.readAsText(file);
  }, [onImport]);
  return { fileInputRef, triggerFilePicker, handleFileChange };
}
