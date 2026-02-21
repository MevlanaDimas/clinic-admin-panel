'use client'

import { UserButton } from "@clerk/nextjs";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { UserPen } from "lucide-react";
import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import UserBioAndTitleForm from "../UserBioAndTitleTab";

interface HeaderProps {
    title: string;
}

const Header = ({ title }: HeaderProps) => {
    const [scrolled, setScrolled] = useState(false);
    const { state } = useSidebar();
    const { scrollY } = useScroll();

    useEffect(() => {
        return scrollY.on("change", (latest) => {
            setScrolled(latest > 10);
        });
    }, [scrollY]);

    return (
        <motion.header
            className="flex flex-row sticky top-0 justify-between w-full h-full py-4 pr-5 items-center border-b bg-sidebar/80 backdrop-blur-md"
            animate={{ boxShadow: scrolled ? "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" : "none" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
            <div className={`flex bg-accent ${state === 'collapsed' ? 'pl-2' : ''} h-8 items-center justify-end rounded-r-md transition-all duration-200 ease-in-out`}>
                <SidebarTrigger className="cursor-pointer" />
            </div>
            <h2 className="text-sidebar-foreground font-bold text-2xl">{title}</h2>
            <div className="flex items-center">
                <UserButton>
                    <UserButton.UserProfilePage
                        label="Bio & Title"
                        url="/profile"
                        labelIcon={<UserPen className="w-4 h-4" />}
                    >
                        <UserBioAndTitleForm />
                    </UserButton.UserProfilePage>
                </UserButton>
            </div>
        </motion.header>
    );
}

export default Header;