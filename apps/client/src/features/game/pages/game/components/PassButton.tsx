import { Button, Tooltip, Box } from '@mui/material';
import { Block } from '@mui/icons-material';

import { useRoomContext } from '../../../contexts/RoomContext';
import { useGameContext } from '../../../contexts/GameContext';

export const PassButton = () => {
    const { clientId } = useRoomContext();
    const { inPlay, curTurnPlayer, makeMove } = useGameContext();

    let disabledMessage;
    if (curTurnPlayer?.id !== clientId) {
        disabledMessage = 'Waiting for turn...';
    } else if (!inPlay) {
        disabledMessage = "Can't pass when it's a free turn";
    }

    const mainButton = (
        <Button
            startIcon={<Block fontSize="small" />}
            disabled={Boolean(disabledMessage)}
            onClick={() => makeMove('pass')}
        >
            Pass
        </Button>
    );

    return !disabledMessage ? (
        mainButton
    ) : (
        <Tooltip title={disabledMessage} placement="left-end">
            <Box>{mainButton}</Box>
        </Tooltip>
    );
};
