import { Box } from '@mui/material';
import { Rank, Suit } from '@shared/game/types';

import { useGameContext } from '../contexts/GameContext';
import { PlayingCardIcon } from './PlayingCard/PlayingCardIcon';

export const SelectedCardsDisplay = () => {
    const { selectedCards } = useGameContext();

    return (
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
    );
};
