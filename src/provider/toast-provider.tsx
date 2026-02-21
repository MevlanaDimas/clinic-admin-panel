"use client"

import { Toaster } from "sonner";


export const ToastProvider = () => {
    return <Toaster position="top-right" duration={3000} richColors />
}