import { Suit } from '@deuces/shared';

import Diamond from '../../../assets/icons/suit-diamond-fill.svg?react';
import Club from '../../../assets/icons/suit-club-fill.svg?react';
import Heart from '../../../assets/icons/suit-heart-fill.svg?react';
import Spade from '../../../assets/icons/suit-spade-fill.svg?react';

export const SuitIcon = ({
    suit,
    fill,
    size,
    isFlipped,
}: {
    suit: Suit;
    fill: string;
    size: string | number;
    isFlipped?: boolean;
}) => {
    const transformProp = isFlipped
        ? { style: { transform: 'rotate(180deg)' } }
        : {};
    switch (suit) {
        case 'D':
            return (
                <Diamond
                    {...transformProp}
                    fill={fill}
                    width={size}
                    height={size}
                />
            );
        case 'C':
            return (
                <Club
                    {...transformProp}
                    fill={fill}
                    width={size}
                    height={size}
                />
            );
        case 'H':
            return (
                <Heart
                    {...transformProp}
                    fill={fill}
                    width={size}
                    height={size}
                />
            );
        default: // spade
            return (
                <Spade
                    {...transformProp}
                    fill={fill}
                    width={size}
                    height={size}
                />
            );
    }
};
