'use client'

import { ChangeEvent, DragEvent, useState } from "react";
import { compressImage } from "@/lib/image-compression"
import { Label } from "./label";
import Image from "next/image";
import { Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";


interface ImageDropzoneProps {
    previewUrl: string | null;
    onImageSelect: (file: File) => void;
    id: string;
    label?: string;
    className?: string;
    imageClassName?: string;
}

const MotionLabel = motion.create(Label);

export function ImageDropzone({ previewUrl, onImageSelect, id, label = "Click to upload image", className, imageClassName = "max-h-48 max-w-full" }: ImageDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const compressed = await compressImage(file);
            onImageSelect(compressed);
            e.target.value = "";
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith("image/")) {
                const compressed = await compressImage(file);
                onImageSelect(compressed);
            } else {
                toast.error("Please upload an image file");
            }
        }
    };

    return (
        <MotionLabel
            htmlFor={id}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={{ scale: isDragging ? 1.02 : 1, borderColor: isDragging ? "var(--primary)" : "var(--border)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`flex flex-col w-full justify-center items-center text-center gap-1 pt-2 cursor-pointer border-2 border-dashed rounded-md p-4 transition-colors ${isDragging ? 'bg-primary/5' : 'hover:bg-muted/50'} ${className}`}
        >
            <AnimatePresence mode="wait">
            {previewUrl ? (
                // Next.js Image cannot reliably render `blob:` object URLs — use a plain <img>
                // for blob previews and keep Next/Image for remote/static URLs.
                previewUrl.startsWith("blob:") ? (
                    <motion.img
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        src={previewUrl}
                        alt="Preview"
                        className={`${imageClassName} object-contain rounded-md`}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative"
                    >
                    <Image
                        src={previewUrl}
                        alt="Preview"
                        width={400}
                        height={175}
                        className={`${imageClassName} object-contain rounded-md`}
                    />
                    </motion.div>
                )
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-col items-center text-muted-foreground"
                >
                    <Upload size={20} className="mb-2" />
                    <span className="text-xs">{label}</span>
                </motion.div>
            )}
            </AnimatePresence>
            <input 
                type="file" 
                id={id} 
                accept="image/*" 
                onChange={handleFileChange} 
                className="sr-only"
                title={label}
            />
        </MotionLabel>
    );
}