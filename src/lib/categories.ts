export const CATEGORIES = ['Tech News', 'New Products', 'Reviews', 'General News'] as const;

export type Category = (typeof CATEGORIES)[number];
