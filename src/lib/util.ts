import type { IEntry } from "../types/IEntry";

export function calculateHandicap(scores: IEntry[]) {
	let topScores = scores.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 6) ?? [];
	console.log("topScores", topScores);
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