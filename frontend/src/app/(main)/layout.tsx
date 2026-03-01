"use client";

import AppLayout from "@/components/composite/AppLayout";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppLayout>{children}</AppLayout>;
}
