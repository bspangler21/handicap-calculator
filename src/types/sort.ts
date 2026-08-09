export const SORT_ORDER_OPTIONS = {
  asc: "Ascending",
  desc: "Descending",
} as const;

export type SortOrder = keyof typeof SORT_ORDER_OPTIONS;

export const SORT_KEY_OPTIONS = {
  course: "Course",
  date: "Date",
  score: "Score",
} as const;

export type SortKey = keyof typeof SORT_KEY_OPTIONS;
