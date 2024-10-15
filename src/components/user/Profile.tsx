"use client"
import {useUser} from "@/hooks/useUser";
import React, {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {signOutFn} from "@/api/authAPI";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import UpdatePassword from "@/components/user/UpdatePasswordForm";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {UserProfileSchema} from "@/types/user";
import toast from "react-hot-toast";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {AtSign, Lock, LogOut, User} from "lucide-react";
import {IErrorResponse} from "@/types/api";

export default function Profile() {
    const user = useUser().useGetProfile();
    const updateProfile = useUser().useUpdateProfile();
    const [isOpenPasswordModel, setIsOpenPasswordModel] = useState(false)

    const form = useForm<z.infer<typeof UserProfileSchema>>({
        resolver: zodResolver(UserProfileSchema),

        defaultValues: async () => {
            const {data} = await user.refetch();
            return {
                Email: data?.Data.Email || "",
                Name: data?.Data.Name || "",
            }
        },
        mode: "onChange"
    })

    const onSubmit: SubmitHandler<z.infer<typeof UserProfileSchema>> = data => {
        updateProfile.mutate(data, {
            onSuccess: () => {
                toast.success("Дані профілю успішно оновлено");
                if (form.getFieldState("Email").isDirty) {
                    toast.success("Для підтвердження нової адреси електронної пошти слідуйте інструкціям в листі", {duration: 5000});
                }
                // reset form default values to make they not dirty
                form.control._resetDefaultValues();
            },
            onError: (error) => {
                const e = error as IErrorResponse
                const message = e?.response?.data.Status.Message || ""
                toast.error(`Не вдалося оновити дані профілю\n${message}`)
            }
        })
    }

    return (
        <div
            className={"flex flex-col h-full w-full max-w-screen-md m-auto mt-20"}
        >
            <Card className="text-primary border-2 shadow-2xl">
                <CardHeader>
                    <CardTitle
                        className="text-3xl relative"
                    >
                        Профіль
                        <Link
                            href={"/sign-in"}
                            onClick={() => signOutFn()}
                            className="cursor-pointer text-3xl absolute right-0 top-0 p-2"
                            data-tooltip-content={"Вийти"}
                            data-tooltip-id={"tooltip"}
                            data-tooltip-effect="solid"
                        >
                            <LogOut/>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6 md:px-10 pb-10 w-full">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className={"flex flex-col w-full py-8 space-y-6"}
                            >
                                <FormField
                                    control={form.control}
                                    name="Email"
                                    render={({field}) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Адреса електронної пошти</FormLabel>
                                            <FormControl>
                                                <div
                                                    className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                                >
                                                    <AtSign/>
                                                    <Input
                                                        placeholder="Адреса електронної пошти"
                                                        {...field}
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
                                            <FormLabel>Ім&apos;я</FormLabel>
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
                                {form.formState.isDirty && !form.formState.isLoading &&
                                    <div className={"flex justify-evenly gap-5"}>
                                        <button
                                            className={"w-full bg-primary hover:opacity-70 text-white font-bold py-2 px-4 rounded my-2"}
                                            tabIndex={3}
                                            type={"submit"}
                                            disabled={form.formState.isSubmitting}
                                        >
                                            Зберегти
                                        </button>
                                        <button
                                            className={"w-full bg-primary hover:opacity-70 text-white font-bold py-2 px-4 rounded my-2"}
                                            tabIndex={3}
                                            type={"reset"}
                                            onClick={() => form.reset()}
                                            disabled={form.formState.isSubmitting}
                                        >
                                            Відмінити
                                        </button>
                                    </div>}

                                <div
                                    className="flex flex-col gap-2"
                                >
                                    <Label
                                        htmlFor="password"
                                    >
                                        Пароль
                                    </Label>
                                    <div
                                        className={"flex flex-row items-center border border-gray-200 rounded p-2 space-x-3"}
                                    >
                                        <Lock/>
                                        <Input
                                            placeholder="Пароль"
                                            tabIndex={4}
                                            id="password"
                                            readOnly={true}
                                            value={"verysecurepassword"}
                                            type={"password"}
                                            onClick={() => setIsOpenPasswordModel(true)}
                                        />
                                    </div>
                                </div>
                            </form>
                        </Form>

                    </div>
                </CardContent>
            </Card>
            <UpdatePassword isOpen={isOpenPasswordModel} onClose={() => setIsOpenPasswordModel(false)}/>
        </div>
    )
}