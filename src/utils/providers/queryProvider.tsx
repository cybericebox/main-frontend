import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type React from "react";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

export default function QueryProvider({children}: {
    children: React.ReactNode;
}) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: true,
                refetchOnMount: true,
                refetchOnReconnect: true,
                staleTime: 5 * 60 * 1000,
                refetchInterval: 61 * 60 * 1000, // 1 hour 1 minute
            },
        }
    })
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    )
}