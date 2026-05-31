import React from "react";
import type { IEntry } from "../types/IEntry";
import type { ISkippedRow } from "../types/ISkippedRow";
import type { IFileImportResult } from "../types/IFileImportResult";
import { COLUMN_HEADERS } from "../lib/constants";

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

	if (lines.length === 0) return { imported: [], skipped: [] };

	const headerColumns = lines[0].split(",").map((h) => h.trim());
	const headersMatch = COLUMN_HEADERS.every((h, i) => headerColumns[i] === h);
	if (!headersMatch) {
		return {
			imported: [],
			skipped: [
				{
					rowIndex: 0,
					raw: lines[0],
					reason: `Invalid header. Expected: "${COLUMN_HEADERS.join(",")}", got "${lines[0]}"`,
				},
			],
		};
	}

	const imported: IEntry[] = [];
	const skipped: ISkippedRow[] = [];

	for (let i = 1; i < lines.length; i++) {
		const raw = lines[i];
		const cols = raw.split(",");

		if (cols.length !== COLUMN_HEADERS.length) {
			skipped.push({ rowIndex: i, raw, reason: `Expected ${COLUMN_HEADERS.length} columns, got ${cols.length}.` });
			continue;
		}

		const [rawDate, rawCourseName, rawCourseRating, rawSlopeRating, rawScore] = cols.map((c) => c.trim());

		const date = parseDate(rawDate);
		if (!date) {
			skipped.push({ rowIndex: i, raw, reason: `Invalid date "${rawDate}". Expected M/D/YYYY.` });
			continue;
		}

		if (!rawCourseName) {
			skipped.push({ rowIndex: i, raw, reason: "Course name is empty." });
			continue;
		}

		const courseRating = parseFloat(rawCourseRating);
		if (isNaN(courseRating)) {
			skipped.push({ rowIndex: i, raw, reason: `Invalid course rating "${rawCourseRating}". Must be a number.` });
			continue;
		}

		const slopeRating = parseInt(rawSlopeRating, 10);
		if (isNaN(slopeRating)) {
			skipped.push({ rowIndex: i, raw, reason: `Invalid slope rating "${rawSlopeRating}". Must be a whole number.` });
			continue;
		}

		const score = parseInt(rawScore, 10);
		if (isNaN(score)) {
			skipped.push({ rowIndex: i, raw, reason: `Invalid score "${rawScore}". Must be a whole number.` });
			continue;
		}

		imported.push({ id: crypto.randomUUID(), date, courseName: rawCourseName, courseRating, slopeRating, score });
	}

	return { imported, skipped };
}

export function useFileImport(onImport: (result: IFileImportResult) => void) {
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const triggerFilePicker = React.useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			e.target.value = "";
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (evt) => {
				const text = evt.target?.result;
				if (typeof text !== "string") return;
				onImport(parseFile(text));
			};
			reader.readAsText(file);
		},
		[onImport]
	);

	return { fileInputRef, triggerFilePicker, handleFileChange };
}
