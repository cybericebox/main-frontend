import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getProfileFn, updatePasswordFn, updateProfileFn} from "@/api/userAPI";
import type {IResponse} from "@/types/api";
import {IUpdateUserPassword, IUpdateUserProfile, IUser, UserSchema} from "@/types/user";

const useGetProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: getProfileFn,
        select: (data): IResponse<IUser> => {
            const res = UserSchema.safeParse(data.data.Data)
            if (!res.success) {
                throw new Error("Invalid response")
            } else {
                data.data.Data = res.data
            }

            return data.data
        },
    })
}

const useUpdateProfile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ["updateProfile"],
        mutationFn: async (data: IUpdateUserProfile) => await updateProfileFn(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["profile"]}).catch(console.error)
        }
    })
}
const useUpdatePassword = () => {
    return useMutation({
        mutationKey: ["updatePassword"],
        mutationFn: async (data: IUpdateUserPassword) => await updatePasswordFn(data),
    })
}

export const useUser = () => {
    return {
        useGetProfile,
        useUpdateProfile,
        useUpdatePassword,
    }
}