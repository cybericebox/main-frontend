'use client'
import React, {useEffect} from "react";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";

type SearchParamProps = {
    params: { code: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default function ConfirmEmail({params: {code}}: SearchParamProps) {
    const router = useRouter()
    const confirmEmail = useAuth().ConfirmEmail();
    useEffect(() => {
        confirmEmail.mutate(code, {
            onSuccess: () => {
                toast.success("Адресу електронної пошти успішно підтверджено!");
                router.push("/");
            },
            onError: () => {
                toast.error("Не вдалося підтвердити адресу електронної пошти");
                router.push("/");
            },
        });
    }, []);
    return <></>
}
