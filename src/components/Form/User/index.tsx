'use client'

import { Staff } from "@/app/generated/prisma/client";
import { AlertModal } from "@/components/Modals";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { userFormSchema } from "@/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import axios from "axios";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { UserRoundPlus, View } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

interface UserFormProps {
    initialData?: Staff;
    onOptimisticDelete?: (id: string) => void;
}

type UserFormValues = z.infer<typeof userFormSchema>;

export const UserForm: React.FC<UserFormProps> = ({ initialData, onOptimisticDelete }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState<boolean>(false);

    const title = initialData ? "Edit User" : "Create User";
    const description = initialData ? "Update user information" : "Add a new user";
    const action = initialData ? "Save changes" : "Create";

    // Helper to parse names safely
    const getNames = (data?: Staff) => {
        const fullName = data?.name?.trim().split(" ");
        return {
            firstName: fullName?.[0] || "",
            lastName: fullName?.slice(1).join(" ") || ""
        };
    };

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            firstName: getNames(initialData).firstName,
            lastName: getNames(initialData).lastName,
            title: initialData?.title || "Staff",
            bio: initialData?.bio || "",
            email: initialData?.email || "",
            username: initialData?.username || "",
            password: "",
            confirmPassword: ""
        }
    });

    /** * EFFECT: Re-syncs form values when initialData changes 
     * This ensures the form updates automatically after a successful edit
     */
    useEffect(() => {
        if (initialData) {
            const { firstName, lastName } = getNames(initialData);
            form.reset({
                firstName,
                lastName,
                title: initialData.title || "Staff",
                bio: initialData.bio || "",
                email: initialData.email || "",
                username: initialData.username || "",
                password: "",
                confirmPassword: ""
            });
        }
    }, [initialData, form]);

    const onSubmit = async (values: UserFormValues) => {
        const toastId = toast.loading(initialData ? "Updating user..." : "Creating user...");
        
        try {
            setLoading(true);
            
            // Clean up data before sending
            const payload = {
                ...values,
                email: values.email?.toLowerCase().trim()
            };

            const url = initialData ? `/staff/admin/user/${initialData.id}` : "/staff/admin/user";
            const method = initialData ? "PATCH" : "POST";

            await api({ method, url, data: payload });

            toast.success(initialData ? "User updated" : "User created", { id: toastId });
            
            // 1. Refresh the server data (updates UserTable)
            router.refresh();
            // 2. Close the modal
            setOpen(false);
            // 3. Clear the form state
            form.reset();

        } catch (error: unknown) {
            if (isAxiosError(error)) {
                const serverErrors = error.response?.data?.errors;
                const customError = error.response?.data?.error;
    
                if (serverErrors) {
                    Object.keys(serverErrors).forEach((key) => {
                        form.setError(key as keyof UserFormValues, {
                            type: "server",
                            message: serverErrors[key][0],
                        });
                    });
                    toast.error("Please check the highlighted fields", { id: toastId });
                } else if (customError) {
                    toast.error(customError, { id: toastId });
                } else {
                    toast.error("Something went wrong", { id: toastId });
                }
            } else {
                toast.error("An unknown error occurred", { id: toastId });
                console.error("An unknown error occurred:", error)
            }
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            if (onOptimisticDelete && initialData) {
                onOptimisticDelete(initialData.id);
                setOpen(false);
            }
            await axios.delete(`/api/staff/admin/user/${initialData?.id}`);
            await api.delete(`/staff/admin/user/${initialData?.id}`);
            toast.success("User deleted successfully");
            router.refresh();
            if (!onOptimisticDelete) setOpen(false);
            form.reset();
        } catch {
            toast.error("Failed to delete user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {initialData ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="default" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add User
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className={`max-w-2xl ${loading ? 'cursor-wait' : ''}`}>
                <DialogHeader className="pb-1">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <motion.form
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="max-h-[60vh] overflow-y-auto pr-3 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input type="text" min={1} disabled={loading} placeholder="John" {...field} required />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input type="text" min={1} disabled={loading} placeholder="Doe" {...field} required />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" disabled={loading} placeholder="email@example.com" {...field} required />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input type="text" min={4} max={64} disabled={loading} placeholder="john_doe" {...field} required />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Professional Title</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange} required>    
                                            <FormControl>
                                                <SelectTrigger disabled={loading} className="w-full cursor-pointer">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Doctor" className="cursor-pointer" disabled={loading}>Doctor</SelectItem>
                                                <SelectItem value="Staff" className="cursor-pointer" disabled={loading}>Staff</SelectItem>
                                                <SelectItem value="Admin" className="cursor-pointer" disabled={loading}>Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                maxLength={160}
                                                disabled={loading}
                                                placeholder="Bio..."
                                                {...field}
                                                value={field.value ?? ""}
                                                className="resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <PasswordInput disabled={loading} placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <PasswordInput disabled={loading} placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-5">
                            <div className="flex justify-between w-full">
                                {initialData && (
                                    <AlertModal
                                        loading={loading}
                                        title="Are you sure?"
                                        description="This action cannot be undone."
                                        handleDelete={onDelete}
                                    />
                                )}
                                <div className="flex gap-2 ml-auto">
                                    {/* Cancel button wrapped in DialogClose */}
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
                                    
                                    {/* Submit button OUTSIDE DialogClose to allow processing */}
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button type="submit" disabled={loading} className="cursor-pointer">
                                            {action}
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </DialogFooter>
                    </motion.form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};