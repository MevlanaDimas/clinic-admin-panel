'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PageSizeSelectProps {
    limit: string;
    paramKey?: string; // e.g., "limit" or "reqLimit"
}


export const PageSizeSelect = ({ limit, paramKey = "limit" }: PageSizeSelectProps) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const onLimitChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        
        // Update the specific limit key
        params.set(paramKey, value);
        
        // Reset the corresponding page key to 1 when limit changes
        const pageKey = paramKey === "limit" ? "page" : "reqPage";
        params.set(pageKey, "1");

        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-nowrap">Rows per page</p>
            <Select
                value={limit}
                onValueChange={onLimitChange}
            >
                <SelectTrigger className="h-8 w-17.5">
                    <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent side="top">
                    {["10", "20", "30", "40", "50", "all"].map((pageSize) => (
                        <SelectItem key={pageSize} value={pageSize}>
                            {pageSize === "all" ? "All" : pageSize}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};