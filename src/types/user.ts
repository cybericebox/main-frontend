import { z } from 'zod'

export const UserSchema = z.object({
	ID: z.uuid({ message: 'Некоректний ідентифікатор' }),
	Email: z.email({ message: 'Введіть коректну адресу електронної пошти' }),
	Name: z.string({ error: 'Поле має бути заповненим' })
        .min(3, {message: "Ім'я має складатися хоча б з 3 символів"}),
    Role: z.union([z.literal("Користувач"), z.literal("Адміністратор")]),
	Picture: z.string({ error: 'Поле має бути заповненим' }).optional().or(z.url({ message: 'Некоректне посилання на зображення' })),
	LastSeen: z.coerce.date({ error: 'Поле має бути заповненим' }),
	CreatedAt: z.coerce.date({ error: 'Поле має бути заповненим' })
})

export interface IUser extends z.infer<typeof UserSchema> {
}

export const UserProfileSchema = z.object({}).extend(UserSchema.pick({ Name: true, Picture: true, Email: true }))

export interface IUpdateUserProfile extends z.infer<typeof UserProfileSchema> {
}

export const PasswordSchema = z.string({ error: 'Поле має бути заповненим' })
    .min(8, {message: "Пароль має складатися хоча б з 8 символів"})
    .max(32, {message: "Пароль має складатися не більше ніж з 32 символів"})
    .regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).*$/i, {message: "Пароль має містити цифри, великі та малі літери, а також спеціальні символи"})


export const UserPasswordSchema = z.object({
	OldPassword: z.string({ error: 'Поле має бути заповненим' }).min(8, { message: 'Пароль має складатися хоча б з 8 символів' }),
    NewPassword: PasswordSchema,
	ConfirmPassword: z.string({ error: 'Поле має бути заповненим' })
}).refine(({NewPassword, ConfirmPassword}) => NewPassword === ConfirmPassword, {
    message: "Паролі не збігаються",
    path: ["ConfirmPassword"]
})

export interface IUpdateUserPassword extends z.infer<typeof UserPasswordSchema> {
}

export enum ErrorResponseStatusCodes {
    InvalidUserCredentials = 20801,
    InvalidOldPassword = 20802,
    InvalidPasswordComplexity = 20803,
}