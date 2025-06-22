import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';

import {
    WSMessageGameUpdated,
    WSMessagePlayMove,
} from '../../../../shared/wsMessages';
import { PlayingCard } from './components/PlayingCard';
import { Rank, Suit } from '@shared/game';

interface GameViewProps {
    gameState: WSMessageGameUpdated['payload']['gameState'];
    handleMove: (move: WSMessagePlayMove['payload']['move']) => void;
}

export const GameView = ({ gameState, handleMove }: GameViewProps) => {
    const [move, setMove] = useState<WSMessagePlayMove['payload']['move']>();
    const cards = [];

    for (let s of ['D', 'C', 'H', 'S']) {
        for (let r of [
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'T',
            'J',
            'Q',
            'K',
            'A',
            '2',
        ]) {
            cards.push(
                <PlayingCard
                    key={`${r}${s}`}
                    suit={s as Suit}
                    rank={r as Rank}
                />
            );
        }
    }

    return (
        <>
            {/* <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
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
            /> */}
            <Box>{cards}</Box>
            {/* <Button disabled={!move} onClick={() => handleMove(move!)}>
                Play
            </Button> */}
        </>
    );
};
