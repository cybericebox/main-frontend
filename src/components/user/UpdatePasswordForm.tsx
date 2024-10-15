'use client'

import React, {useState} from "react";
import {Lock, LockKeyhole, LockKeyholeOpen} from "lucide-react"
import {useUser} from "@/hooks/useUser";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {UserPasswordSchema} from "@/types/user";
import {IErrorResponse} from "@/types/api";


export default function UpdatePassword({isOpen, onClose}: { isOpen: boolean, onClose: any }) {
    const updatePassword = useUser().useUpdatePassword()
    const [showPassword, setShowPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);

    const form = useForm<z.infer<typeof UserPasswordSchema>>({
        resolver: zodResolver(UserPasswordSchema),
        mode: "onChange",
        defaultValues: {
            OldPassword: "",
            NewPassword: "",
            ConfirmPassword: "",
        }
    })
    const OnClose = () => {
        form.reset()
        onClose()
    }

    const onSubmit: SubmitHandler<z.infer<typeof UserPasswordSchema>> = (data) => {
        updatePassword.mutate(data, {
            onError: (error) => {
                const e = error as IErrorResponse
                if (e?.response?.data.Status.Code === 20201 && form.getFieldState("OldPassword").error === undefined) {
                    form.setError("OldPassword", {
                        type: "manual",
                        message: "Неправильний поточний пароль"
                    })
                }
                if (e?.response?.data.Status.Code === 20202 && form.getFieldState("NewPassword").error === undefined) {
                    form.setError("NewPassword", {
                        type: "manual",
                        message: "Пароль повинен відповідати вимогам"
                    })
                }
            },
            onSuccess: () => {
                toast.success("Пароль успішно змінено")
                onClose()
            },
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={OnClose} modal={true} defaultOpen={false}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className={"text-2xl text-primary"}></DialogTitle>
                    <DialogDescription>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className={"flex flex-col w-full px-4 space-y-6 py-8"}
                            >
                                <FormField
                                    control={form.control}
                                    name="OldPassword"
                                    render={({field, fieldState}) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <div
                                                    className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                                >
                                                    <Lock/>
                                                    <Input
                                                        placeholder="Поточний пароль"
                                                        {...field}
                                                        onChange={(e) => {
                                                            fieldState.error?.type === "manual" && form.clearErrors("OldPassword")
                                                            field.onChange(e)
                                                        }}
                                                        type={showOldPassword ? "text" : "password"}
                                                        tabIndex={1}
                                                    />
                                                    <div
                                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                                    >
                                                        {showOldPassword ?
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
                                    name="NewPassword"
                                    render={({field, fieldState}) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <div
                                                    className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                                >
                                                    <Lock/>
                                                    <Input
                                                        placeholder="Новий пароль"
                                                        {...field}
                                                        onChange={(e) => {
                                                            fieldState.error?.type === "manual" && form.clearErrors("NewPassword")
                                                            field.onChange(e)
                                                        }}
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
                                    className={"w-full bg-primary hover:opacity-70 text-white font-bold py-2 px-4 rounded"}
                                    tabIndex={4}
                                >
                                    Змінити
                                </button>
                            </form>
                        </Form>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
