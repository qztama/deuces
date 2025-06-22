import { Rank } from '@shared/game';

import JackShield from '../../../../assets/icons/shield.svg?react';
import QueenCrown from '../../../../assets/icons/queen-crown.svg?react';
import KingCrown from '../../../../assets/icons/king-crown.svg?react';

export const WIDTH_TO_HEIGHT_RATIO = 5 / 7;
export const FACE_ICON_TO_WIDTH_RATIO = 2 / 5;
export const LABEL_TO_WIDTH_RATIO = 3 / 20;

export const PIP_POSITIONS: Record<
    Exclude<Rank, 'J' | 'Q' | 'K'>,
    (boolean | undefined)[][]
> = {
    A: [[false]],
    2: [[false, true]],
    3: [[false, true, true]],
    4: [
        [false, true],
        [false, true],
    ],
    5: [[false, true], [false], [false, true]],
    6: [
        [false, true, true],
        [false, true, true],
    ],
    7: [
        [false, false, true],
        [undefined, false, undefined, undefined, undefined],
        [false, false, true],
    ],
    8: [
        [false, false, true],
        [undefined, false, true, undefined],
        [false, false, true],
    ],
    9: [[false, false, true, true], [false], [false, false, true, true]],
    T: [
        [false, false, true, true],
        [false, true],
        [false, false, true, true],
    ],
};

export const FACE_SVG_MAP: Record<
    Extract<Rank, 'J' | 'Q' | 'K'>,
    React.FC<React.SVGProps<SVGSVGElement>>
> = {
    J: JackShield,
    Q: QueenCrown,
    K: KingCrown,
};
