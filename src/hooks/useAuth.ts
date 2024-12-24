import {useMutation} from "@tanstack/react-query";
import {
    confirmEmailFn,
    forgotPasswordFn,
    resetPasswordFn,
    signInWithCredentialsFn,
    signOutFn,
    signUpWithCredentialsContinueFn,
    signUpWithCredentialsFn
} from "@/api/authAPI";
import type {
    IForgotPassword,
    IResetPassword,
    ISignInWithCredentials,
    ISignUpWithCredentials,
    ISignUpWithCredentialsContinue
} from "@/types/auth";

const SignInWithCredentials = () => {
    const {
        data: SignInWithCredentialsResponse,
        isPending: PendingSignInWithCredentials,
        mutate: SignInWithCredentials
    } = useMutation({
        mutationKey: ["signInWithCredentials"],
        mutationFn: async (data: ISignInWithCredentials) => await signInWithCredentialsFn(data),
    })

    return {SignInWithCredentialsResponse, SignInWithCredentials, PendingSignInWithCredentials}
}

const SignOut = () => {
    const {
        data: SignOutResponse,
        isPending: PendingSignOut,
        mutate: SignOut
    } = useMutation({
        mutationKey: ["signOut"],
        mutationFn: async () => await signOutFn(),
    })

    return {SignOutResponse, SignOut, PendingSignOut}
}

const SignUpWithCredentials = () => {
    const {
        data: SignUpWithCredentialsResponse,
        isPending: PendingSignUpWithCredentials,
        mutate: SignUpWithCredentials
    } = useMutation({
        mutationKey: ["signUpWithCredentials"],
        mutationFn: async (data: ISignUpWithCredentials) => await signUpWithCredentialsFn(data),
    })

    return {SignUpWithCredentialsResponse, SignUpWithCredentials, PendingSignUpWithCredentials}
}

const SignUpWithCredentialsContinue = (code: string) => {
    const {
        data: SignUpWithCredentialsContinueResponse,
        isPending: PendingSignUpWithCredentialsContinue,
        mutate: SignUpWithCredentialsContinue
    } = useMutation({
        mutationKey: ["signUpWithCredentialsContinue"],
        mutationFn: async (data: ISignUpWithCredentialsContinue) => await signUpWithCredentialsContinueFn(code, data),
    })

    return {SignUpWithCredentialsContinueResponse, SignUpWithCredentialsContinue, PendingSignUpWithCredentialsContinue}
}

const ForgotPassword = () => {
    const {
        data: ForgotPasswordResponse,
        isPending: PendingForgotPassword,
        mutate: ForgotPassword
    } = useMutation({
        mutationKey: ["forgotPassword"],
        mutationFn: async (data: IForgotPassword) => await forgotPasswordFn(data),
    })

    return {ForgotPasswordResponse, ForgotPassword, PendingForgotPassword}
}

const ResetPassword = (code: string) => {
    const {
        data: ResetPasswordResponse,
        isPending: PendingResetPassword,
        mutate: ResetPassword
    } = useMutation({
        mutationKey: ["resetPassword"],
        mutationFn: async (data: IResetPassword) => await resetPasswordFn(code, data),
    })

    return {ResetPasswordResponse, ResetPassword, PendingResetPassword}
}

const ConfirmEmail = () => {
    const {
        data: ConfirmEmailResponse,
        isPending: PendingConfirmEmail,
        mutate: ConfirmEmail
    } = useMutation({
        mutationKey: ["confirmEmail"],
        mutationFn: async (code: string) => await confirmEmailFn(code),
    })

    return {ConfirmEmailResponse, ConfirmEmail, PendingConfirmEmail}
}

export const useAuth = () => {
    return {
        SignInWithCredentials,
        SignOut,
        SignUpWithCredentials,
        SignUpWithCredentialsContinue,
        ForgotPassword,
        ResetPassword,
        ConfirmEmail,
    }
}