import { useCallback } from 'react';
import { useTheme } from '@mui/material';
import { ThunderstormOutlined, CancelOutlined } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { WSMessageError, WS_ERR_TYPES } from '@shared/wsMessages';

type GameError = {
    type: WSMessageError['payload']['type'];
    message: string;
};

export function useWSErrorHandler() {
    const { palette } = useTheme();

    return useCallback(
        ({ type, message }: GameError) => {
            let errorIcon;
            let errorColor;

            switch (type) {
                case WS_ERR_TYPES.INVALID_MOVE:
                    errorIcon = (
                        <CancelOutlined fontSize="small" color={errorColor} />
                    );
                    errorColor = palette.primary.main;
                    break;
                case WS_ERR_TYPES.GENERIC:
                default:
                    errorIcon = <ThunderstormOutlined fontSize="small" />;
                    errorColor = palette.error.main;
                    break;
            }

            toast(message, {
                duration: 4000,
                icon: errorIcon,
                style: {
                    background: palette.background.default,
                    border: `1px solid ${errorColor}`,
                    color: errorColor,
                },
            });
        },
        [palette]
    );
}
