"use client"

import {useMutation, useQuery} from "@tanstack/react-query";
import {changePasswordFn, getSelfFn, IChangePassword} from "@/api/userAPI";

const useGetUser = (enabled: boolean) => {
    return useQuery({
        queryKey: ["self"],
        queryFn: getSelfFn,
        enabled: enabled,
    })
}

const useChangePassword = () => {
    return useMutation({
        mutationKey: ["changePassword"],
        mutationFn: async (data: IChangePassword) => await changePasswordFn(data),
    })
}

export const useUser = () => {
    return {
        useGetUser,
        useChangePassword,
    }
}