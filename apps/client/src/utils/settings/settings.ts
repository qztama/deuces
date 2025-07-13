import { SettingsSchema, settingsSchema } from './schema';
import { DEFAULT_SORT_OPTIONS } from './constants';

const SETTINGS_LS_KEY = 'settings';

export const loadSettingsFromLS = (): SettingsSchema => {
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

export const updateSettingsInLS = (settings: SettingsSchema) => {
    localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(settings));
};
