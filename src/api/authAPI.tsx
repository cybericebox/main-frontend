export interface ISignInWithCredentials {
    email: string
    password: string
    recaptchaToken: string
}

export const signInWithCredentialsFn = async (data: ISignInWithCredentials) => {
    return await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
}

export const signOutFn = async () => {
    return await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })
}

export interface ISignUpWithCredentials {
    email: string
    recaptchaToken: string
}

export const signUpWithCredentialsFn = async (data: ISignUpWithCredentials) => {
    return await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
}

export interface ISignUpContinueWithCredentials {
    name: string
    email: string
    password: string
}

export const signUpContinueWithCredentialsFn = async (code: string, data: ISignUpContinueWithCredentials) => {
    return await fetch(`/api/auth/sign-up/${code}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
}

export interface IForgotPassword {
    email: string
    recaptchaToken: string
}

export const forgotPasswordFn = async (data: IForgotPassword) => {
    return await fetch('/api/auth/password/forgot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
}

export interface IResetPassword {
    newPassword: string
}

export const resetPasswordFn = async (code: string, data: IResetPassword) => {
    return await fetch(`/api/auth/password/reset/${code}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
}