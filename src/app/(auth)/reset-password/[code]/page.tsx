import ResetPasswordComponent from "@/app/(auth)/reset-password/[code]/component";


export const dynamic = "force-static"

type SearchParamProps = {
    params: Promise<{ code: string }>
}

export async function generateStaticParams() {
    return []
}

export default async function ResetPasswordPage(props: SearchParamProps) {
    const params = await props.params;
    return <ResetPasswordComponent code={params.code}/>
}