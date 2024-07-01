'use client';
import type React from "react";
import {GoogleLogo, PlatformLogo} from "@/lib/logos";
import {ForgotPasswordLink, GetFromURL, GoogleAPILink, SignUpLink} from "@/hooks/useAuthForm";
import Link from "next/link";
import {MdAlternateEmail} from "react-icons/md";
import {FaLock} from "react-icons/fa";
import {useReCaptcha} from "next-recaptcha-v3";
import {type SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {SignInSchema} from "@/lib/validator";
import {zodResolver} from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {signInWithCredentialsFn} from "@/api/authAPI";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";


export default function SignInPage() {

    const {executeRecaptcha} = useReCaptcha();
    const router = useRouter()

    const form = useForm<z.infer<typeof SignInSchema>>({
        resolver: zodResolver(SignInSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit: SubmitHandler<z.infer<typeof SignInSchema>> = data => {

        // get recaptcha token
        executeRecaptcha("signIn").then((token) => {
            if (!token) {
                // TODO: Change toast
                toast.error("Перевірку на робота не пройдено");
                return;
            }

            signInWithCredentialsFn({
                email: data.email,
                password: data.password,
                recaptchaToken: token
            }).then((res) => {
                if (res.status === 200) {
                    toast.success("З поверненням!");
                    // redirect to the previous page with timeout
                    setTimeout(() => {
                        router.replace(GetFromURL("/"))
                    }, Number(process.env.NEXT_PUBLIC_REDIRECT_TIMEOUT) || 3000)
                } else {
                    toast.error("Помилка аутентифікації");
                }
            })
        });
    }

    return (
        <div
            className={"w-full h-full flex flex-col justify-center items-center"}
        >
            <PlatformLogo className={"size-48"}/>
            <div
                className={"my-5 md:my-10 font-bold text-xl md:text-3xl text-primary"}
            >
                Увійдіть для продовження роботи
            </div>
            <div
                className={"auth-form"}
            >
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className={"flex flex-col w-full px-4 rounded-lg border border-gray-200 shadow-md space-y-6 py-8"}
                    >
                        <div
                            className={"w-full bg-[#211a52] hover:opacity-70 text-white font-bold py-2 px-4 rounded"}
                            tabIndex={1}
                        >
                            <Link href={GoogleAPILink} prefetch={false}>
                                <div className={"flex flex-row justify-center items-center"}>
                                    <GoogleLogo/>
                                    <div className={"ml-2"}>Продовжити за допомогою Google</div>
                                </div>
                            </Link>
                        </div>
                        <div className={"text-center"}>
                            Або, за допомогою електронної пошти
                        </div>
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
                                                tabIndex={2}
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
                                                type="password"
                                                {...field}
                                                tabIndex={2}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <div
                            className={"text-right"}
                            tabIndex={3}
                        >
                            <Link href={ForgotPasswordLink}>Забули пароль?</Link>
                        </div>
                        <button
                            className={"w-full bg-[#211a52] hover:opacity-70 text-white font-bold py-2 px-4 rounded"}
                            tabIndex={4}
                        >
                            Увійти
                        </button>
                    </form>
                </Form>
            </div>
            <div className={"my-5"}>
                <Link href={SignUpLink} tabIndex={5}>Ще немає облікового запису</Link>
            </div>
        </div>
    )
}