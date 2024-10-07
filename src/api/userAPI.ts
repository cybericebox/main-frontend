import {baseAPI} from "@/api/baseAPI";
import type {IResponse} from "@/types/api";
import type {AxiosResponse} from "axios";
import type {IUpdateUserPassword, IUpdateUserProfile, IUser} from "@/types/user";

export const getProfileFn = async (): Promise<AxiosResponse<IResponse<IUser>, any>> => {
    return await baseAPI.get('/auth/self/profile')
};

export const updatePasswordFn = async ({
                                           OldPassword,
                                           NewPassword
                                       }: IUpdateUserPassword): Promise<AxiosResponse<IResponse, any>> => {
    return await baseAPI.patch('/auth/self/change', {
        OldPassword,
        NewPassword
    }, {})
}

export const updateProfileFn = async (data: IUpdateUserProfile): Promise<AxiosResponse<IResponse, any>> => {
    return await baseAPI.put('/auth/self/profile', data, {})
}