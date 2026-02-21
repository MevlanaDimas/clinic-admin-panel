'use client'

import * as z from "zod";
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { bioSchema, titleSchema } from "@/schema/user";
import { motion } from "framer-motion";
import { pusherClient } from "@/lib/pusher";


type UserBioFormValues = z.infer<typeof bioSchema>;

type UserTitleFormValues = z.infer<typeof titleSchema>;

export default function UserBioAndTitleForm() {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?.id) return;

        const channel = pusherClient.subscribe(`private-user-${user.id}`);

        channel.bind('request-status-updated', (data: { status: string, title: string }) => {
            if (data.status === 'ACCEPTED') {
                toast.success(`Your request for title "${data.title}" was approved!`);
                user.reload();
            } else {
                toast.error(`Your request for title "${data.title}" was rejected!`);
            }
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(`private-user-${user.id}`);
        };
    }, [user]);

    const bioForm = useForm<UserBioFormValues>({
        resolver: zodResolver(bioSchema),
        defaultValues: {
            bio: (user?.publicMetadata.bio as string) ?? ""
        }
    });

    const titleForm = useForm<UserTitleFormValues>({
        resolver: zodResolver(titleSchema),
        defaultValues: {
            title: (user?.publicMetadata.title as "Doctor" | "Staff" | "Admin")
        }
    })

    const onBioSubmit = async (values: UserBioFormValues) => {
        setLoading(true);
        try {
            await api.patch(`/staff/${user?.id}`, {
                bio: values.bio
            });
            await user?.reload();
            toast.success("Bio updated successfully");
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    const handleTitleChangeRequest = async (values: UserTitleFormValues) => {
        setLoading(true);
        try {
            await api.post("/staff/role-request", {
                title: values.title
            });
            await user?.reload();
            toast.success("Title request has been sent");
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`w-full space-y-6 px-2 py-4 ${loading ? 'cursor-wait' : ''}`}>
            <header>
                <h2 className="text-xl font-semibold tracking-tight">Bio & Title</h2>
                <p className="text-sm text-muted-foreground">
                    Update your title and bio. These are synced to your account and our database.
                </p>
            </header>

            <Form {...titleForm}>
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={titleForm.handleSubmit(handleTitleChangeRequest)}
                    className="space-y-4"
                >
                    <FormField
                        control={titleForm.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Professional Title</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange} required>
                                    <FormControl>
                                            <SelectTrigger disabled={loading} className="w-full cursor-pointer">
                                                <SelectValue placeholder="Select your role" />
                                            </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="z-99999">
                                        <SelectItem value="Doctor" className="cursor-pointer" disabled={loading}>Doctor</SelectItem>
                                        <SelectItem value="Staff" className="cursor-pointer" disabled={loading}>Staff</SelectItem>
                                        <SelectItem value="Admin" className="cursor-pointer" disabled={loading}>Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-end"
                    >
                        <Button
                            disabled={loading}
                            type="submit"
                            className="cursor-pointer"
                        >
                            Update Title
                        </Button>
                    </motion.div>
                </motion.form>
            </Form>

            <Form {...bioForm}>
                <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={bioForm.handleSubmit(onBioSubmit)}
                        className="space-y-4"
                    >
                    <FormField
                        control={bioForm.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <Textarea
                                        maxLength={160}
                                        disabled={loading}
                                        placeholder="Tell us a little bit about yourself"
                                        {...field}
                                        value={field.value ?? ""}
                                        className="resize-none"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-end"
                    >
                        <Button
                            disabled={loading}
                            type="submit"
                            className="cursor-pointer"
                        >
                            Update Bio
                        </Button>
                    </motion.div>
                </motion.form>
            </Form>
        </div>
    )
}