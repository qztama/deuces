import { Box } from '@mui/material';
import { GameAvatar } from '../../../components/GameAvatar';
import { AVATAR_OPTIONS } from '@deuces/shared';

interface AvatarSelectorProps {
    value: string | undefined;
    onChange: (value: string) => void;
}

export const AvatarSelector = ({ value, onChange }: AvatarSelectorProps) => {
    return (
        <Box display="flex" gap="8px">
            {AVATAR_OPTIONS.map((avatarName) => {
                const isSelected = value === avatarName;

                return (
                    <Box
                        key={avatarName}
                        onClick={() => onChange(avatarName)}
                        sx={{
                            border: isSelected
                                ? '2px solid #1976d2'
                                : '2px solid transparent',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            transition: 'border 0.2s ease-in-out',
                        }}
                    >
                        <GameAvatar
                            key={avatarName}
                            sizeInPx={64}
                            name={avatarName}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};
