import ConfirmEmailComponent from "@/app/(auth)/confirm-email/[code]/component";

export const dynamic = "force-static"

type SearchParamProps = {
    params: Promise<{ code: string }>
}

export async function generateStaticParams() {
    return []
}

export default async function ConfirmEmailPage(props: SearchParamProps) {
    const params = await props.params;
    return <ConfirmEmailComponent code={params.code}/>
}
