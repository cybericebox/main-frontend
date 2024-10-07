import axios, {type AxiosResponse} from "axios";
import {baseAPI} from "@/api/baseAPI";
import type {IResponse} from "@/types/api";
import type {
    IForgotPassword,
    IResetPassword,
    ISignInWithCredentials,
    ISignUpWithCredentials,
    ISignUpWithCredentialsContinue
} from "@/types/auth";

export const signInWithCredentialsFn = async (data: ISignInWithCredentials): Promise<AxiosResponse<IResponse, any>> => {
    return await baseAPI.post('/auth/sign-in', data)
}

export const signOutFn = async (): Promise<AxiosResponse<Response, any>> => {
    return await baseAPI.post('/auth/sign-out')
}

export const signUpWithCredentialsFn = async (data: ISignUpWithCredentials): Promise<AxiosResponse<IResponse, any>> => {
    return await baseAPI.post('/auth/sign-up', data)
}

export const signUpWithCredentialsContinueFn = async (code: string, data: ISignUpWithCredentialsContinue): Promise<AxiosResponse<IResponse, any>> => {
    return await axios.post(`/auth/sign-up/continue/${code}`, data)
}

export const forgotPasswordFn = async (data: IForgotPassword): Promise<AxiosResponse<IResponse, any>> => {
    return await baseAPI.post('/auth/password/forgot', data)
}

export const resetPasswordFn = async (code: string, {Password}: IResetPassword): Promise<AxiosResponse<IResponse, any>> => {
    return await baseAPI.post(`/auth/password/reset/${code}`, {
        Password
    })
}

export const confirmEmailFn = async (code: string): Promise<AxiosResponse<IResponse, any>> => {
    return await baseAPI.post(`/auth/email/confirm/${code}`)
}