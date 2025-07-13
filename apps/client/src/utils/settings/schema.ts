import { z } from 'zod';
import { AVATAR_OPTIONS } from '@deuces/shared';

import { SORT_ORDER_BY, SORT_ORDER_DIR } from './constants';

const personaSchema = z.object({
    avatar: z.enum(AVATAR_OPTIONS).optional(),
    name: z.string().optional(),
});

export const personaSaveSchema = personaSchema.extend({
    avatar: personaSchema.shape.avatar.refine((val) => val !== undefined, {
        message: 'Avatar is required.',
    }),
    name: personaSchema.shape.name.refine(
        (val) => val?.trim() !== '' && val !== undefined,
        {
            message: 'Name is required.',
        }
    ),
});

const sortOptionsSchema = z.object({
    sortOptions: z.object({
        orderBy: z.enum(SORT_ORDER_BY),
        orderDirection: z.enum(SORT_ORDER_DIR),
    }),
});

export const settingsSchema = personaSchema.merge(sortOptionsSchema);
export const settingsSaveSchema = personaSaveSchema.merge(sortOptionsSchema);

// export const settingsSaveSchema = settingsSchema.superRefine((data, ctx) => {
//     if (!data.name || data.name.trim() === '') {
//         ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             path: ['name'],
//             message: 'Name is required',
//         });
//     }
//     if (!data.avatar) {
//         ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             path: ['avatar'],
//             message: 'Avatar is required',
//         });
//     }
// });

export type PersonaSchema = z.infer<typeof personaSchema>;
export type SettingsSchema = z.infer<typeof settingsSchema>;
