import type React from "react";
import {WithUserAuthentication} from "@/hooks/auth";
import Profile from "@/components/user/Profile"


export default function ProfilePage() {
    return (
        <WithUserAuthentication>
            <Profile/>
        </WithUserAuthentication>
    )
}

