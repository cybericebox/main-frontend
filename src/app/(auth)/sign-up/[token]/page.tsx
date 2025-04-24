import SignUpContinueComponent from "@/app/(auth)/sign-up/[token]/component";


export const dynamic = "force-static"

type SearchParamProps = {
    params: Promise<{ token: string }>
}

export async function generateStaticParams() {
    return []
}

export default async function SignUpContinuePage(props: SearchParamProps) {
    const params = await props.params;
    return <SignUpContinueComponent token={params.token}/>
}