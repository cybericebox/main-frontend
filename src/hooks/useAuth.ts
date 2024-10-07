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
    return useMutation({
        mutationKey: ["signInWithCredentials"],
        mutationFn: async (data: ISignInWithCredentials) => await signInWithCredentialsFn(data),
    })
}

const SignOut = () => {
    return useMutation({
        mutationKey: ["signOut"],
        mutationFn: async () => await signOutFn(),
    })
}

const SignUpWithCredentials = () => {
    return useMutation({
        mutationKey: ["signUpWithCredentials"],
        mutationFn: async (data: ISignUpWithCredentials) => await signUpWithCredentialsFn(data),
    })
}

const SignUpWithCredentialsContinue = (code: string) => {
    return useMutation({
        mutationKey: ["signUpWithCredentialsContinue"],
        mutationFn: async (data: ISignUpWithCredentialsContinue) => await signUpWithCredentialsContinueFn(code, data),
    })
}

const ForgotPassword = () => {
    return useMutation({
        mutationKey: ["forgotPassword"],
        mutationFn: async (data: IForgotPassword) => await forgotPasswordFn(data),
    })
}

const ResetPassword = (code: string) => {
    return useMutation({
        mutationKey: ["resetPassword"],
        mutationFn: async (data: IResetPassword) => await resetPasswordFn(code, data),
    })
}

const ConfirmEmail = () => {
    return useMutation({
        mutationKey: ["confirmEmail"],
        mutationFn: async (code: string) => await confirmEmailFn(code),
    })
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