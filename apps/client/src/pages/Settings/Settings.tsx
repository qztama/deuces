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
} from '@mui/material';

import {
    SORT_ORDER_BY,
    SORT_ORDER_DIR,
    READABLE_SORT_ORDER_DIR,
    READABLE_SORT_ORDER_BY,
    DEFAULT_SORT_OPTIONS,
} from '../../constants';
import { settingsSchema, settingsSaveSchema, SettingsSchema } from './schema';
import { AvatarSelector } from './components/AvatarSelector';

const SETTINGS_LS_KEY = 'settings';

const loadSettingsFromLS = (): SettingsSchema => {
    const raw = localStorage.getItem(SETTINGS_LS_KEY);

    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            return settingsSchema.parse(parsed);
        } catch (err) {
            console.warn('Invalid settings in local storage');
        }
    }

    return {
        avatar: undefined,
        name: undefined,
        sortOptions: DEFAULT_SORT_OPTIONS,
    };
};

const SettingsForm = () => {
    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<SettingsSchema>({
        resolver: zodResolver(settingsSchema),
        defaultValues: async () => {
            return loadSettingsFromLS();
        },
    });

    const onSubmit = (data: SettingsSchema) => {
        const result = settingsSaveSchema.safeParse(data);

        if (!result.success) {
            console.log(result.error.format());

            // Manually set the RHF field errors so they appear on the form:
            result.error.errors.forEach((err) => {
                if (err.path && err.path.length > 0) {
                    setError(err.path[0] as keyof SettingsSchema, {
                        type: 'manual',
                        message: err.message,
                    });
                }
            });

            return;
        }

        localStorage.setItem('settings', JSON.stringify(result.data));
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h2">Persona</Typography>
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
            {errors.avatar?.message && <p>{errors.avatar.message}</p>}
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
            {errors.name?.message && <p>{errors.name.message}</p>}
            <Typography variant="h2">Sort Options</Typography>
            <Box display="flex">
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
                                    <MenuItem key={orderBy} value={orderBy}>
                                        {READABLE_SORT_ORDER_BY[orderBy]}
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
                                    <MenuItem key={orderDir} value={orderDir}>
                                        {READABLE_SORT_ORDER_DIR[orderDir]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                />
            </Box>
            <Button variant="outlined" type="submit">
                Save
            </Button>
        </form>
    );
};

const Settings = () => {
    return (
        <Box>
            <Typography variant="h1">Settings</Typography>
            <SettingsForm />
        </Box>
    );
};

export default Settings;
