import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    useTheme,
    TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    PersonaSchema,
    personaSaveSchema,
} from '../../../utils/settings/schema';
import {
    loadSettingsFromLS,
    updateSettingsInLS,
} from '../../../utils/settings/settings';
import { AvatarSelector } from '../../../components/AvatarSelector';
import { useRoomContext } from '../contexts/RoomContext';

export const PersonaSelectorDialog = () => {
    const { palette } = useTheme();
    const { setPersona } = useRoomContext();
    const {
        handleSubmit,
        control,
        trigger,
        formState: { errors },
    } = useForm<PersonaSchema>({
        resolver: zodResolver(personaSaveSchema),
        mode: 'onTouched',
        reValidateMode: 'onChange',
    });

    const onSubmit = async (data: PersonaSchema) => {
        const isValid = await trigger();

        if (isValid) {
            const savedSettings = loadSettingsFromLS();
            const updatedSettings = { ...savedSettings, ...data };

            updateSettingsInLS(updatedSettings);
            setPersona(data);
        }
    };

    return (
        <Dialog open={true} keepMounted>
            <Box
                sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `2px solid ${palette.secondary.main}`,
                    color: '#F4F5FA',
                    padding: '12px 8px',
                }}
            >
                <DialogTitle>
                    <Typography fontWeight="bold">
                        Choose Your Persona
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <form id="persona-form" onSubmit={handleSubmit(onSubmit)}>
                        <Box display="flex" flexDirection="column" gap="16px">
                            <Controller
                                name="avatar"
                                control={control}
                                render={({ field }) => (
                                    <AvatarSelector
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.avatar && (
                                <Typography color="error">
                                    {errors.avatar.message}
                                </Typography>
                            )}
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        label="Name"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.name && (
                                <Typography color="error">
                                    {errors.name.message}
                                </Typography>
                            )}
                        </Box>
                    </form>
                </DialogContent>
                <DialogActions
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-around',
                    }}
                >
                    <Button variant="outlined" onClick={handleSubmit(onSubmit)}>
                        Save
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};
