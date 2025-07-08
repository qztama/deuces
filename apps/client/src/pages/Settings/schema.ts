import { z } from 'zod';
import { AVATAR_OPTIONS } from '@deuces/shared';

import { SORT_ORDER_BY, SORT_ORDER_DIR } from '../../constants';

export const settingsSchema = z.object({
    avatar: z.enum(AVATAR_OPTIONS).optional(),
    name: z.string().optional(),
    sortOptions: z.object({
        orderBy: z.enum(SORT_ORDER_BY),
        orderDirection: z.enum(SORT_ORDER_DIR),
    }),
});

export const settingsSaveSchema = settingsSchema.superRefine((data, ctx) => {
    if (!data.name || data.name.trim() === '') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['name'],
            message: 'Name is required',
        });
    }
    if (!data.avatar) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['avatar'],
            message: 'Avatar is required',
        });
    }
});

export type SettingsSchema = z.infer<typeof settingsSchema>;
