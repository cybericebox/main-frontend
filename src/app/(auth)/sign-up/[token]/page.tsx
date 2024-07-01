'use client';
import {parseSignUpToken} from "@/utils/helper";
import {PlatformLogo} from "@/lib/logos";
import Link from "next/link";
import {MdAlternateEmail} from "react-icons/md";
import React, {useState} from "react";
import {FaLock, FaUnlock, FaUserAlt} from "react-icons/fa";
import {useRouter} from "next/navigation";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {SignUpContinueSchema} from "@/lib/validator";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {GetFromURL, SignInLink} from "@/hooks/useAuthForm";
import {signUpContinueWithCredentialsFn} from "@/api/authAPI";
import toast from "react-hot-toast";

type SearchParamProps = {
    params: { token: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default function SignUpContinuePage({params: {token}, searchParams}: SearchParamProps) {
    const [showPassword, setShowPassword] = useState(false);
    const {code, email} = parseSignUpToken(token)
    const router = useRouter()

    const form = useForm<z.infer<typeof SignUpContinueSchema>>({
        resolver: zodResolver(SignUpContinueSchema),
        defaultValues: {
            email: email,
            name: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange"
    })

    const onSubmit: SubmitHandler<z.infer<typeof SignUpContinueSchema>> = data => {
        signUpContinueWithCredentialsFn(code, {
            email: data.email,
            name: data.name,
            password: data.password,
        }).then((res) => {
            if (res.status === 200) {
                toast.success("Дякуємо за реєстрацію!");
                // redirect to the previous page with timeout
                setTimeout(() => {
                    router.replace(GetFromURL("/"))
                }, Number(process.env.NEXT_PUBLIC_REDIRECT_TIMEOUT) || 3000)
            } else {
                toast.error("Помилка при реєстрації")
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
                            name="email"
                            render={({field}) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div
                                            className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                        >
                                            <MdAlternateEmail
                                                className={"text-[#211a52] text-xl"}
                                            />
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
                            name="name"
                            render={({field}) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div
                                            className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                        >
                                            <FaUserAlt
                                                className={"text-[#211a52]"}
                                            />
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
                                                placeholder="Пароль"
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
                            className={"w-full bg-[#211a52] hover:opacity-70 text-white font-bold py-2 px-4 rounded my-2"}
                            tabIndex={4}
                        >
                            Закінчити реєстрацію
                        </button>
                    </form>
                </Form>
            </div>
            <div className={"my-5"}>
                <Link href={SignInLink} color="#54616e" tabIndex={4}>Вже є обліковий запис</Link>
            </div>
        </div>
    )
}