import * as z from "zod";
import {PasswordSchema, UserSchema} from "@/types/user";

export interface IAuthenticated {
    IsAuthenticated: boolean;
    ID: string;
}

export const SignInWithCredentialsSchema = z.object({
    Email: UserSchema.shape.Email,
    Password: z.string({required_error: "Поле має бути заповненим"})
        .min(8, {message: "Пароль має складатися хоча б з 8 символів"})
        .max(32, {message: "Пароль має складатися не більше ніж з 32 символів"}),
    RecaptchaToken: z.string({required_error: "Поле має бути заповненим"}),
})

export interface ISignInWithCredentials extends z.infer<typeof SignInWithCredentialsSchema> {
}

export const SignUpWithCredentialsSchema = z.object({
    Email: UserSchema.shape.Email,
    RecaptchaToken: z.string({required_error: "Поле має бути заповненим"}),
})

export interface ISignUpWithCredentials extends z.infer<typeof SignUpWithCredentialsSchema> {
}

export const SignUpWithCredentialsContinueSchema = z.object({
    Email: UserSchema.shape.Email,
    Name: UserSchema.shape.Name,
    Password: PasswordSchema,
    ConfirmPassword: z.string({required_error: "Поле має бути заповненим"}),
}).refine(({Password, ConfirmPassword}) => Password === ConfirmPassword, {
    message: "Паролі не збігаються",
    path: ["ConfirmPassword"]
})

export interface ISignUpWithCredentialsContinue extends z.infer<typeof SignUpWithCredentialsContinueSchema> {
}

export const ForgotPasswordSchema = z.object({
    Email: UserSchema.shape.Email,
    RecaptchaToken: z.string({required_error: "Поле має бути заповненим"}),
})

export interface IForgotPassword extends z.infer<typeof ForgotPasswordSchema> {
}

export const ResetPasswordSchema = z.object({
    Password: PasswordSchema,
    ConfirmPassword: z.string({required_error: "Поле має бути заповненим"}),
}).refine(({Password, ConfirmPassword}) => Password === ConfirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"]
})

export interface IResetPassword extends z.infer<typeof ResetPasswordSchema> {
}

