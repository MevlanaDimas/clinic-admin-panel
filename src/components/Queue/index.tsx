'use client'

import { QueueStatus, QueueTicket } from "@/app/generated/prisma/client"
import { CheckCheck, Loader2, Play, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation"
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { pusherClient } from "@/lib/pusher";
import { AnimatePresence, motion } from "framer-motion";
import { Separator } from "../ui/separator";
import Search from "../SearchBar";
import { PageSizeSelect } from "../PageSizeSelect";
import { CustomPagination } from "../CustomPagination";
import { AlertModal } from "../Modals";


interface QueueTableProps {
    data: QueueTicket[];
    query?: string;
    totalPages: number;
    currentPage: number;
    limit: string;
    totalCount: number;
}

const QueuePage = ({ data, query, totalPages, currentPage, limit, totalCount }: QueueTableProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedCounter, setSelectedCounter] = useState<string>("");
    const [activeCounter, setActiveCounter] = useState<number | null>(null);
    const [queueData, setQueueData] = useState(data);

    useEffect(() => {
        setQueueData(data);
    }, [data]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            setActiveCounter(null);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        const channel = pusherClient.subscribe('clinic-queue');

        channel.bind('new-queue', () => {
            router.refresh();
        });

        channel.bind('update-queue', (data: { id: string, status: string }) => {
            if (data.status === "DELETED" || data.status === "DONE") {
                setQueueData((prev) => prev.filter((item) => item.id !== data.id));
            } else {
                setQueueData((prev) => prev.map((item) => {
                    if (item.id === data.id) {
                        return { ...item, status: data.status as QueueStatus };
                    }
                    return item;
                }));
            }
            router.refresh();
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe('clinic-queue');
        }
    }, [router]);

    const handleConfirm = () => {
        if (selectedCounter) {
            setActiveCounter(parseInt(selectedCounter));
        }
    };

    const handleCallNext = async () => {
        if (!activeCounter) return;
        setLoading(true);
        try {
            await api.post('/queue/queueControl', { counterNum: activeCounter });
            toast.success('Next ticket called successfully');
            router.refresh();
        } catch {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    const onAddQueue = async () => {
        try {
            setLoading(true);
            await api.post('/queue');
            toast.success('Queue added successfully');
            router.refresh();
        } catch {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const onDeleteQueue = async (id: string) => {
        const previousData = [...queueData];
        // Optimistic update: remove immediately
        setQueueData(prev => prev.filter(item => item.id !== id));

        try {
            await api.delete(`/queue/${id}`);
            toast.success('Queue deleted successfully');
            router.refresh();
        } catch {
            // Revert on failure
            setQueueData(previousData);
            toast.error("Something went wrong");
        }
    }

    const onDoneQueue = async (id: string) => {
        const previousData = [...queueData];
        // Optimistic update: remove immediately (assuming done moves it out of this list)
        setQueueData(prev => prev.filter(item => item.id !== id));

        try {
            await api.patch(`/queue/${id}`);
            toast.success('Queue done successfully');
            router.refresh();
        } catch {
            // Revert on failure
            setQueueData(previousData);
            toast.error("Something went wrong");
        }
    }

    return (
        <AnimatePresence mode="wait">
            <div className={`flex flex-col justify-center gap-10 ${loading ? 'cursor-wait' : ''}`}>
                <Dialog open={activeCounter === null} onOpenChange={() => {}}>
                    <DialogContent
                        className="sm:max-w-md [&>button]:hidden"
                        onPointerDownOutside={(e) => e.preventDefault()}
                        onEscapeKeyDown={(e) => e.preventDefault()}
                    >
                        <DialogHeader>
                            <DialogTitle>Counter Selection</DialogTitle>
                            <DialogDescription>
                                You must select your assigned counter to start managing the queue.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6">
                            <Select onValueChange={setSelectedCounter}>
                                <SelectTrigger className="w-full h-12 cursor-pointer">
                                    <SelectValue placeholder="Select a counter..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1" className="cursor-pointer">Counter 01</SelectItem>
                                    <SelectItem value="2" className="cursor-pointer">Counter 02</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter>
                            <Button
                                className="w-full cursor-pointer"
                                disabled={!selectedCounter}
                                onClick={handleConfirm}
                            >
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex flex-col gap-5"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-bold tracking-tight">Queue</h2>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-row gap-4 items-center justify-center"
                        >
                            {activeCounter && (
                                <Button
                                    onClick={handleCallNext}
                                    disabled={loading}
                                    className="cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            <span className="ml-2 hidden sm:inline">Calling Next...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="mr-2 h-4 w-4" />
                                            Call Next
                                        </>
                                    )}
                                </Button>
                            )}
                        </motion.div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="w-70 pl-2">
                            <Search />
                        </div>
                        <PageSizeSelect limit={limit} />
                    </div>

                    {query && (
                        <p className="text-sm text-muted-foreground">
                            Showing {queueData.length} results for <span className="font-semibold text-foreground">{query}</span>
                        </p>
                    )}
                    <Separator />
                </motion.div>

                <motion.div
                    key={(query ?? "none") + currentPage + queueData.length}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="p-4 rounded-md border bg-card shadow-sm"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="text-center">
                                <TableHead className="text-center">No</TableHead>
                                <TableHead className="text-center">Token Number</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Counter Number</TableHead>
                                <TableHead className="text-center">Created At</TableHead>
                                <TableHead className="text-center">Updated At</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {queueData.length > 0 ? (
                                queueData.map((queue: QueueTicket, index: number) => (
                                    <motion.tr
                                        layout
                                        key={queue.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                                        whileHover={{ scale: 1.01, backgroundColor: "var(--accent)", transition: { duration: 0.2 } }}
                                        className="border-b transition-colors data-[state=selected]:bg-muted">
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="text-center">{queue.tokenNumber}</TableCell>
                                        <TableCell className="text-center">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${queue.status === 'WAITING' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {queue.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                                {queue.counterNumber || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">{new Date(queue.createdAt).toLocaleString()}</TableCell>
                                        <TableCell className="text-center">{new Date(queue.updatedAt).toLocaleString()}</TableCell>
                                        <TableCell className="flex flex-row justify-center gap-5">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    variant='secondary'
                                                    size='icon'
                                                    onClick={() => onDoneQueue(queue.id)}
                                                    className="cursor-pointer"
                                                >
                                                    <CheckCheck className="h-4 w-4" />
                                                </Button>
                                            </motion.div>

                                            <AlertModal
                                                loading={loading}
                                                title="Delete Queue Ticket?"
                                                description="This action cannot be undone."
                                                handleDelete={() => onDeleteQueue(queue.id)}
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Button variant='destructive' size='icon' className="bg-red-600! hover:bg-red-700! cursor-pointer">
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
                                        No queue available.
                                    </TableCell>
                                </motion.tr>
                            )}
                        </TableBody>
                    </Table>
                </motion.div>
                <div className="flex items-center justify-end rounded-md">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={() => onAddQueue()} disabled={loading} className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Queue
                        </Button>
                    </motion.div>
                </div>

                <div className="flex flex-row sm:flex-col items-center justify-between gap-4 px-2 py-4">
                    {limit !== 'all' && totalPages > 1 && (
                        <CustomPagination totalPages={totalPages} currentPage={currentPage} />
                    )}
                    <p className="text-sm text-muted-foreground">
                        Total {totalCount} items
                    </p>
                </div>
            </div>
        </AnimatePresence>
    )
}

export default QueuePage;