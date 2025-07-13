import { Badge, Box, useTheme } from '@mui/material';
import { Check } from '@mui/icons-material';
import { GameAvatar } from './GameAvatar';
import { AVATAR_OPTIONS } from '@deuces/shared';

interface AvatarSelectorProps {
    value: string | undefined;
    onChange: (value: string) => void;
}

export const AvatarSelector = ({ value, onChange }: AvatarSelectorProps) => {
    const { palette } = useTheme();

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
                                ? `4px solid ${palette.secondary.main}`
                                : '4px solid transparent',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            transition: 'border 0.2s ease-in-out',
                        }}
                    >
                        {isSelected ? (
                            <Badge
                                overlap="circular"
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                badgeContent={
                                    <Box
                                        sx={{
                                            padding: 0,
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            bgcolor: `${palette.secondary.main}`,
                                        }}
                                    >
                                        <Check />
                                    </Box>
                                }
                            >
                                <GameAvatar
                                    key={avatarName}
                                    sizeInPx={64}
                                    name={avatarName}
                                />
                            </Badge>
                        ) : (
                            <GameAvatar
                                key={avatarName}
                                sizeInPx={64}
                                name={avatarName}
                            />
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};
