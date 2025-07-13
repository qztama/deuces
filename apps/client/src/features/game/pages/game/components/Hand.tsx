import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    arrayMove,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { Box } from '@mui/material';
import { Card, Rank, Suit } from '@deuces/shared';

import {
    PlayingCard,
    PlayingCardProps,
} from '../../../components/PlayingCard/PlayingCard';
import { useGameContext } from '../../../contexts/GameContext';
import { PLAYING_CARD_WIDTH } from '../constants';

const OVERLAP = PLAYING_CARD_WIDTH / 3;

export const Hand = () => {
    const {
        hasDealtCards,
        hand,
        selectedCards,
        toggleSelectedCard,
        rearrangeHand,
    } = useGameContext();
    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 2,
            },
        })
    );

    const totalWidth = PLAYING_CARD_WIDTH + (hand.length - 1) * OVERLAP;
    const centerOffset = totalWidth / 2;

    return (
        <div
            style={{
                position: 'relative',
                height: '180px',
                width: `${totalWidth}px`,
            }}
        >
            <div
                style={{
                    position: 'relative',
                    left: '50%',
                }}
            >
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={({ active }) => {
                        setDraggingIdx(active.data.current?.sortable?.index);
                    }}
                    onDragEnd={({ active, over }) => {
                        setDraggingIdx(null);
                        if (active.id !== over?.id) {
                            const oldIndex = hand.indexOf(active.id as Card);
                            const newIndex = hand.indexOf(over?.id as Card);
                            rearrangeHand(arrayMove(hand, oldIndex, newIndex));
                        }
                    }}
                >
                    <SortableContext
                        items={hand}
                        strategy={rectSortingStrategy}
                    >
                        <AnimatePresence>
                            {hand.map((card, i) => {
                                const x = i * OVERLAP - centerOffset;

                                return (
                                    <motion.div
                                        key={card}
                                        custom={hasDealtCards}
                                        initial="initial"
                                        animate="enter"
                                        exit="exit"
                                        variants={{
                                            initial: {
                                                opacity: 0,
                                                y: 60,
                                                scale: 0.8,
                                            },
                                            enter: (isDealt: boolean) => ({
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                                x,
                                                transition: {
                                                    duration: isDealt ? 0 : 0.4,
                                                },
                                            }),
                                            exit: {
                                                opacity: 0,
                                                y: -60,
                                                transition: { duration: 0.4 },
                                            },
                                        }}
                                        style={{
                                            position: 'absolute',
                                            transformOrigin: 'bottom center',
                                            zIndex:
                                                draggingIdx === i ? 1000 : i,
                                        }}
                                    >
                                        <DraggablePlayingCard
                                            id={card}
                                            idx={i}
                                            width={PLAYING_CARD_WIDTH}
                                            rank={card.charAt(0) as Rank}
                                            suit={card.charAt(1) as Suit}
                                            isSelected={selectedCards.has(card)}
                                            toggleSelect={toggleSelectedCard}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
};

interface DraggablePlayingCardProps extends PlayingCardProps {
    id: Card;
    idx: number;
    isSelected: boolean;
    toggleSelect: (cardId: Card) => void;
}

const DraggablePlayingCard = (props: DraggablePlayingCardProps) => {
    const { id, idx, isSelected, toggleSelect, ...otherProps } = props;

    const { attributes, listeners, setNodeRef, transform } = useSortable({
        id,
    });

    return (
        <Box
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            data-selected={isSelected}
            sx={{
                transform: CSS.Transform.toString(transform),
                cursor: 'pointer',
                '&:hover': {
                    transform: CSS.Transform.toString({
                        x: transform?.x ?? 0,
                        y: (transform?.y ?? 0) - 5,
                        scaleX: 1,
                        scaleY: 1,
                    }),
                },
                '&[data-selected="true"]': {
                    transform: CSS.Transform.toString({
                        x: transform?.x ?? 0,
                        y: (transform?.y ?? 0) - 10,
                        scaleX: 1,
                        scaleY: 1,
                    }),
                },
            }}
            onClick={() => {
                toggleSelect(id);
            }}
        >
            <PlayingCard
                {...otherProps}
                sx={{
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                }}
            />
        </Box>
    );
};
