import { Button, Tooltip, Box } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import { useGameContext } from '../../../contexts/GameContext';
import { useRoomContext } from '../../../contexts/RoomContext';

export const PlayButton = () => {
    const { inPlay, selectedCards, curTurnPlayer, makeMove } = useGameContext();
    const { clientId } = useRoomContext();

    let disabledMessage;
    if (curTurnPlayer?.id !== clientId) {
        disabledMessage = 'Waiting for turn...';
    } else if (selectedCards.size < 1) {
        disabledMessage = 'Cards must be selected to be played.';
    } else if (inPlay && selectedCards.size !== inPlay.hand.length) {
        disabledMessage = 'Cards must match the number of cards in play.';
    }

    const mainButton = (
        <Button
            startIcon={<PlayArrow fontSize="small" />}
            disabled={Boolean(disabledMessage)}
            onClick={() => makeMove('play')}
        >
            Play
        </Button>
    );

    return (
        <Tooltip title={disabledMessage} placement="left-end">
            <Box>{mainButton}</Box>
        </Tooltip>
    );
};
