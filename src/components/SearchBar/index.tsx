'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from 'use-debounce';
import { Input } from "../ui/input";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";


interface SearchProps {
    paramKey?: string;
    placeholder?: string;
}

export default function Search({ paramKey = "query", placeholder = "Search..." }: SearchProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    
    const query = searchParams.get(paramKey)?.toString() || "";
    const [value, setValue] = useState(query);
    const [isFocused, setIsFocused] = useState(false);

    // Sync state if URL changes externally
    useEffect(() => {
        setValue(query);
    }, [query]);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        // Reset specific page key when searching
        const pageKey = paramKey === "query" ? "page" : "reqPage";
        params.set(pageKey, '1'); 
        
        if (term) params.set(paramKey, term);
        else params.delete(paramKey);
        
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const onClear = () => {
        setValue("");
        const params = new URLSearchParams(searchParams);
        params.delete(paramKey);
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <motion.div 
            className="relative w-full"
            animate={{ scale: isFocused ? 1.02 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    handleSearch(e.target.value);
                }} 
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`${value ? 'pr-10' : ''} transition-all duration-200 ${isFocused ? 'shadow-md ring-1 ring-primary/20 border-primary/50' : ''}`}
            />
            {value && (
                <Button onClick={onClear} className="bg-transparent hover:bg-transparent cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all active:scale-95">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </motion.div>
    );
}