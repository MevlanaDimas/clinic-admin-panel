"use client";

import { Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";


export function InteractiveTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [h, m] = (value || "09:00").split(":");
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
    const minutes = ["00", "15", "30", "45"];

    return (
        <Popover modal={true}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-mono">
                    {value || "00:00"}
                    <Clock className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2" align="start">
                <div className="flex h-48 gap-2">
                    <ScrollArea className="w-1/2 border-r pr-2">
                        <div className="flex flex-col gap-1">
                            {hours.map((hour) => (
                                <Button key={hour} size="sm" variant={h === hour ? "default" : "ghost"} 
                                    onClick={() => onChange(`${hour}:${m}`)}>
                                    {hour}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                    <ScrollArea className="w-1/2">
                        <div className="flex flex-col gap-1">
                            {minutes.map((min) => (
                                <Button key={min} size="sm" variant={m === min ? "default" : "ghost"} 
                                    onClick={() => onChange(`${h}:${min}`)}>
                                    {min}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>
    );
}