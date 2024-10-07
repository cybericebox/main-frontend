'use client';
import React from "react";
import {SignInLink} from "@/hooks/auth";
import Link from "next/link";
import {useReCaptcha} from "next-recaptcha-v3";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {PlatformLogo} from "@/components/logos";
import {useAuth} from "@/hooks/useAuth";
import {ForgotPasswordSchema} from "@/types/auth";
import {AtSign} from "lucide-react";


export default function ForgotPasswordPage() {
    const forgotPassword = useAuth().ForgotPassword()
    const {executeRecaptcha} = useReCaptcha();

    const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        mode: "onChange",
        defaultValues: {
            Email: "",
            RecaptchaToken: "",
        }
    })

    const onSubmit: SubmitHandler<z.infer<typeof ForgotPasswordSchema>> = data => {
        // get recaptcha token
        executeRecaptcha("forgotPassword").then((token) => {
            if (!token) {
                // TODO: Change toast
                toast.error("Перевірку на робота не пройдено")
                return
            }

            forgotPassword.mutate({
                ...data,
                RecaptchaToken: token
            }, {
                onSuccess: () => {
                    form.reset()
                    toast.success("Для відновлення паролю скористуйтеся інструкціями в листі")
                },
                onError: () => {
                    toast.error("Помилка відновлення паролю")
                }
            })
        })
    }
    return (
        <div
            className={"w-full h-full flex flex-col justify-center items-center"}
        >
            <PlatformLogo className={"size-20 md:size-44"}/>
            <div
                className={"my-5 md:my-10 font-bold text-xl md:text-3xl text-primary"}
            >
                Відновлення паролю
            </div>
            <div
                className={"auth-form"}
            >
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className={"flex flex-col w-full px-4 rounded-lg border border-gray-200 shadow-md space-y-6 py-8"}
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
                                                tabIndex={1}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <button
                            className={"w-full bg-primary hover:opacity-70 text-white font-bold py-2 px-4 rounded"}
                            tabIndex={2}
                        >
                            Відновити пароль
                        </button>
                    </form>
                </Form>
            </div>
            <div className={"my-5"}>
                <Link href={SignInLink}
                      className={"text-primary"}
                      tabIndex={3}>
                    Увійти до облікового запису
                </Link>
            </div>
        </div>
    )
}