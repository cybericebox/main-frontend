'use client'
import {PlatformLogo} from "@/components/logos";
import Link from "next/link";
import React, {useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import toast from "react-hot-toast";
import {SignInLink} from "@/hooks/auth";
import {useRouter} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";
import {ResetPasswordSchema} from "@/types/auth";
import {Lock, LockKeyhole, LockKeyholeOpen} from "lucide-react";

type SearchParamProps = {
    params: { code: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default function ResetPasswordPage({params: {code}, searchParams}: SearchParamProps) {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter()
    const resetPassword = useAuth().ResetPassword(code);

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            Password: "",
            ConfirmPassword: "",
        },
        mode: "onChange"
    })

    const onSubmit: SubmitHandler<z.infer<typeof ResetPasswordSchema>> = data => {
        resetPassword.mutate(data, {
            onSuccess: () => {
                form.reset();
                toast.success("Пароль успішно змінено!");
                // redirect to the sign-in page with timeout
                setTimeout(() => {
                    router.push(SignInLink)
                }, 3000)
            },
            onError: (error) => {
                form.reset();
                toast.error("Не вдалося змінити пароль");
                // redirect to the sign-in page with timeout
                setTimeout(() => {
                    router.push(SignInLink)
                }, 3000)
            }
        });
    }

    return (
        <div
            className={"w-full h-[85dvh] flex flex-col justify-center items-center sm:mb-[100px]"}
        >
            <PlatformLogo className={"size-20 md:size-44"}/>
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
                            name="Password"
                            render={({field}) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div
                                            className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                        >
                                            <Lock/>
                                            <Input
                                                placeholder="Новий пароль"
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                tabIndex={1}
                                            />
                                            <div
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ?
                                                    <LockKeyholeOpen className={"text-[#FC8181]"}/> :
                                                    <LockKeyhole className={"text-[#68D391]"}/>
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
                            name="ConfirmPassword"
                            render={({field}) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div
                                            className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                        >
                                            <Lock/>
                                            <Input
                                                placeholder="Новий пароль ще раз"
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                tabIndex={2}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <button
                            className={"w-full bg-primary hover:opacity-70 text-white font-bold py-2 px-4 rounded my-2"}
                            tabIndex={3}
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
