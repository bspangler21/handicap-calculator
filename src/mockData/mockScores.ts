import type { IEntry } from "../types/IEntry";

export const mockScores: IEntry[] = [
	{
		id: "1",
		date: new Date("2024-01-01"),
		courseName: "Pebble Beach Golf Links",
		courseRating: 75.5,
		slopeRating: 145,
		score: 85,
	},
	{
		id: "2",
		date: new Date("2024-02-15"),
		courseName: "St Andrews Old Course",
		courseRating: 72.0,
		slopeRating: 130,
		score: 78,
	},
	{
		id: "3",
		date: new Date("2024-03-10"),
		courseName: "Augusta National Golf Club",
		courseRating: 74.0,
		slopeRating: 140,
		score: 82,
	},
];
