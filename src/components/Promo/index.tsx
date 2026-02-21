'use client'

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Promo, PromoImages } from "@/app/generated/prisma/client";
import { TagList } from "../Tag";
import { Separator } from "../ui/separator";
import Search from "../SearchBar";
import { PageSizeSelect } from "../PageSizeSelect";
import { CustomPagination } from "../CustomPagination";
import { useState, useEffect } from "react";
import { AlertModal } from "../Modals";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

interface PromoWithImages extends Promo {
    image?: PromoImages[];
}

interface PromoTableProps {
    data: PromoWithImages[];
    query?: string;
    totalPages: number;
    currentPage: number;
    limit: string;
    totalCount: number;
}

const PromoTable = ({ data, query, totalPages, currentPage, limit, totalCount }: PromoTableProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [promos, setPromos] = useState(data);

    useEffect(() => {
        setPromos(data);
    }, [data]);

    const onDelete = async (id: number) => {
        const previousPromos = [...promos];
        setPromos(prev => prev.filter(p => p.id !== id));

        try {
            setLoading(true);
            await api.delete(`/promo/${id}`);
            toast.success("Promo deleted successfully");
            router.refresh();
        } catch {
            setPromos(previousPromos);
            toast.error("Failed to delete promo");
        } finally {
            setLoading(false);
        }
    };

    return  (
        <AnimatePresence mode="wait">
            <div className="flex flex-col justify-center gap-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex flex-col gap-5"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-bold tracking-tight">Promo</h2>
                        <Link href="/promo/new">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Promo
                            </motion.div>
                        </Link>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="w-70 pl-2">
                            <Search />
                        </div>
                        <PageSizeSelect limit={limit} />
                    </div>

                    {query && (
                        <p className="text-sm text-muted-foreground">
                            Showing {promos.length} results for <span className="font-semibold text-foreground">{query}</span>
                        </p>
                    )}
                    <Separator />
                </motion.div>

                <motion.div
                    key={query}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="p-4 rounded-md border bg-card shadow-sm"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="text-center">
                                <TableHead className="text-center">No</TableHead>
                                <TableHead className="w-30 text-center">Image</TableHead>
                                <TableHead className="text-center">Code</TableHead>
                                <TableHead className="text-center">Headline</TableHead>
                                <TableHead className="max-w-75 text-center">Description</TableHead>
                                <TableHead className="text-center">CTA</TableHead>
                                <TableHead className="text-center">Valid Until</TableHead>
                                <TableHead className="text-center">Category</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promos.length > 0 ? (
                                promos.map((promo: PromoWithImages, index: number) => (
                                    <motion.tr
                                        layout
                                        key={promo.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                                        whileHover={{ scale: 1.01, backgroundColor: "var(--accent)", transition: { duration: 0.2 } }}
                                        className="border-b transition-colors data-[state=selected]:bg-muted">
                                        <TableCell className="text-center">{index + 1}</TableCell>
                                        <TableCell className="text-center">
                                            {promo.image?.length && promo.image[0].imageUrl ? (
                                                <div className="relative h-12 w-20 overflow-hidden rounded-md border">
                                                    <Image
                                                        src={promo.image[0].imageUrl}
                                                        alt={promo.image[0].imageName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-12 w-20 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                                                    No Image
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium text-center">{promo.code}</TableCell>
                                        <TableCell className="text-center">{promo.headline}</TableCell>
                                        <TableCell className="truncate max-w-75 text-wrap" title={promo.description || ""}>
                                            {promo.description || "-"}
                                        </TableCell>
                                        <TableCell className="text-center">{promo.CTA}</TableCell>
                                        <TableCell className="text-center">{promo.validUntil ? new Intl.DateTimeFormat('id-ID').format(new Date(promo.validUntil)) : '-'}</TableCell>
                                        <TableCell className="text-center">
                                            <TagList tags={promo.category} />
                                        </TableCell>
                                        <TableCell className="flex justify-center gap-2">
                                            <Link href={`/promo/${promo.id}/view`}>
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </motion.div>
                                            </Link>
                                            <AlertModal
                                                loading={loading}
                                                title="Delete Promo?"
                                                description="This action cannot be undone."
                                                handleDelete={() => onDelete(promo.id)}
                                            >
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </motion.div>
                                            </AlertModal>
                                        </TableCell>
                                    </motion.tr>
                                ))
                            ) : (
                                <motion.tr>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No promos available.
                                    </TableCell>
                                </motion.tr>
                            )}
                        </TableBody>
                    </Table>
                </motion.div>

                <div className="flex flex-row sm:flex-col items-center justify-between gap-4 px-2 py-4">
                    {limit !== 'all' && totalPages > 1 && (
                        <CustomPagination totalPages={totalPages} currentPage={currentPage} />
                        
                    )}
                    <p className="text-sm text-muted-foreground">Total {totalCount} items</p>
                </div>
            </div>
        </AnimatePresence>
    )
}

export default PromoTable;