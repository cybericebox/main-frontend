import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getProfileFn, updatePasswordFn, updateProfileFn} from "@/api/userAPI";
import {IUpdateUserPassword, IUpdateUserProfile, UserSchema} from "@/types/user";
import {ErrorInvalidResponseData} from "@/types/common";

const useGetProfile = () => {
    const {
        data: GetProfileResponse,
        isLoading,
        isError,
        isSuccess,
        error,
        refetch: GetProfile
    } = useQuery({
        queryKey: ["profile"],
        queryFn: getProfileFn,
        select: (data) => {
            const res = UserSchema.safeParse(data.data.Data)
            if (!res.success) {
                console.log(res.error)
                throw ErrorInvalidResponseData
            } else {
                data.data.Data = res.data
            }

            return data.data
        },
    })

    const GetProfileRequest = {
        isLoading,
        isError,
        isSuccess,
        error,
    }

    return {GetProfileResponse, GetProfileRequest, GetProfile}
}

const useUpdateProfile = () => {
    const queryClient = useQueryClient()

    const {
        data: UpdateProfileResponse,
        isPending: PendingUpdateProfile,
        mutate: UpdateProfile
    } = useMutation({
        mutationKey: ["updateProfile"],
        mutationFn: async (data: IUpdateUserProfile) => await updateProfileFn(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["profile"]}).catch((e) => console.error(e))
        }
    })

    return {UpdateProfileResponse, UpdateProfile, PendingUpdateProfile}
}
const useUpdatePassword = () => {
    const {
        mutate: UpdatePassword,
        data: UpdatePasswordResponse,
        isPending: PendingUpdatePassword,
    } = useMutation({
        mutationKey: ["updatePassword"],
        mutationFn: async (data: IUpdateUserPassword) => await updatePasswordFn(data),
    })

    return {UpdatePassword, UpdatePasswordResponse, PendingUpdatePassword}
}

export const useUser = () => {
    return {
        useGetProfile,
        useUpdateProfile,
        useUpdatePassword,
    }
}