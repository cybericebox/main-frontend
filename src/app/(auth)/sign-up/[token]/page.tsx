'use client';
import {parseSignUpToken} from "@/utils/helper";
import {PlatformLogo} from "@/components/logos";
import Link from "next/link";
import React, {use, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {GetFromURL, SignInLink, SignUpLink} from "@/hooks/auth";
import {useAuth} from "@/hooks/useAuth";
import {SignUpWithCredentialsContinueSchema} from "@/types/auth";
import {AtSign, Lock, LockKeyhole, LockKeyholeOpen, User} from "lucide-react";
import {type IErrorResponse} from "@/types/api";
import {ErrorToast, SuccessToast} from "@/components/common/customToast";
import {ErrorResponseStatusCodes} from "@/types/user";

type SearchParamProps = {
    params: Promise<{ token: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function SignUpContinuePage(props: SearchParamProps) {
    const params = use(props.params);

    const {
        token
    } = params;

    const {code, email} = parseSignUpToken(token)

    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter()
    const {SignUpWithCredentialsContinue} = useAuth().SignUpWithCredentialsContinue(code);

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

    // if email is not valid, redirect to the sign-up page
    useEffect(() => {
        if (!email) {
            router.replace(SignUpLink)
        }
    }, [email, router]);

    const onSubmit: SubmitHandler<z.infer<typeof SignUpWithCredentialsContinueSchema>> = data => {
        SignUpWithCredentialsContinue(data, {
            onSuccess: () => {
                form.reset();
                SuccessToast("Реєстрація успішно завершена!")
                // redirect to the previous page with timeout
                setTimeout(() => {
                    router.replace(GetFromURL("/"))
                }, 1000)
            },
            onError: (error) => {
                const e = error as IErrorResponse
                if (e?.response?.data.Status.Code === ErrorResponseStatusCodes.InvalidPasswordComplexity && form.getFieldState("Password").error === undefined) {
                    form.setError("Password", {
                        type: "manual",
                        message: "Пароль повинен відповідати вимогам"
                    })
                    return
                }

                ErrorToast("Не вдалося завершити реєстрацію", {cause: error})
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