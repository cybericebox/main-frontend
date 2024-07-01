'use client'

import React, {useState} from "react";
import {useUser} from "@/hooks/useUser";
import {IsAuthenticated} from "@/hooks/useAuthForm";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";
import {FiLogOut} from "react-icons/fi";
import {signOutFn} from "@/api/authAPI";
import Link from "next/link";
import ChangePassword from "@/components/auth/ChangePasswordForm";


export default function ProfilePage() {
    const user = useUser().useGetUser(IsAuthenticated()).data;
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const fromURL = GetFromURL("/")

    return (
        <div
            className={"flex flex-col h-full w-full max-w-screen-md m-auto mt-20"}
        >
            <Card className="text-primary text-xl border-2 shadow-2xl">
                <CardHeader>
                    <CardTitle
                        className="text-3xl text-center flex justify-between"
                    >
                        Профіль
                        <Link
                            href={"/sign-in"}
                            onClick={() => signOutFn()} className="cursor-pointer text-3xl"
                            data-tooltip-content={"Вийти"}
                            data-tooltip-id={"tooltip"}
                            data-tooltip-effect="solid"
                        >
                            <FiLogOut/>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6 max-w-2xl px-3 md:px-10 pb-10">
                        <div
                            className="flex flex-col gap-2"
                        >
                            <Label
                                htmlFor="email"
                                className={"text-primary text-lg"}
                            >
                                Адреса електронної пошти
                            </Label>
                            <Input
                                id="email"
                                readOnly={true}
                                value={user?.Email || ""}
                                className={"text-primary text-lg border-2 px-2"}
                            />
                        </div>
                        <div
                            className="flex flex-col gap-2"
                        >
                            <Label
                                htmlFor="name"
                                className={"text-primary text-lg"}
                            >
                                Ім&apos;я
                            </Label>
                            <Input
                                id="name"
                                readOnly={true}
                                value={user?.Name || ""}
                                className={"text-primary text-lg border-2 px-2"}
                            />
                        </div>
                        <div
                            className="flex flex-col gap-2"
                        >
                            <Label
                                htmlFor="password"
                                className={"text-primary text-lg"}
                            >
                                Пароль
                            </Label>
                            <Input
                                id="password"
                                readOnly={true}
                                value={user?.Name || ""}
                                type={"password"}
                                className={"text-primary text-lg border-2 px-2"}
                                onClick={() => setIsModalOpen(true)}
                            />
                        </div>
                    </div>
                </CardContent>
                {/*<CardFooter*/}
                {/*    className="flex justify-center"*/}
                {/*>*/}
                {/*    {fromURL != "/" && (*/}
                {/*        <Button*/}
                {/*            onClick={() => {*/}
                {/*                router.push(fromURL)*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            Повернутись на попередню сторінку*/}
                {/*        </Button>*/}
                {/*    )}*/}
                {/*</CardFooter>*/}
            </Card>
            <ChangePassword isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
        </div>
    )
}


// export default function ProfilePage() {
//     const router = useRouter()
//     return (
//         <div className={"flex flex-col justify-center items-center mb-10"}>
//             Profile Page
//             <Button
//                 onClick={() => {
//                     router.push(GetFromURL("/"))
//                 }}
//                 variant={"ghost"}
//             >
//                 Повернутись на попередню сторінку
//             </Button>
//         </div>
//     );
// }


