'use client'

import Link from "next/link";
import AppLogoIcon from "../AppLogo";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { usePathname } from "next/navigation";
import { DiamondPercent, ListOrdered, Newspaper, User, CalendarDays } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useMemo } from "react";

export function SidebarNav () {
    const adminNavItems = useMemo(() => [
        {
            title: 'Promo',
            url: '/promo',
            icon: DiamondPercent
        },
        {
            title: 'News',
            url: '/news',
            icon: Newspaper
        },
        {
            title: 'Queue',
            url: '/queue',
            icon: ListOrdered
        },
        {
            title: 'User',
            url: '/user',
            icon: User
        },
        {
            title: 'Doctor Schedule',
            url: '/doctors',
            icon: CalendarDays
        }
    ], []);

    const nonAdminNavItems = useMemo(() => [
        {
            title: 'Promo',
            url: '/promo',
            icon: DiamondPercent
        },
        {
            title: 'News',
            url: '/news',
            icon: Newspaper
        },
        {
            title: 'Queue',
            url: '/queue',
            icon: ListOrdered
        },
        {
            title: 'Doctor Schedule',
            url: '/doctors',
            icon: CalendarDays
        }
    ], []);

    const pathname = usePathname();

    const { user, isLoaded } = useUser();

    if (!isLoaded) return null;

    const navItems = user?.publicMetadata?.title === 'Admin' ? adminNavItems : nonAdminNavItems;

    const pathSegments = pathname.split('/').filter(Boolean);
    const firstSegment = `/${pathSegments[0] || ''}`;

    const sidebarVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    return (
        <nav>
            <Sidebar className="flex flex-col h-full w-60">
                <SidebarHeader className="flex gap-5">
                    <Link href={'/promo'} className="mx-3 my-5 transition-transform duration-300 hover:scale-105">
                        <AppLogoIcon />
                    </Link>
                    <h1 className="flex h-5 items-center px-2 rounded-md text-md uppercase tracking-wider text-foreground font-medium">Main Menu</h1>
                </SidebarHeader>
                <SidebarContent className="ml-3 mt-3">
                    <SidebarGroup>
                        <SidebarMenu>
                            <motion.ul 
                                className="flex flex-col justify-start gap-5"
                                variants={sidebarVariants}
                                initial="hidden"
                                animate="show"
                            >
                            {navItems.map((item) => (
                                <motion.div
                                    key={item.title}
                                    variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={firstSegment === item.url} className="py-5">
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </motion.div>
                            ))}
                            </motion.ul>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="flex py-10 items-center justify-center">
                    <ThemeToggle />
                </SidebarFooter>
            </Sidebar>
        </nav>
    )
}