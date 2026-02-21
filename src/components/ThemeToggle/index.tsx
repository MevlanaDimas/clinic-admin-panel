'use client'

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes"
import { Switch } from "../ui/switch";


export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = (checked: boolean) => {
        const newTheme = checked ? "dark" : "light";
        setTheme(newTheme);
        document.cookie = `theme=${newTheme}; path=/; max-age=31536000;`
    }

    return (
        <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <Switch
                id="theme-mode"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                aria-label="Toggle theme"
                className="cursor-pointer"
            />
            <Moon className="h-4 w-4" />
        </div>
    );
}