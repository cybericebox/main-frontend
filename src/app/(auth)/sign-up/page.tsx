'use client'
import type React from "react"
import {GoogleLogo, PlatformLogo} from "@/lib/logos"
import {GoogleAPILink, SignInLink} from "@/hooks/useAuthForm"
import Link from "next/link"
import {MdAlternateEmail} from "react-icons/md"
import {useReCaptcha} from "next-recaptcha-v3";
import {SubmitHandler, useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {zodResolver} from "@hookform/resolvers/zod";
import {SignUpSchema} from "@/lib/validator";
import * as z from "zod";
import toast from "react-hot-toast";
import {signUpWithCredentialsFn} from "@/api/authAPI";

export default function SignUpPage() {
    const {executeRecaptcha} = useReCaptcha();

    const form = useForm<z.infer<typeof SignUpSchema>>({
        resolver: zodResolver(SignUpSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
        }
    })

    const onSubmit: SubmitHandler<z.infer<typeof SignUpSchema>> = data => {
        // get recaptcha token
        executeRecaptcha("signUp").then((token) => {
            if (!token) {
                // TODO: Change toast
                toast.error("Перевірку на робота не пройдено");
                return;
            }

            signUpWithCredentialsFn({
                email: data.email,
                recaptchaToken: token
            }).then((res) => {
                if (res.status === 200) {
                    toast.success("Для продовження реєстрації дотримуйтесь інструкцій в листі");
                } else {
                    toast.error("Помилка реєстрації");
                }
            })
        });
    }

    return (
        <div
            className={"w-full h-[85dvh] flex flex-col justify-center items-center mb-[100px]"}
        >
            <PlatformLogo className={"size-48"}/>
            <div
                className={"my-5 md:my-10 font-bold text-xl md:text-3xl text-primary"}
            >
                Вітаємо!
            </div>
            <div
                className={"auth-form"}
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                          className={"flex flex-col w-full px-4 py-8 rounded-lg border border-gray-200 shadow-md space-y-6"}
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
                        <button
                            className={"w-full bg-[#211a52] hover:opacity-70 text-white font-bold py-2 px-4 rounded"}
                            tabIndex={3}
                            disabled={form.formState.isSubmitting}
                        >
                            Зареєструватися
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