import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Typography,
    Box,
    TextField,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    useTheme,
} from '@mui/material';

import {
    loadSettingsFromLS,
    updateSettingsInLS,
} from '../../../utils/settings/settings';
import {
    SORT_ORDER_BY,
    SORT_ORDER_DIR,
    READABLE_SORT_ORDER_DIR,
    READABLE_SORT_ORDER_BY,
} from '../../../utils/settings/constants';
import {
    SettingsSchema,
    settingsSaveSchema,
} from '../../../utils/settings/schema';
import { AvatarSelector } from '../../../components/AvatarSelector';

interface SettingsFormProps {
    onSaveSuccess?: () => void;
    onSaveError?: () => void;
}

export const SettingsForm = ({
    onSaveSuccess,
    onSaveError,
}: SettingsFormProps) => {
    const {
        control,
        handleSubmit,
        trigger,
        formState: { errors },
    } = useForm<SettingsSchema>({
        resolver: zodResolver(settingsSaveSchema),
        defaultValues: async () => {
            return loadSettingsFromLS();
        },
        mode: 'onTouched',
        reValidateMode: 'onChange',
    });
    const { palette } = useTheme();

    const onSubmit = async (data: SettingsSchema) => {
        const isValid = await trigger();

        if (isValid) {
            updateSettingsInLS(data);
            onSaveSuccess?.();
        } else {
            onSaveError?.();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box display="flex" flexDirection="column" gap="16px">
                <Box
                    padding="16px"
                    sx={{
                        border: `1px solid ${palette.primary.main}`,
                        borderRadius: '24px',
                    }}
                >
                    <Typography variant="h2" marginBottom="16px">
                        Persona
                    </Typography>
                    <Box display="flex" flexDirection="column" gap="16px">
                        <Controller
                            name="avatar"
                            control={control}
                            render={({ field }) => (
                                <>
                                    <AvatarSelector
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    {errors.avatar?.message && (
                                        <Typography color="error">
                                            {errors.avatar.message}
                                        </Typography>
                                    )}
                                </>
                            )}
                        />

                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <>
                                    <TextField
                                        label="Name"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    {errors.name?.message && (
                                        <Typography color="error">
                                            {errors.name.message}
                                        </Typography>
                                    )}
                                </>
                            )}
                        />
                    </Box>
                </Box>
                <Box
                    padding="16px"
                    sx={{
                        border: `1px solid ${palette.primary.main}`,
                        borderRadius: '24px',
                    }}
                >
                    <Typography variant="h2" marginBottom="16px">
                        Sort Options
                    </Typography>
                    <Box display="flex" gap="16px">
                        <Controller
                            name="sortOptions.orderBy"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel id="sortOptions-orderBy">
                                        Order By
                                    </InputLabel>
                                    <Select
                                        labelId="sortOptions-orderBy"
                                        id="sortOptionsOrderBy"
                                        value={field.value ?? ''}
                                        label="Order By"
                                        onChange={field.onChange}
                                    >
                                        {SORT_ORDER_BY.map((orderBy) => (
                                            <MenuItem
                                                key={orderBy}
                                                value={orderBy}
                                            >
                                                {
                                                    READABLE_SORT_ORDER_BY[
                                                        orderBy
                                                    ]
                                                }
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="sortOptions.orderDirection"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel id="sortOptions-orderDirection">
                                        Order Direction
                                    </InputLabel>
                                    <Select
                                        labelId="sortOptions-orderDirections"
                                        id="sortOptionsOrderDirection"
                                        label="Order Direction"
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                    >
                                        {SORT_ORDER_DIR.map((orderDir) => (
                                            <MenuItem
                                                key={orderDir}
                                                value={orderDir}
                                            >
                                                {
                                                    READABLE_SORT_ORDER_DIR[
                                                        orderDir
                                                    ]
                                                }
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        />
                    </Box>
                </Box>
            </Box>

            {/* form actions */}
            <Box padding="16px" display="flex" justifyContent="center">
                <Button variant="outlined" type="submit">
                    Save Settings
                </Button>
            </Box>
        </form>
    );
};
