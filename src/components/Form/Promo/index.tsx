"use client"

import * as z from "zod";
import api from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react"
import { toast } from "sonner";
import { ArrowLeft, Info, LoaderPinwheel, Plus, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AlertModal } from "@/components/Modals"; 
import { Promo, PromoImages } from "@/app/generated/prisma/client";
import { Textarea } from "@/components/ui/textarea";
import { useObjectUrlCleanup } from "@/hooks/use-object-url-cleanup";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { promoFormSchema } from "@/schema/promo";
import Link from "next/link";


interface PromoFormProps {
    initialData?: Promo & { image?: PromoImages[] };
}

type PromoFormValues = z.infer<typeof promoFormSchema>;

export const PromoForm: React.FC<PromoFormProps> = ({ initialData }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiEnabled, setIsAiEnabled] = useState(false);
    const [showFormattingRules, setShowFormattingRules] = useState(false);

    const title = initialData ? "Edit Promo" : "Create Promo";
    const description = initialData ? "Update promo information" : "Add a new promo";
    const action = initialData ? "Save changes" : "Create";

    const getTodayDateString = () => {
        const today = new Date();

        return today.toISOString().split('T')[0];
    };
    const todayDate = getTodayDateString();

    const [previewUrls, setPreviewUrls] = useState<(string | null)[]>(() => {
        if (initialData?.image && initialData.image.length > 0) {
            // Ensure that even if imageUrl is missing, we return null.
            return initialData.image.map(i => i.imageUrl || null);
        }
        return [null]; // Always start with one image slot for new promos
    });

    const form = useForm<PromoFormValues>({
        resolver: zodResolver(promoFormSchema),
        defaultValues: {
            code: initialData?.code || "",
            headline: initialData?.headline || "",
            description: initialData?.description || "",
            CTA: initialData?.CTA || "",
            category: initialData?.category || "",
            images: initialData?.image?.length ? initialData.image.map(i => ({
                id: i.id,
                imageUrl: i.imageUrl || '',
                imageName: i.imageName || '',
                image: null
            })) : [{ id: null, imageUrl: '', imageName: '', image: null }],
            validUntil: initialData?.validUntil || new Date()
        }
    });

    useObjectUrlCleanup(previewUrls);

    const handleImageSelect = (file: File, index: number) => {
    // This is the "blob:..." string used for previews only
        const newPreviewUrl = URL.createObjectURL(file);

        if (previewUrls[index]?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrls[index]!);
        }

        const newPreviews = [...previewUrls];
        newPreviews[index] = newPreviewUrl;
        setPreviewUrls(newPreviews);

        // Update the form state
        const currentImages = form.getValues('images') || [];
        currentImages[index] = { 
            ...currentImages[index], 
            image: file, 
            imageName: file.name // CORRECT: Use the actual filename here
        };
        
        form.setValue('images', currentImages, { 
            shouldDirty: true, 
            shouldValidate: true 
        });
    };

    const handleAddImage = () => {
        setPreviewUrls([...previewUrls, null]);
        const currentImages = form.getValues('images') || [];
        form.setValue('images', [...currentImages, { id: null, image: null, imageUrl: '', imageName: '' }]);
    };

    const handleRemoveImage = (index: number) => {
        if (previewUrls[index]?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrls[index]!);
        }
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        setPreviewUrls(newPreviews);
        const currentImages = form.getValues('images') || [];
        form.setValue('images', currentImages.filter((_, i) => i !== index), { shouldDirty: true });
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt) return toast.error("Please enter a prompt to generate a description");

        setLoading(true);
        try {
            const response = await api.post('/promo/geminiDescription', { prompt: aiPrompt });

            form.setValue('description', response.data.description, { shouldValidate: true, shouldDirty: true });
            toast.success("Description generated successfully");
        } catch {
            toast.error("Failed to generate description");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (values: PromoFormValues) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('headline', values.headline);
            formData.append('code', values.code);
            formData.append('description', values.description || "");
            formData.append('CTA', values.CTA || "");
            formData.append('category', values.category || "");

            if (values.validUntil) {
                formData.append('validUntil', values.validUntil.toISOString());
            }

            values.images?.forEach((img, i) => {
                if (img.image) {
                    formData.append(`images[${i}]`, img.image);
                    formData.append(`images[${i}].imageName`, img.imageName || img.image.name);
                }
                if (img.id) formData.append(`existing_images[]`, String(img.id));
            });

            if (!initialData) {
                await api.post('/promo', formData);
                toast.success("Promo created successfully");
            } else {
                await api.patch(`/promo/${initialData.id}`, formData);
                toast.success("Promo updated successfully");
            }
            router.refresh();
            router.push('/promo');
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/promo/${initialData?.id}`);
            toast.success("Promo deleted successfully");
            router.refresh();
            router.push('/promo');
            form.reset();
        } catch {
            toast.error("Failed to delete promo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`flex-col ${loading ? 'cursor-wait' : ''}`}>
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    <Link href="/promo">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 cursor-pointer h-9 px-4 py-2 has-[>svg]:px-3"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </motion.div>
                    </Link>
                </div>
                <Separator />
                
                <div className="w-full p-5">
                    <Form {...form}>
                        <motion.form
                            layout
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8 w-full"
                        >
                            <div>
                            <FormField
                                control={form.control}
                                name="headline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Headline</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                min={3}
                                                max={30}
                                                disabled={loading}
                                                placeholder="Promo headline"
                                                {...field}
                                                required
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </div>

                            {/* Images Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <FormLabel>Images</FormLabel>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleAddImage} // Now correctly uses handleAddImage
                                        className="h-8 cursor-pointer"
                                        disabled={loading || (form.watch('images')?.length || 0) >= 1}
                                    >
                                        <Plus size={14} className="mr-1" /> Add Image
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {form.watch('images')?.map((imageField, index) => (
                                        <div key={index} className="flex flex-row gap-3 items-start border p-3 rounded-md">
                                            <div className="flex-1 space-y-2">
                                                <ImageDropzone
                                                    id={`image-${index}`}
                                                    previewUrl={previewUrls[index]}
                                                    onImageSelect={(file) => handleImageSelect(file, index)}
                                                    label={`Click to upload image ${index + 1}`}
                                                />
                                                {/* Image Name with FormControl */}
                                                <FormField
                                                    control={form.control}
                                                    name={`images.${index}.imageName`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input 
                                                                    {...field}
                                                                    placeholder="Image Name" 
                                                                    className="h-8 text-xs"
                                                                    readOnly
                                                                    disabled
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <Button 
                                                type="button" 
                                                variant="destructive" 
                                                size="icon" 
                                                onClick={() => handleRemoveImage(index)} 
                                                className="shrink-0 cursor-pointer hover:bg-red-900"
                                                disabled={loading}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="ai-prompt-switch"
                                        checked={isAiEnabled}
                                        onCheckedChange={setIsAiEnabled}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="ai-prompt-switch">
                                        Generate description with AI
                                    </Label>
                                </div>
                                {isAiEnabled && (
                                    <div className="space-y-2 pl-2">
                                        <FormLabel>AI Description Prompt</FormLabel>
                                        <div className="flex flex-col w-full items-center gap-2">
                                            <Textarea
                                                placeholder="e.g., 'A summer discount for new customers'"
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                disabled={loading}
                                            />
                                            <div className="flex w-full items-center justify-end">
                                                <Button
                                                    type="button"
                                                    onClick={handleAiGenerate}
                                                    disabled={loading || !aiPrompt}
                                                    variant="outline"
                                                    className="shrink-0 cursor-pointer"
                                                >
                                                    {loading ? <LoaderPinwheel className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                                    <span className="ml-2 hidden sm:inline">Generate</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel>Description</FormLabel>
                                            <Info
                                                className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-primary"
                                                onClick={() => setShowFormattingRules(!showFormattingRules)}
                                            />
                                        </div>
                                        {showFormattingRules && (
                                            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                                <p className="font-medium mb-1">Formatting Rules:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li><strong>Bold:</strong> Wrap text with ** (e.g., **Bold Text**)</li>
                                                </ul>
                                            </div>
                                        )}
                                        <FormControl>
                                            <Textarea maxLength={130} disabled={loading} placeholder="Generated promo description will appear here." className="min-h-25" {...field} required />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </div>

                            <div>
                                <FormField
                                control={form.control}
                                name="CTA"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CTA</FormLabel>
                                        <FormControl>
                                            <Input type="text" min={5} max={40} disabled={loading} placeholder="Click here for Online Consultaion" {...field} required />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code</FormLabel>
                                            <FormControl>
                                                <Input type="text" min={5} max={10} disabled={loading} placeholder="PROMO123" {...field} required />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <Input type="text" min={1} disabled={loading} placeholder="Seasonal" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="validUntil"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Valid Until</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    disabled={loading} 
                                                    type="date" 
                                                    min={todayDate}
                                                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    ref={field.ref}
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                            <div className="flex flex-row mt-18 items-center justify-between">
                                {initialData && (
                                    <AlertModal 
                                        loading={loading}
                                        title="Are you sure?"
                                        description="This action cannot be undone. This will permanently delete this promo."
                                        handleDelete={onDelete}
                                    />
                                )}

                                <motion.div className="ml-auto" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button disabled={loading} className="cursor-pointer" type="submit">
                                        {action}
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.form>
                    </Form>
                </div>
            </div>
        </div>
    );
};