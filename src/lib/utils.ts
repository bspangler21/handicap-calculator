import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { IEntry } from "../types/IEntry";
import type { SortBy, SortOrder } from "../types/sort";

export function calculateHandicap(scores: IEntry[]) {
  // Take the 6 most recent rounds. Clone first — sort mutates in place, and we
  // must not reorder the caller's array.
  let topScores = [...scores]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  // Only drop the high/low outliers once there are enough rounds to keep at least one.
  if (topScores.length >= 3) {
    // Remove the lowest score
    topScores = topScores.sort((a, b) => a.score - b.score).slice(0, -1);
    // Remove the highest score
    topScores = topScores.sort((a, b) => b.score - a.score).slice(0, -1);
  }

  // Calculate handicap differential for each remaining score
  // Formula: (Score - Course Rating) * 113 / Slope Rating
  const differentials = topScores.map(
    (entry) => ((entry.score - entry.courseRating) * 113) / entry.slopeRating
  );

  const handicap = differentials.reduce((sum, d) => sum + d, 0) / differentials.length;
  return Math.round(handicap * 10) / 10; // Round to 1 decimal place
}

export function sortEntries(entries: IEntry[], sortBy: SortBy, order: SortOrder): IEntry[] {
  const dir = order === "asc" ? 1 : -1;

  const cmp = (a: IEntry, b: IEntry): number => {
    if (sortBy === "date") {
      return (a.date.getTime() - b.date.getTime()) * dir;
    }
    if (sortBy === "score") {
      return (a.score - b.score) * dir;
    }
    if (sortBy === "course") {
      // Empty/whitespace-only names always sink to the bottom, regardless of
      // sort direction, so the empty-check runs before the flip.
      const aEmpty = a.courseName.trim() === "";
      const bEmpty = b.courseName.trim() === "";
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;
      return a.courseName.localeCompare(b.courseName, undefined, { sensitivity: "base" }) * dir;
    }
    // Exhaustiveness guard: if a new SortBy member is added, this line stops
    // compiling until a branch above handles it (compile error > silent mis-sort).
    const _exhaustive: never = sortBy;
    return _exhaustive;
  };

  return [...entries].sort(cmp);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
