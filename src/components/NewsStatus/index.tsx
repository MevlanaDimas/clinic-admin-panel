'use client'

import * as z from "zod";
import { Signature } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { News } from "@/app/generated/prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { motion } from "framer-motion";


interface NewsStatusFormProps {
    initialData?: News;
    onOptimisticUpdate?: (id: string, status: string) => void;
}

const statusSelect = [
    { value: "DRAFT", label: "Draft" },
    { value: "PENDING_REVIEW", label: "Pending Review" },
    { value: "PUBLISHED", label: "Published" },
    { value: "ARCHIVED", label: "Archived" }
] as const;

const statusSelectValues = statusSelect.map(s => s.value);

const formSchema = z.object({
    status: z.enum(statusSelectValues as [string, ...string[]])
});

type NewsStatusFormValues = z.infer<typeof formSchema>;

export const NewsStatusModal: React.FC<NewsStatusFormProps> = ({ initialData, onOptimisticUpdate }) => {
    const [open, setOpen] = useState<boolean>(false);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<NewsStatusFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: initialData?.status || "DRAFT"
        }
    });

    const onSubmit = async (values: NewsStatusFormValues) => {
        if (!initialData) return;

        try {
            setLoading(true);
            if (onOptimisticUpdate && initialData) {
                onOptimisticUpdate(initialData.id, values.status);
                setOpen(false);
            }
            await api.patch(`/news/${initialData.id}/status`, {
                status: values.status
            });
            toast.success("News status updated successfully");

            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="secondary" className="cursor-pointer">
                    <Signature />
                </Button>
            </DialogTrigger>
            <DialogContent className={`max-w-2xl ${loading ? 'cursor-wait' : ''}`}>
                <DialogHeader className="pb-1">
                    <DialogTitle>Change Article Status</DialogTitle>
                    <DialogDescription>Change the status of {initialData?.title}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange} required>
                                            <FormControl>
                                                <SelectTrigger className="w-full cursor-pointer">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statusSelect.map((status) => (
                                                    <SelectItem key={status.value} value={status.value} className="cursor-pointer">
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="gap-2 pt-5">
                                <div className="flex justify-between w-full">
                                    <DialogClose asChild>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button type="button" variant="secondary" className="cursor-pointer">Cancel</Button>
                                        </motion.div>
                                    </DialogClose>

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button type="submit" disabled={loading} className="cursor-pointer">Submit</Button>
                                    </motion.div>
                                </div>
                            </DialogFooter>
                        </motion.form>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    );
}