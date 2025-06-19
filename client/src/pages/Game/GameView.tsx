import { useState } from 'react';
import { Button, TextField } from '@mui/material';

import {
    WSMessageGameUpdated,
    WSMessagePlayMove,
} from '../../../../shared/wsMessages';

interface GameViewProps {
    gameState: WSMessageGameUpdated['payload']['gameState'];
    handleMove: (move: WSMessagePlayMove['payload']['move']) => void;
}

export const GameView = ({ gameState, handleMove }: GameViewProps) => {
    const [move, setMove] = useState<WSMessagePlayMove['payload']['move']>();

    return (
        <>
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {JSON.stringify(gameState, null, 2)}
            </pre>
            <TextField
                variant="outlined"
                label="Move"
                value={move}
                onChange={(e) => {
                    const move = e.target.value.split(
                        ','
                    ) as WSMessagePlayMove['payload']['move'];
                    setMove(move);
                }}
            />
            <Button disabled={!move} onClick={() => handleMove(move!)}>
                Play
            </Button>
        </>
    );
};
