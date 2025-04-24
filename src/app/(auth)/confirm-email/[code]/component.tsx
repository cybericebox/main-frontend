'use client'
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";
import {ErrorToast, SuccessToast} from "@/components/common/customToast";

interface Props {
    code: string
}

export default function ConfirmEmailComponent({code}: Props) {
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