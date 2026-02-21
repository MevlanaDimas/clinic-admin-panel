'use client'

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DAYS_OF_WEEK, doctorScheduleSchema, DoctorScheduleValues } from "@/schema/schedule";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveTimePicker } from "@/components/TimePicker";
import { AlertModal } from "@/components/Modals";
import { DoctorPracticeSchedule } from "@/app/generated/prisma/client";
import api from "@/lib/api";


interface DoctorScheduleFormProps {
    doctorName: string;
    doctorId: string;
    schedules?: {
        day: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
    }[];
    onScheduleDelete?: (id: string) => void;
    onScheduleUpdate?: (doctorId: string, newSchedules: DoctorPracticeSchedule[]) => void;
}

export const DoctorScheduleForm: React.FC<DoctorScheduleFormProps> = ({ 
    doctorName,
    doctorId,
    schedules,
    onScheduleDelete,
    onScheduleUpdate
}) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const form = useForm<DoctorScheduleValues>({
        resolver: zodResolver(doctorScheduleSchema),
        defaultValues: {
            schedules: schedules?.length 
                ? schedules.map(s => ({
                    day: s.day as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday",
                    startTime: s.startTime,
                    endTime: s.endTime,
                    isAvailable: s.isAvailable ?? true
                })) 
                : [{ day: "Monday" as const, startTime: "09:00", endTime: "17:00", isAvailable: true }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "schedules"
    });

    const onSubmit = async (values: DoctorScheduleValues) => {
        const toastId = toast.loading("Updating practice schedules...");
        try {
            setLoading(true);
            const url = `/doctor/schedule/${doctorId}`;
            const response = await api.patch(url, values);
            toast.success("Schedule updated successfully", { id: toastId });
            if (onScheduleUpdate) {
                onScheduleUpdate(doctorId, response.data);
            }

            router.refresh();
            setOpen(false);
            form.reset();
        } catch {
            toast.error("Failed to update schedule", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            if (onScheduleDelete && schedules) {
                onScheduleDelete(doctorId);
                setOpen(false);
            }
            await api.delete(`/doctor/schedule/${doctorId}`);
            toast.success("Schedule deleted successfully");
            router.refresh();
            if (!onScheduleDelete) setOpen(false);
            form.reset();
        } catch {
            toast.error("Failed to delete schedule");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    <CalendarDays className="mr-2 size-4" />
                    Manage Schedule
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Practice Schedule</DialogTitle>
                    <DialogDescription>
                        Update working hours for Dr. {doctorName || "Staff"}.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <motion.form
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="max-h-[60vh] overflow-y-auto pr-3 space-y-4 scrollbar-thin">
                            <AnimatePresence mode="popLayout">
                                {fields.map((field, index) => (
                                    <motion.div
                                        key={field.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="relative grid grid-cols-2 md:grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-card shadow-sm"
                                    >
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            disabled={fields.length === 1 || loading}
                                            onClick={() => remove(index)}
                                            className="absolute right-1 top-1 -mt-1 -mr-1 text-destructive hover:bg-destructive/10 cursor-pointer border"
                                        >
                                            <Trash2 size={18} />
                                        </Button>

                                        <FormField
                                            control={form.control}
                                            name={`schedules.${index}.day`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2 md:col-span-4 mt-4">
                                                    <FormLabel>Day</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} required>
                                                        <FormControl>
                                                            <SelectTrigger className="cursor-pointer">
                                                                <SelectValue placeholder="Day" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {DAYS_OF_WEEK.map(d => (
                                                                <SelectItem key={d} value={d} className="cursor-pointer">{d}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`schedules.${index}.startTime`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-1 md:col-span-4 mt-4">
                                                    <FormLabel>Start</FormLabel>
                                                    <FormControl>
                                                        <InteractiveTimePicker value={field.value} onChange={field.onChange} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`schedules.${index}.endTime`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-1 md:col-span-4 mt-4">
                                                    <FormLabel>End</FormLabel>
                                                    <FormControl>
                                                        <InteractiveTimePicker value={field.value} onChange={field.onChange} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`schedules.${index}.isAvailable`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2 md:col-span-12">
                                                    <FormLabel>Status</FormLabel>
                                                    <Select onValueChange={(val) => field.onChange(val === "true")} value={field.value ? "true" : "false"} required>
                                                        <FormControl>
                                                            <SelectTrigger className="cursor-pointer">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="true" className="cursor-pointer">Available</SelectItem>
                                                            <SelectItem value="false" className="cursor-pointer">Unavailable</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={loading}
                                className="w-full border-dashed cursor-pointer"
                                onClick={() => append({ day: "Monday", startTime: "09:00", endTime: "17:00", isAvailable: true })}
                            >
                                <Plus className="mr-2 size-4" />
                                Add New Time Slot
                            </Button>
                        </div>

                        <DialogFooter className="pt-5">
                            <div className="flex justify-between w-full">
                                {schedules && (
                                    <AlertModal
                                        loading={loading}
                                        title="Are you sure?"
                                        description="This action cannot be undone"
                                        handleDelete={onDelete}
                                    />
                                )}
                            </div>
                            <div className="flex gap-2 ml-auto">
                                <DialogClose asChild>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button type="button" variant="secondary" disabled={loading} className="cursor-pointer">
                                            Cancel
                                        </Button>
                                    </motion.div>
                                </DialogClose>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button type="submit" disabled={loading} className="cursor-pointer">
                                        {loading ? "Saving..." : "Save Schedules"}
                                    </Button>
                                </motion.div>
                            </div>
                        </DialogFooter>
                    </motion.form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};