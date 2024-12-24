'use client';
import React from "react";
import {GoogleLogo, PlatformLogo} from "@/components/logos";
import {ForgotPasswordLink, GetFromURL, GoogleAPILink, SignUpLink} from "@/hooks/auth";
import Link from "next/link";
import {useReCaptcha} from "next-recaptcha-v3";
import {type SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";
import {SignInWithCredentialsSchema} from "@/types/auth";
import {AtSign, Lock} from "lucide-react";
import {ErrorToast, SuccessToast} from "@/components/common/customToast";


export default function SignInPage() {

    const {executeRecaptcha} = useReCaptcha();
    const router = useRouter()
    const {SignInWithCredentials} = useAuth().SignInWithCredentials();


    const form = useForm<z.infer<typeof SignInWithCredentialsSchema>>({
        resolver: zodResolver(SignInWithCredentialsSchema),
        mode: "onChange",
        defaultValues: {
            Email: "",
            Password: "",
            RecaptchaToken: "",
        }
    })

    const onSubmit: SubmitHandler<z.infer<typeof SignInWithCredentialsSchema>> = data => {

        // get recaptcha token
        executeRecaptcha("signIn").then((token) => {
            if (!token) {
                ErrorToast("Перевірку на робота не пройдено");
                return;
            }

            SignInWithCredentials({
                ...data,
                RecaptchaToken: token
            }, {
                onSuccess: () => {
                    form.reset();
                    SuccessToast("З поверненням!");
                    // redirect to the previous page with timeout
                    setTimeout(() => {
                        router.replace(GetFromURL("/"))
                    }, 1000)
                },
                onError: (error) => {
                    ErrorToast("Не вдалося увійти", {cause: error});
                }
            });
        });
    }

    return (
        <div
            className={"w-full h-full flex flex-col justify-center items-center"}
        >
            <PlatformLogo className={"size-20 md:size-44"}/>
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
                            className={"w-full bg-primary hover:opacity-70 text-white font-bold py-2 px-4 rounded"}
                            tabIndex={1}
                        >
                            <Link href={GoogleAPILink} prefetch={false}>
                                <div className={"flex flex-row justify-center items-center text-center"}>
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
                            className={"w-full bg-primary hover:opacity-70 text-white font-bold py-2 px-4 rounded"}
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