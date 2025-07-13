import { Box, Button, Tooltip } from '@mui/material';
import { Sort } from '@mui/icons-material';
import { RANKS, SUITS } from '@deuces/shared';

import { useGameContext } from '../../../contexts/GameContext';

const SORT_ORDER_BY = ['rank', 'suit'] as const;
const SORT_ORDER_DIR = ['htl', 'lth'] as const;

interface SortOptions {
    orderBy: (typeof SORT_ORDER_BY)[number];
    orderDirection: (typeof SORT_ORDER_DIR)[number];
}

const DEFAULT_SORT_OPTIONS: SortOptions = {
    orderBy: 'rank',
    orderDirection: 'htl',
};

const getSortOptions = (): SortOptions => {
    try {
        const saved = localStorage.getItem('sort-options');

        if (saved) {
            const parsed = JSON.parse(saved);

            return {
                orderBy: SORT_ORDER_BY.includes(parsed?.orderBy)
                    ? parsed.orderBy
                    : 'rank',
                orderDirection: SORT_ORDER_DIR.includes(parsed?.orderDirection)
                    ? parsed.orderDirection
                    : 'htl',
            };
        }
    } catch (err) {} // eat up error if JSON parse fails

    return DEFAULT_SORT_OPTIONS;
};

export const SortButton = () => {
    const { hand, rearrangeHand } = useGameContext();

    const handleSort = () => {
        const { orderBy, orderDirection } = getSortOptions();
        const sortedHand = hand.slice().sort((cardA, cardB) => {
            const cardARankScore = RANKS.findIndex(
                (r) => r === cardA.charAt(0)
            );
            const cardASuitScore = SUITS.findIndex(
                (s) => s === cardA.charAt(1)
            );
            const cardBRankScore = RANKS.findIndex(
                (r) => r === cardB.charAt(0)
            );
            const cardBSuitScore = SUITS.findIndex(
                (s) => s === cardB.charAt(1)
            );

            let cardAScore;
            let cardBScore;

            if (orderBy === 'rank') {
                cardAScore = cardARankScore * 100 + cardASuitScore;
                cardBScore = cardBRankScore * 100 + cardBSuitScore;
            } else {
                cardAScore = cardASuitScore * 100 + cardARankScore;
                cardBScore = cardBSuitScore * 100 + cardBRankScore;
            }

            return orderDirection === 'htl'
                ? cardBScore - cardAScore
                : cardAScore - cardBScore;
        });

        rearrangeHand(sortedHand);
    };

    return (
        <Tooltip title="Sort" placement="left-end">
            <Box>
                <Button
                    startIcon={<Sort fontSize="small" />}
                    onClick={handleSort}
                >
                    Sort
                </Button>
            </Box>
        </Tooltip>
    );
};
