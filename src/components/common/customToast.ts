import {IErrorResponse} from "@/types/api";
import toast, {ToastOptions} from "react-hot-toast";

interface IToastOptions extends ToastOptions {
    cause?: Error;
}

export const ErrorToast = (message: string, options?: IToastOptions) => {
    if (!options?.cause) {
        toast.error(message, options)
        return
    }
    const error = options?.cause as IErrorResponse
    const errorCauseDescription = error?.response?.data.Status.Message || ""
    const errorCauseCode = error?.response?.data.Status.Code || ""
    const errorCause = errorCauseCode ? ` (${errorCauseCode})` : ""
    if (errorCauseCode != "") {
        toast.error(`${message}\n"${errorCauseDescription}"${errorCause}`, options)
        return
    }

    if (options?.cause instanceof Error) {
        toast.error(`${message}\n"${options?.cause.message}"`, options)
        return
    }
}

export const SuccessToast = (message: string, options?: ToastOptions) => {
    toast.success(message, options)
}