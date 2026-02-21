'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { motion } from "framer-motion";


interface CustomPaginationProps {
    totalPages: number;
    currentPage: number;
    paramKey?: string; // Default to "page" for the first table
}

export const CustomPagination = ({ 
    totalPages, 
    currentPage, 
    paramKey = "page" 
}: CustomPaginationProps) => {
    const pathname = usePathname();
    const { replace } = useRouter();
    const searchParams = useSearchParams();

    // Function to create the new URL with the updated parameter
    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set(paramKey, pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        replace(createPageURL(page));
    };

    // Logic to generate the page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const showEllipsis = totalPages > 5;

        if (!showEllipsis) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <PaginationPrevious
                            className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            onClick={() => handlePageChange(currentPage - 1)}
                        />
                    </motion.div>
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                        {page === "..." ? (
                            <PaginationEllipsis />
                        ) : (
                            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}>
                                <PaginationLink
                                    isActive={currentPage === page}
                                    onClick={() => handlePageChange(page as number)}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            </motion.div>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <PaginationNext
                            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            onClick={() => handlePageChange(currentPage + 1)}
                        />
                    </motion.div>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};