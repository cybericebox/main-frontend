'use client'
import {PlatformLogo} from "@/lib/logos";
import Link from "next/link";
import React, {useState} from "react";
import {FaLock, FaUnlock} from "react-icons/fa";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {ResetPasswordSchema} from "@/lib/validator";
import {resetPasswordFn} from "@/api/authAPI";
import toast from "react-hot-toast";
import {SignInLink} from "@/hooks/useAuthForm";
import {useRouter} from "next/navigation";

type SearchParamProps = {
    params: { code: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default function ResetPasswordPage({params: {code}, searchParams}: SearchParamProps) {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter()

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
        mode: "onChange"
    })

    const onSubmit: SubmitHandler<z.infer<typeof ResetPasswordSchema>> = data => {
        resetPasswordFn(code, {
            newPassword: data.password,
        }).then((res) => {
            if (res.status === 200) {
                toast.success("Пароль успішно змінено!");
                // redirect to the previous page with timeout
                setTimeout(() => {
                    router.push(SignInLink)
                }, Number(process.env.NEXT_PUBLIC_REDIRECT_TIMEOUT) || 3000)
            } else {
                toast.error("Не вдалося змінити пароль");
            }
        })
    }

    return (
        <div
            className={"w-full h-[85dvh] flex flex-col justify-center items-center mb-[100px]"}
        >
            <PlatformLogo className={"size-48"}/>
            <div
                className={"my-5 md:my-10 font-bold text-xl md:text-3xl text-primary"}
            >
                Зміна паролю
            </div>
            <div
                className={"auth-form"}
            >
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className={"flex flex-col w-full py-8 px-4 rounded-lg border border-gray-200 shadow-md space-y-6"}
                    >
                        <FormField
                            control={form.control}
                            name="password"
                            render={({field}) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div
                                            className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                        >
                                            <FaLock
                                                className={"text-[#211a52]"}
                                            />
                                            <Input
                                                placeholder="Новий пароль"
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                tabIndex={2}
                                            />
                                            <div
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ?
                                                    <FaUnlock className={"text-[#FC8181]"}/> :
                                                    <FaLock className={"text-[#68D391]"}/>
                                                }
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({field}) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div
                                            className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                        >
                                            <FaLock
                                                className={"text-[#211a52]"}
                                            />
                                            <Input
                                                placeholder="Новий пароль ще раз"
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                tabIndex={3}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <button
                            className={"w-full bg-[#211a52] hover:opacity-70 text-white font-bold py-2 px-4 rounded my-2"}
                            tabIndex={4}
                        >
                            Змінити пароль
                        </button>
                    </form>
                </Form>
            </div>
            <div className={"my-5"}>
                <Link href={SignInLink} color="#54616e" tabIndex={4}>Увійти до облікового запису</Link>
            </div>
        </div>
    );
}
