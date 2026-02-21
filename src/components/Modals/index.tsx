'use client'

import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";


interface AlertModalProps {
    loading: boolean;
    title: string;
    description: string;
    handleDelete: () => void;
    children?: React.ReactNode;
}

export const CancelButton = motion.create(Button);
export const DeleteButton = motion.create(Button);

export const AlertModal = ({ loading, title, description, handleDelete, children }: AlertModalProps) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild disabled={loading}>
                {children ? children : <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button type="button" variant="destructive" className="bg-red-600! hover:bg-red-700! cursor-pointer">
                        Delete
                    </Button>
                </motion.div>}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <CancelButton
                            variant="secondary"
                            initial="initial"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={loading}
                            className="cursor-pointer"
                        >
                            Cancel
                        </CancelButton>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <DeleteButton
                            variant="destructive"
                            initial="initial"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={loading}
                            onClick={handleDelete}
                            className="bg-red-600! hover:bg-red-700! text-white cursor-pointer"
                        >
                            Delete
                        </DeleteButton>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}