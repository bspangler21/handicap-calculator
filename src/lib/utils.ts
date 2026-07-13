import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { IEntry } from "../types/IEntry";

function effectiveScore(entry: IEntry): number {
  return entry.isNineHole ? entry.score * 2 : entry.score;
}

export function calculateHandicap(scores: IEntry[]) {
  // Take the 6 most recent rounds. Clone first — sort mutates in place, and we
  // must not reorder the caller's array.
  let topScores = [...scores]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  // Once there are enough rounds, drop the single highest and lowest outliers and
  // keep the middle. Sort ascending by effective score (so a 9-hole round's doubled
  // value compares fairly), then slice off both ends.
  if (topScores.length >= 3) {
    topScores = topScores.sort((a, b) => effectiveScore(a) - effectiveScore(b)).slice(1, -1);
  }

  // Calculate handicap differential for each remaining score
  // Formula: (Score - Course Rating) * 113 / Slope Rating; 9-hole scores are doubled.
  const differentials = topScores.map(
    (entry) => ((effectiveScore(entry) - entry.courseRating) * 113) / entry.slopeRating
  );

  const handicap = differentials.reduce((sum, d) => sum + d, 0) / differentials.length;
  return Math.round(handicap * 10) / 10; // Round to 1 decimal place
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
