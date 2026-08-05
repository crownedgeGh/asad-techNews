export const CATEGORIES = ['Tech News', 'AI Tools', 'Reviews', 'General News'] as const;

export type Category = (typeof CATEGORIES)[number];
