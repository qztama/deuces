import { Typography, Box, useTheme } from '@mui/material';
import { Toaster, toast } from 'react-hot-toast';

import { SettingsForm } from './components/SettingsForm';

const Settings = () => {
    const { palette } = useTheme();

    const handleSaveSuccess = () => {
        toast('Successfully saved!', {
            duration: 4000,
            style: {
                background: palette.background.default,
                border: `1px solid ${palette.success.main}`,
                color: palette.success.main,
            },
        });
    };

    return (
        <>
            <Toaster position="bottom-center" />
            <Box padding="16px">
                <Typography variant="h1" marginBottom="16px">
                    Settings
                </Typography>
                <SettingsForm onSaveSuccess={handleSaveSuccess} />
            </Box>
        </>
    );
};

export default Settings;
