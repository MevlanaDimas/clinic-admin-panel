'use client'

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Category, News, NewsImages, Staff, Status } from "@/app/generated/prisma/client";
import { NewsStatusModal } from "../NewsStatus";
import { RoleGuard } from "../RoleGuard";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import Search from "../SearchBar";
import { PageSizeSelect } from "../PageSizeSelect";
import { CustomPagination } from "../CustomPagination";
import Image from "next/image";
import { AlertModal } from "../Modals";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";


interface NewsItem extends News {
    author?: Staff;
    category?: Category;
    images?: NewsImages[];
}

interface NewsTableProps {
    data: NewsItem[];
    query?: string;
    totalPages: number;
    currentPage: number;
    limit: string;
    totalCount: number;
}

const NewsTable = ({ data, query, totalPages, currentPage, limit, totalCount }: NewsTableProps) => {
    const router = useRouter();
    const [newsList, setNewsList] = useState(data);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setNewsList(data);
    }, [data]);

    const onOptimisticStatusChange = (id: string, status: string) => {
        setNewsList(prev => prev.map(item => item.id === id ? { ...item, status: status as Status } : item));
    };

    const onDelete = async (id: string) => {
        const previousNews = [...newsList];
        setNewsList(prev => prev.filter(n => n.id !== id));

        try {
            setLoading(true);
            await api.delete(`/news/${id}`);
            toast.success("News deleted successfully");
            router.refresh();
        } catch {
            setNewsList(previousNews);
            toast.error("Failed to delete news");
        } finally {
            setLoading(false);
        }
    };
    
    const offset = (currentPage - 1) * (limit === "all" ? 0 : parseInt(limit, 10) || 10);

    return (
        <AnimatePresence mode="wait">
            <div className="flex flex-col justify-center gap-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex flex-col gap-5"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight">News</h2>
                        <Link href="/news/new">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3">
                                <Plus className="mr-2 h-4 w-4" />
                                Add News
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
                            Showing {newsList.length} results for <span className="font-semibold text-foreground">{query}</span>
                        </p>
                    )}
                    <Separator className="mt-5" />
                </motion.div>

                <motion.div
                    key={query}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="p-4 rounded-md border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="text-center">
                                <TableHead className="text-center">No</TableHead>
                                <TableHead className="text-center">Article Title</TableHead>
                                <TableHead className="w-30 text-center">Images</TableHead>
                                <TableHead className="text-center">Category</TableHead>
                                <TableHead className="text-center">Author</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Published At</TableHead>
                                <TableHead className="text-center">Last Modified</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {newsList.length > 0 ? (
                                newsList.map((news: NewsItem, index: number) => (
                                    <motion.tr
                                        layout
                                        key={news.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                                        whileHover={{ scale: 1.01, backgroundColor: "var(--accent)", transition: { duration: 0.2 } }}
                                        className="border-b transition-colors data-[state=selected]:bg-muted">
                                        <TableCell className="text-center">{offset + index + 1}</TableCell>
                                        <TableCell className="text-wrap">{news.title}</TableCell>
                                        <TableCell className="text-center">
                                            {(news.images?.length ?? 0) > 0 ? (
                                                <div className="relative h-12 w-20 overflow-hidden rounded-md border">
                                                    <Image
                                                        src={news.images![0].imageUrl}
                                                        alt={news.images![0].imageName}
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
                                        <TableCell className="fotn-medium text-center">{news.category?.name || 'Uncategorized'}</TableCell>
                                        <TableCell className="text-center">{news.author?.name || 'N/A'}</TableCell>
                                        <TableCell className="text-center">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${news.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {news.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {news.publishedAt ? (
                                                new Date(news.publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric'})
                                            ) : (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-500 text-foreground">
                                                    Not Yet Published
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {new Date(news.updatedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-2">
                                            <RoleGuard
                                                allowedRole='Doctor'
                                                fallback={<></>}
                                            >
                                                <NewsStatusModal initialData={news} onOptimisticUpdate={onOptimisticStatusChange} />
                                            </RoleGuard>
                                            <Link href={`/news/${news.id}/view`}>
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
                                                title="Delete Article?"
                                                description="This action cannot be undone."
                                                handleDelete={() => onDelete(news.id)}
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
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No news available.
                                    </TableCell>
                                </motion.tr>
                            )}
                        </TableBody>
                    </Table>
                </motion.div>

                <div className="flex flex-row sm:flex-col items-center justify-between gap-4">
                    {limit !== 'all' && totalPages > 1 && (
                        <CustomPagination totalPages={totalPages} currentPage={currentPage} />
                    )}
                    <p className="text-sm text-muted-foreground">Total {totalCount} items</p>
                </div>
            </div>
        </AnimatePresence>
    )
}

export default NewsTable;