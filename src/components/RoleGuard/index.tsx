'use client'

import { useUser } from "@clerk/nextjs";


interface RoleGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    allowedRole: string;
}

export const RoleGuard = ({ children, fallback, allowedRole }: RoleGuardProps) => {
    const { user, isLoaded } = useUser();
    
    if (!isLoaded) return null;

    if (user?.publicMetadata?.title !== allowedRole) {
        return <>{fallback}</> || null
    }

    return <>{children}</>
};