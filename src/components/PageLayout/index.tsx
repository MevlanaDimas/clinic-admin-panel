'use client'

import { useState } from "react";
import { PageTransition } from "../PageTransition";
import { SidebarNav } from "../SidebarNav";
import { SidebarProvider } from "../ui/sidebar";


export const PageLayout = ({ children } : { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SidebarNav />
            <main className={`w-full ${isSidebarOpen ? '-ml-4' : ''} transition-all duration-200 ease-in-out`}>
                <PageTransition>
                    {children}
                </PageTransition>
            </main>
        </SidebarProvider>
    )
};