'use client'

import * as z from "zod";
import { RoleRequest, Staff } from "@/app/generated/prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Signature } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import api from "@/lib/api";
import { toast } from "sonner";
import { statusSelect, titleAdminConfirmationSchema } from "@/schema/user";
import { motion } from "framer-motion";


interface UserRequestedTitleChangeApprovalFormProps {
    initialData?: RoleRequest & { staff?: Staff };
    onOptimisticUpdate?: (id: string) => void;
}

type UserRequestedTitleChangeApprovalFormValues = z.infer<typeof titleAdminConfirmationSchema>;

export const UserRequestedTitleChangeApprovalForm: React.FC<UserRequestedTitleChangeApprovalFormProps> = ({ initialData, onOptimisticUpdate }) => {
    const [open, setOpen] = useState<boolean>(false);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<UserRequestedTitleChangeApprovalFormValues>({
        resolver: zodResolver(titleAdminConfirmationSchema),
        defaultValues: {
            status: initialData?.status || "PENDING"
        }
    });

    const onSubmit = async (values: UserRequestedTitleChangeApprovalFormValues) => {
        if (!initialData) return;

        try {
            setLoading(true);
            if (onOptimisticUpdate && initialData) {
                onOptimisticUpdate(initialData.id);
                setOpen(false);
            }
            await api.patch(`/staff/role-request/${initialData.id}`, {
                decision: values.status
            });
            toast.success("Title change request status updated successfully");

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
                <Button
                    type="button"
                    variant="secondary"
                    className="cursor-pointer"
                >
                    <Signature />
                </Button>
            </DialogTrigger>
            <DialogContent className={`max-w-2xl ${loading ? 'cursor-wait' : ''}`}>
                <DialogHeader>
                    <DialogTitle>Change User Title Status</DialogTitle>
                    <DialogDescription>Change the status of requested title change for {initialData?.staff?.name}</DialogDescription>
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
                                                <SelectTrigger className="w-full cursor-pointer" disabled={loading}>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statusSelect.map((status) => (
                                                    <SelectItem
                                                        key={status.value}
                                                        value={status.value}
                                                        disabled={loading}
                                                        className="cursor-pointer"
                                                    >
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="gap-2 pt-2">
                                <div className="flex justify-between w-full">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="cursor-pointer"
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="cursor-pointer"
                                        >
                                            Submit
                                        </Button>
                                    </motion.div>
                                </div>
                            </DialogFooter>
                        </motion.form>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    )
}