import * as z from 'zod'

export const SignUpSchema = z.object(
    {
        email: z.string({required_error: "Поле має бути заповненим"}).email({message: "Введіть коректну адресу електронної пошти"}),
    }
)

export const SignUpContinueSchema = z.object(
    {
        email: z.string({required_error: "Поле має бути заповненим"}),
        name: z.string({required_error: "Поле має бути заповненим"})
            .min(2, {message: "Ім'я має складатися хоча б з 2 символів"}),
        password: z.string({required_error: "Поле має бути заповненим"})
            .min(8, {message: "Пароль має складатися хоча б з 8 символів"})
            .max(32, {message: "Пароль має складатися не більше ніж з 32 символів"})
            .regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).*$/i, {message: "Пароль має містити цифри, великі та малі літери, а також спеціальні символи"}),
        confirmPassword: z.string({required_error: "Поле має бути заповненим"})

    }
).refine(({password, confirmPassword}) => password === confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"]
})

export const SignInSchema = z.object(
    {
        email: z.string({required_error: "Поле має бути заповненим"}).email({message: "Введіть коректну адресу електронної пошти"}),
        password: z.string({required_error: "Поле має бути заповненим"}).min(1, {message: "Введіть пароль"})
    }
)

export const ForgotPasswordSchema = z.object(
    {
        email: z.string({required_error: "Поле має бути заповненим"}).email({message: "Введіть коректну адресу електронної пошти"}),
    }
)

export const ResetPasswordSchema = z.object(
    {
        password: z.string({required_error: "Поле має бути заповненим"})
            .min(8, {message: "Пароль має складатися хоча б з 8 символів"})
            .max(32, {message: "Пароль має складатися не більше ніж з 32 символів"})
            .regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).*$/i, {message: "Пароль має містити цифри, великі та малі літери, а також спеціальні символи"}),
        confirmPassword: z.string({required_error: "Поле має бути заповненим"})
    }
).refine(({password, confirmPassword}) => password === confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"]
})

export const ChangePasswordSchema = z.object(
    {
        oldPassword: z.string({required_error: "Поле має бути заповненим"}).min(8, {message: "Пароль має складатися хоча б з 8 символів"}),
        password: z.string({required_error: "Поле має бути заповненим"})
            .min(8, {message: "Пароль має складатися хоча б з 8 символів"})
            .max(32, {message: "Пароль має складатися не більше ніж з 32 символів"})
            .regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).*$/i, {message: "Пароль має містити цифри, великі та малі літери, а також спеціальні символи"}),
        confirmPassword: z.string({required_error: "Поле має бути заповненим"})
    }).refine(({password, confirmPassword}) => password === confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"]
})