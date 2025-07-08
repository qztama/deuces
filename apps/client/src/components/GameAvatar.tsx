import { Avatar } from '@mui/material';
import { AvatarOptions } from '@deuces/shared';

import AstroAvatar from '../assets/avatars/astro.svg?react';
import AstrobearAvatar from '../assets/avatars/astrobear.svg?react';
import GorillaAvatar from '../assets/avatars/gorilla.svg?react';
import MouseAvatar from '../assets/avatars/mouse.svg?react';

interface GameAvatarProps {
    name: AvatarOptions;
    sizeInPx: number;
}

const getGameAvatarIcon = (name: AvatarOptions) => {
    switch (name) {
        case 'ASTRO':
            return <AstroAvatar />;
        case 'ASTROBEAR':
            return <AstrobearAvatar />;
        case 'GORILLA':
            return <GorillaAvatar />;
        case 'MOUSE':
        default:
            return <MouseAvatar />;
    }
};

export const GameAvatar = ({ name, sizeInPx }: GameAvatarProps) => {
    const AvatarIcon = getGameAvatarIcon(name);

    return (
        <Avatar sx={{ width: `${sizeInPx}px`, height: `${sizeInPx}px` }}>
            {AvatarIcon}
        </Avatar>
    );
};
