// Settings
export const SORT_ORDER_BY = ['rank', 'suit'] as const;
export const SORT_ORDER_DIR = ['htl', 'lth'] as const;

export const READABLE_SORT_ORDER_BY: Record<
    (typeof SORT_ORDER_BY)[number],
    string
> = {
    rank: 'Rank',
    suit: 'Suit',
};

export const READABLE_SORT_ORDER_DIR: Record<
    (typeof SORT_ORDER_DIR)[number],
    string
> = {
    htl: 'High to Low',
    lth: 'Low to High',
};

export interface SortOptions {
    orderBy: (typeof SORT_ORDER_BY)[number];
    orderDirection: (typeof SORT_ORDER_DIR)[number];
}

export const DEFAULT_SORT_OPTIONS: SortOptions = {
    orderBy: 'rank',
    orderDirection: 'htl',
};
