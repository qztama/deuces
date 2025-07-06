import { Box, Typography } from '@mui/material';
import { getHandType, getHandRep } from '@deuces/shared/utils';
import { Rank, Suit, Card, HandType } from '@deuces/shared/types';

import { useGameContext } from '../contexts/GameContext';
import { PlayingCardIcon } from './PlayingCard/PlayingCardIcon';

const READABLE_SUIT_NAMES: Record<Suit, string> = {
    D: 'Diamonds',
    C: 'Clubs',
    H: 'Hearts',
    S: 'Spades',
};

function getHandName(move: Card[]) {
    const handType = getHandType(move);

    if (!handType) {
        return null;
    }

    const handRep = getHandRep(handType, move);
    const handRepRank = handRep.charAt(0) === 'T' ? 10 : handRep.charAt(0);
    const handRepSuit = handRep.charAt(1) as Suit;

    switch (handType) {
        case 'single':
            return `${handRepRank} of ${READABLE_SUIT_NAMES[handRepSuit]}`;
        case 'pair':
            return `Pair of ${handRepRank}'s`;
        case 'triple':
            return `Triple ${handRepRank}'s`;
        case 'quad':
            return `Quad ${handRepRank}'s`;
        case 'straight':
            return `${handRepRank}-High Straight`;
        case 'flush':
            return `${handRepRank}-High ${READABLE_SUIT_NAMES[handRepSuit]} Flush`;
        case 'fullhouse':
            return `Fullhouse of ${handRepRank}'s`;
        case 'fourplusone':
            return `Quad ${handRepRank}'s With Kicker`;
        case 'straightflush':
            return `${handRepRank}-High Straight Flush`;
        default:
            return null;
    }
}

export const SelectedCardsDisplay = () => {
    const { selectedCards } = useGameContext();
    const handName = getHandName(Array.from(selectedCards));

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="4px"
        >
            <Box display="flex" gap="8px">
                {Array.from(selectedCards).map((c) => (
                    <PlayingCardIcon
                        key={c}
                        rank={c.charAt(0) as Rank}
                        suit={c.charAt(1) as Suit}
                        widthInPx={28.6}
                    />
                ))}
            </Box>
            {handName && <Typography>{handName}</Typography>}
        </Box>
    );
};
