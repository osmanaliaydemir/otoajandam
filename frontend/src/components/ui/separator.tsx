import React from "react";
import { Badge } from "./badge";

export const Separator = ({ className = "" }: { className?: string }) => {
    return <div className={`h-px w-full bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
};
