'use client'

import React, {useState} from "react";
import {FaLock, FaUnlock} from "react-icons/fa";
import {useUser} from "@/hooks/useUser";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {ChangePasswordSchema} from "@/lib/validator";
import {zodResolver} from "@hookform/resolvers/zod";


export default function ChangePassword({isOpen, onClose}: { isOpen: boolean, onClose: any }) {
    const changePassword = useUser().useChangePassword()
    const [showPassword, setShowPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);

    const form = useForm<z.infer<typeof ChangePasswordSchema>>({
        resolver: zodResolver(ChangePasswordSchema),
        mode: "onChange",
        defaultValues: {
            oldPassword: "",
            password: "",
            confirmPassword: "",
        }
    })
    const OnClose = () => {
        form.reset()
        onClose()
    }

    const onSubmit: SubmitHandler<z.infer<typeof ChangePasswordSchema>> = data => {
        changePassword.mutate({
            oldPassword: data.oldPassword,
            newPassword: data.password,
        })
    }

    changePassword.isSuccess && OnClose()


    return (
        <Dialog open={isOpen} onOpenChange={OnClose} modal={true} defaultOpen={false}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className={"text-2xl text-primary"}></DialogTitle>
                    <DialogDescription>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className={"flex flex-col w-full px-4 rounded-lg border border-gray-200 shadow-md space-y-6 py-8"}
                            >
                                <FormField
                                    control={form.control}
                                    name="oldPassword"
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
                                                        placeholder="Поточний пароль"
                                                        {...field}
                                                        type={showOldPassword ? "text" : "password"}
                                                        tabIndex={2}
                                                    />
                                                    <div
                                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                                    >
                                                        {showOldPassword ?
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
                                    className={"w-full bg-[#211a52] hover:opacity-70 text-white font-bold py-2 px-4 rounded"}
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
