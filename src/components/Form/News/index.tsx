'use client'

import * as z from "zod";
import { Category, News, NewsImages, Staff } from "@/app/generated/prisma/client"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, LoaderPinwheel, Minus, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertModal } from "@/components/Modals";
import { useObjectUrlCleanup } from "@/hooks/use-object-url-cleanup";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import AsyncCreatableSelect from "react-select/async-creatable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { evidenceLevel, newsFormSchema, targetAudience } from "@/schema/news";
import Link from "next/link";


interface NewsFormProps {
    initialData?: News & { author?: Staff } & { category?: Category } & { images?: NewsImages[] };
    staff?: Staff;
}

type NewsFormValues = z.infer<typeof newsFormSchema>;

export const NewsForm: React.FC<NewsFormProps> = ({ initialData, staff }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiEnabled, setIsAiEnabled] = useState(false);
    const [tagsInput, setTagsInput] = useState<string>("");
    const [showFormattingRules, setShowFormattingRules] = useState(false);

    const title = initialData ? "Edit News" : "Create News";
    const description = initialData ? "Update news information" : "Add a new news";
    const action = initialData ? "Save changes" : "Create";

    const [previewUrls, setPreviewUrls] = useState<(string | null)[]>(() => {
        if (initialData?.images && initialData.images.length > 0) {
            return initialData.images.map(i => i.imageUrl || null);
        }

        return [null];
    });

    const form = useForm<NewsFormValues>({
        resolver: zodResolver(newsFormSchema),
        defaultValues: {
            title: initialData?.title || "",
            content: initialData?.content || "",
            images: initialData?.images?.length ? initialData.images.map(i => ({
                id: i.id,
                imageUrl: i.imageUrl || '',
                imageName: i.imageName || '',
                image: null
            })) : [{ id: null, imageUrl: '', imageName: '', image: null }],
            author: initialData?.author?.id || staff?.id,
            category: initialData?.category ? { label: initialData.category.name, value: initialData.category.id } : null,
            summary: initialData?.summary || "",
            tags: initialData?.tags || [],
            sourceLinks: initialData?.sourceLinks || [],
            targetAudience: initialData?.targetAudience || "GENERAL_PUBLIC",
            evidenceLevel: initialData?.evidenceLevel || undefined
        }
    });

    const { getValues } = form;

    // Initialize tags input from initial data
    useEffect(() => {
        const currentTags = getValues('tags');
        if (Array.isArray(currentTags) && currentTags.length > 0) {
            setTagsInput(currentTags.join(', '));
        }
    }, [getValues]);

    useObjectUrlCleanup(previewUrls);

    const handleImageSelect = (file: File, index: number) => {
        const newPreviewUrl = URL.createObjectURL(file);

        if (previewUrls[index]?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrls[index]!);
        }

        const newPreviews = [...previewUrls];
        newPreviews[index] = newPreviewUrl;
        setPreviewUrls(newPreviews);

        const currentImages = form.getValues('images') || [];
        currentImages[index] = {
            ...currentImages[index],
            image: file,
            imageName: file.name
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

    const handleAddSourceLinks = () => {
        const currentLinks = form.getValues('sourceLinks') || [];
        form.setValue('sourceLinks', [...currentLinks, ''], {
            shouldDirty: true,
            shouldValidate: true
        });
    };

    const handleRemoveSourceLinks = (index: number) => {
        const currentLinks = form.getValues('sourceLinks') || [];
        form.setValue('sourceLinks', currentLinks.filter((_, i) => i !== index), {
            shouldDirty: true
        });
    };

    const getCategories = async (inputValue: string) => {
        try {
            const { data } = await api.get('/news/category', {
                params: {
                    search: inputValue
                }
            });
            return data;
        } catch {
            toast.error("Failed to fetch categories");
            return [];
        }
    };

    const onCreateCategory = async (inputValue: string) => {
        setLoading(true);
        try {
            const { data } = await api.post('/news/category', {
                name: inputValue
            });

            form.setValue('category', data);

            toast.success(`Category "${inputValue}" created successfully!`);
        } catch {
            toast.error("Failed to create new category");
        } finally {
            setLoading(false);
        }
    }

    const handleAiGenerate = async () => {
        if (!aiPrompt) return toast.error("Please enter a prompt to generate a content");

        setLoading(true);
        try {
            const response = await api.post('/news/geminiContent', {
                prompt: aiPrompt
            });

            form.setValue('content', response.data.content, {
                shouldValidate: true,
                shouldDirty: true
            });

            if (response.data.sourceLinks && Array.isArray(response.data.sourceLinks)) {
                form.setValue('sourceLinks', response.data.sourceLinks, {
                    shouldValidate: true,
                    shouldDirty: true
                });
            }

            toast.success("Content generated successfully");
        } catch {
            toast.error("Failed to generate content");
        } finally {
            setLoading(false);
        }
    }

    const handleAiGenerateSummary = async () => {
        const aiPrompt = form.getValues('content');
        if (!aiPrompt) return toast.error("Please fill the content field first");

        setLoading(true);
        try {
            const response = await api.post('/news/geminiSummary', {
                prompt: aiPrompt
            });

            form.setValue('summary', response.data.summary, {
                shouldValidate: true,
                shouldDirty: true
            });
            toast.success("Summary generated successfully");
        } catch {
            toast.error("Failed to generate summary");
        } finally {
            setLoading(false);
        }
    }

    const onSubmit = async (values: NewsFormValues) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('content', values.content);
            formData.append('author', values.author);
            formData.append('summary', values.summary);
            formData.append('targetAudience', values.targetAudience);
            formData.append('evidenceLevel', values.evidenceLevel || '');

            values.images?.forEach((img, i) => {
                if (img.image) {
                    formData.append(`images[${i}]`, img.image);
                    formData.append(`images[${i}].imageName`, img.imageName || img.image.name);
                }
                if (img.id) formData.append(`existing_images[]`, String(img.id));
            });

            if (values.category) {
                formData.append('categoryId', String(values.category.value));
            }

            if (values.tags && values.tags.length > 0) {
                values.tags.forEach((tag) => {
                    formData.append(`tags[]`, tag);
                });
            }

            if (values.sourceLinks && values.sourceLinks.length > 0) {
                values.sourceLinks.forEach((link) => {
                    formData.append(`sourceLinks[]`, link);
                });
            }

            if (!initialData) {
                await api.post('/news', formData);
                toast.success("News created successfully");
            } else {
                await api.patch(`/news/${initialData.id}`, formData);
                toast.success("News updated successfully");
            }

            router.refresh();
            router.push('/news');
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/news/${initialData?.id}`);
            toast.success("News deleted successfully");
            router.refresh();
            router.push('/news');
            form.reset();
        } catch {
            toast.error("Failed to delete news");
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
                    <Link href="/news">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 cursor-pointer h-9 px-4 py-2 has-[>svg]:px-3"
                        >
                            <ArrowLeft />
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
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                min={3}
                                                max={255}
                                                disabled={loading}
                                                placeholder="News title"
                                                {...field}
                                                required
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                        Generate content with AI
                                    </Label>
                                </div>
                                {isAiEnabled && (
                                    <div className="space-y-2 pl-2">
                                        <FormLabel>AI Content Prompt</FormLabel>
                                        <div className="flex flex-col w-full items-center gap-2">
                                            <Textarea
                                                placeholder="e.g., 'The effectiveness of the COVID-19 vaccine in preventing COVID-19'"
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
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormLabel>Content</FormLabel>
                                            <Info
                                                className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-primary"
                                                onClick={() => setShowFormattingRules(!showFormattingRules)}
                                            />
                                        </div>
                                        {showFormattingRules && (
                                            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                                <p className="font-medium mb-1">Formatting Rules:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li><strong>Title (H2):</strong> Wrap text with ** (e.g., **Title**)</li>
                                                    <li><strong>List:</strong> Start with * and space (e.g., * Item)</li>
                                                    <li><strong>Subtitle (H3):</strong> Short text (&lt;100 chars) without ending period</li>
                                                    <li><strong>Link (to related news title in this app database):</strong> Start with ## (e.g. ## Another News Title)</li>
                                                </ul>
                                            </div>
                                        )}
                                        <FormControl>
                                            <Textarea
                                                minLength={50}
                                                disabled={loading}
                                                placeholder="Generated news content will appear here."
                                                className="min-h-25"
                                                {...field}
                                                required
                                                />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <FormLabel>Images</FormLabel>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddImage}
                                        className="h-8 cursor-pointer"
                                        disabled={loading}
                                    >
                                        <Plus size={14} className="mr-1" />
                                        Image
                                    </Button>
                                </div>

                                <div className="space-y3">
                                    {form.watch('images')?.map((imageField, index) => (
                                        <div key={index} className="flex flex-row gap-3 items-start border p-3 rounded-md">
                                            <div className="flex-1 space-y-2">
                                                <ImageDropzone
                                                    id={`image-${index}`}
                                                    previewUrl={previewUrls[index]}
                                                    onImageSelect={(file) => handleImageSelect(file, index)}
                                                    label={`Click to upload image ${index + 1}`}
                                                />

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="author"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Author</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    disabled={loading}
                                                    placeholder="Author name"
                                                    {...field}
                                                    value={initialData?.author?.name || staff?.name || ""}
                                                    required
                                                    readOnly
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <AsyncCreatableSelect
                                                    cacheOptions
                                                    defaultOptions
                                                    loadOptions={getCategories}
                                                    onCreateOption={onCreateCategory}
                                                    isClearable
                                                    placeholder="Select a category..."
                                                    noOptionsMessage={() => "Category not found"}
                                                    loadingMessage={() => "Searching categories..."}
                                                    isDisabled={loading}
                                                    onChange={field.onChange}
                                                    value={field.value}
                                                    // Teleport the menu to body to avoid clipping issues with form containers
                                                    menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            backgroundColor: "transparent",
                                                            // Border matching Shadcn SelectTrigger
                                                            borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--input))",
                                                            boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--ring) / 0.5)" : "none",
                                                            borderRadius: "var(--radius)",
                                                            minHeight: "2.25rem", // Matches h-9
                                                            fontSize: "0.875rem",
                                                            cursor: loading ? "progress" : "pointer",
                                                            "&:hover": {
                                                                borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--input))",
                                                            },
                                                        }),
                                                        menuPortal: (base) => ({ 
                                                            ...base, 
                                                            zIndex: 9999 
                                                        }),
                                                        menu: (base) => ({
                                                            ...base,
                                                            // SOLID BACKGROUND (100% Opacity)
                                                            backgroundColor: "hsl(var(--background))",
                                                            // Explicit border to wrap the search results
                                                            border: "1px solid hsl(var(--border))",
                                                            borderRadius: "var(--radius)",
                                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                                                            marginTop: "4px",
                                                            overflow: "hidden", // Keeps item highlights from covering the menu border
                                                        }),
                                                        menuList: (base) => ({
                                                            ...base,
                                                            padding: "4px", // Matches p-1 in Shadcn SelectContent
                                                            backgroundColor: "transparent",
                                                        }),
                                                        option: (base, state) => ({
                                                            ...base,
                                                            // Matches Shadcn SelectItem hover/focus state
                                                            backgroundColor: state.isFocused ? "hsl(var(--accent))" : "transparent",
                                                            color: state.isFocused ? "hsl(var(--accent-foreground))" : "hsl(var(--foreground))",
                                                            padding: "8px 12px",
                                                            fontSize: "0.875rem",
                                                            cursor: "pointer",
                                                            borderRadius: "calc(var(--radius) - 4px)",
                                                            // Separation border between results
                                                            borderBottom: "1px solid hsl(var(--border) / 0.5)",
                                                            "&:last-child": {
                                                                borderBottom: "none",
                                                            },
                                                            "&:active": {
                                                                backgroundColor: "hsl(var(--accent))",
                                                            },
                                                        }),
                                                        singleValue: (base) => ({
                                                            ...base,
                                                            color: "hsl(var(--foreground))", // Solid black text in light mode
                                                        }),
                                                        input: (base) => ({
                                                            ...base,
                                                            color: "hsl(var(--foreground))",
                                                            cursor: loading ? "progress" : "text",
                                                        }),
                                                        placeholder: (base) => ({
                                                            ...base,
                                                            color: "hsl(var(--muted-foreground))",
                                                        }),
                                                        indicatorSeparator: () => ({
                                                            display: "none",
                                                        }),
                                                        dropdownIndicator: (base) => ({
                                                            ...base,
                                                            color: "hsl(var(--muted-foreground) / 0.5)",
                                                            cursor: loading ? "progress" : "pointer",
                                                        }),
                                                        clearIndicator: (base) => ({
                                                            ...base,
                                                            color: "hsl(var(--muted-foreground))",
                                                            cursor: "pointer",
                                                            "&:hover": {
                                                                color: "hsl(var(--destructive))",
                                                            },
                                                        }),
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                            <div>
                                <FormField
                                control={form.control}
                                name="summary"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex flex-row justify-between items-center">
                                            <FormLabel>Summary</FormLabel>
                                            <Button
                                                type="button"
                                                onClick={handleAiGenerateSummary}
                                                disabled={loading || !form.getValues('content')}
                                                variant="outline"
                                                className="shrink-0 cursor-pointer"
                                            >
                                                {loading ? <LoaderPinwheel className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                                <span className="ml-2 hidden sm:inline">Generate</span>
                                            </Button>
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                minLength={50}
                                                maxLength={500}
                                                disabled={loading}
                                                placeholder="News summary"
                                                {...field}
                                                className="min-h-25"
                                                required
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    min={3}
                                                    placeholder="HealthNews, HealthTips, etc."
                                                    disabled={loading}
                                                    value={tagsInput}
                                                    onChange={e => setTagsInput(e.target.value)}
                                                    onBlur={() => {
                                                        const tagsArr = tagsInput
                                                            .split(',')
                                                            .map(tag => tag.trim())
                                                            .filter(tag => tag.length > 0);
                                                        field.onChange(tagsArr);
                                                    }}
                                                    name={field.name}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-col border p-3 rounded-md">
                                    <FormLabel className="mb-2">Source Links</FormLabel>
                                    {form.watch('sourceLinks')?.map((_, index) => (
                                        <div key={index} className="relative flex flex-row gap-3 items-start border p-3 rounded-md mb-3">
                                            <FormField
                                                control={form.control}
                                                name={`sourceLinks.${index}`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input
                                                                type="url"
                                                                min={5}
                                                                placeholder="https://example.com"
                                                                disabled={loading}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {(form.watch('sourceLinks') ?? []).length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleRemoveSourceLinks(index)}
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full cursor-pointer hover:bg-red-900"
                                                    disabled={loading}
                                                >
                                                    <Minus size={14} />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddSourceLinks}
                                        className="h-8 w-full cursor-pointer"
                                        disabled={loading}
                                    >
                                        <Plus size={14} className="mr-1" />
                                    </Button>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="targetAudience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Audience</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange} required>
                                                <FormControl>
                                                    <SelectTrigger className="cursor-pointer w-full" disabled={loading}>
                                                        <SelectValue placeholder="Select target audience" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {targetAudience.map((audience) => (
                                                        <SelectItem key={audience.value} value={audience.value} className="cursor-pointer" disabled={loading}>
                                                            {audience.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="evidenceLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Evidence Level</FormLabel>
                                            <Select value={field.value || undefined} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className="cursor-pointer w-full" disabled={loading}>
                                                        <SelectValue placeholder="Select evidance level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {evidenceLevel.map((evidance) => (
                                                        <SelectItem key={evidance.value} value={evidance.value} className="cursor-pointer" disabled={loading}>
                                                            {evidance.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex flex-row mt-18 items-center justify-between">
                                {initialData && (
                                    <AlertModal
                                        loading={loading}
                                        title="Are you sure?"
                                        description="This action cannot be undone. This will permanently delete this promo"
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
    )
}