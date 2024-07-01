import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type React from "react";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";

interface Message {
    message: string
}

export default function QueryProvider({children}: {
    children: React.ReactNode;
}) {
    const router = useRouter()
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                staleTime: 5 * 60 * 1000,
                refetchInterval: 5 * 60 * 1000,
            },
            mutations: {
                onError: async (error) => {
                    const res = error.cause as Response
                    if (res.status === 401) {
                        router.refresh()
                    } else if (res.status >= 500) {
                        toast.error(error.message);
                    } else {
                        res.json().then((data) => {
                            toast.error(data.message);
                        })
                    }
                },
                onSuccess: (data) => {
                    const mes = data as Message
                    toast.success(mes.message);
                }
            }
        }
    })
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}