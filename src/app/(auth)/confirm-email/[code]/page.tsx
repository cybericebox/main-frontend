'use client'
import React, {use, useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";
import {ErrorToast, SuccessToast} from "@/components/common/customToast";

type SearchParamProps = {
    params: Promise<{ code: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function ConfirmEmail(props: SearchParamProps) {
    const params = use(props.params);

    const {
        code
    } = params;

    const router = useRouter()
    const {ConfirmEmail} = useAuth().ConfirmEmail();
    useEffect(() => {
        ConfirmEmail(code, {
            onSuccess: () => {
                SuccessToast("Адресу електронної пошти успішно підтверджено!");
                router.push("/");
            },
            onError: (error) => {
                ErrorToast("Не вдалося підтвердити адресу електронної пошти", {cause: error});
            },
        });
    }, [router, ConfirmEmail, code]);
    return <></>
}
