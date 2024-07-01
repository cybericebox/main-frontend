import type React from "react";


export default function AuthLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div
            className="flex flex-col items-center justify-center"
        >
            {children}
        </div>
    );
}