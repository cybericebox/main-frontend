'use client';
import {parseSignUpToken} from "@/utils/helper";
import {PlatformLogo} from "@/components/logos";
import Link from "next/link";
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {GetFromURL, SignInLink} from "@/hooks/auth";
import toast from "react-hot-toast";
import {useAuth} from "@/hooks/useAuth";
import {SignUpWithCredentialsContinueSchema} from "@/types/auth";
import {AtSign, Lock, LockKeyhole, LockKeyholeOpen, User} from "lucide-react";
import {IErrorResponse} from "@/types/api";

type SearchParamProps = {
    params: { token: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default function SignUpContinuePage({params: {token}}: SearchParamProps) {
    const [showPassword, setShowPassword] = useState(false);
    const {code, email} = parseSignUpToken(token)
    const router = useRouter()
    const SignUpContinue = useAuth().SignUpWithCredentialsContinue(code);

    const form = useForm<z.infer<typeof SignUpWithCredentialsContinueSchema>>({
        resolver: zodResolver(SignUpWithCredentialsContinueSchema),
        defaultValues: {
            Email: email,
            Name: "",
            Password: "",
            ConfirmPassword: "",
        },
        mode: "onChange"
    })

    const onSubmit: SubmitHandler<z.infer<typeof SignUpWithCredentialsContinueSchema>> = data => {
        SignUpContinue.mutate(data, {
            onSuccess: () => {
                form.reset();
                toast.success("Реєстрація успішно завершена!")
                // redirect to the previous page with timeout
                setTimeout(() => {
                    router.replace(GetFromURL("/"))
                }, 1000)
            },
            onError: (error) => {
                const e = error as IErrorResponse
                const message = e?.response?.data.Status.Message || ""
                toast.error(`Не вдалося завершити реєстрацію\n${message}`)
            }
        })
    }

    return (
        <div
            className={"w-full h-[85dvh] flex flex-col justify-center items-center sm:mb-[100px]"}
        >
            <PlatformLogo className={"size-20 md:size-44"}/>
            <div
                className={"my-5 md:my-10 font-bold text-xl md:text-3xl text-primary"}
            >
                Закінчіть створення облікового запису
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
                            name="Email"
                            render={({field}) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div
                                            className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                        >
                                            <AtSign/>
                                            <Input
                                                placeholder="Адреса електронної пошти"
                                                {...field}
                                                readOnly={true}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Name"
                            render={({field}) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div
                                            className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                        >
                                            <User/>
                                            <Input
                                                placeholder="Ім'я"
                                                {...field}
                                                tabIndex={1}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
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
                                                placeholder="Пароль"
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                tabIndex={2}
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
                                                placeholder="Пароль ще раз"
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
                            className={"w-full bg-primary hover:opacity-70 text-white font-bold py-2 px-4 rounded my-2"}
                            tabIndex={4}
                        >
                            Закінчити реєстрацію
                        </button>
                    </form>
                </Form>
            </div>
            <div className={"my-5"}>
                <Link href={SignInLink} color="#54616e" tabIndex={5}>Вже є обліковий запис</Link>
            </div>
        </div>
    )
}