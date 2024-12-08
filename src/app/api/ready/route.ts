import {NextResponse} from 'next/server'

// ready route
export async function GET() {
    return new NextResponse("ready") // return empty response
}