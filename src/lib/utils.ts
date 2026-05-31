import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { IEntry } from "../types/IEntry";

export function calculateHandicap(scores: IEntry[]) {
  // Take the 6 most recent rounds. Clone first — sort mutates in place, and we
  // must not reorder the caller's array.
  let topScores = [...scores]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);
  // Remove the lowest score
  topScores = topScores.sort((a, b) => a.score - b.score).slice(0, -1);
  // Remove the highest score
  topScores = topScores.sort((a, b) => b.score - a.score).slice(0, -1);

  // Calculate handicap differential for each remaining score
  // Formula: (Score - Course Rating) * 113 / Slope Rating
  const differentials = topScores.map(
    (entry) => ((entry.score - entry.courseRating) * 113) / entry.slopeRating
  );

  const handicap = differentials.reduce((sum, d) => sum + d, 0) / differentials.length;
  return Math.round(handicap * 10) / 10; // Round to 1 decimal place
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
