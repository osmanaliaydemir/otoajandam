"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";

export default function AuthInitializer() {
    const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    // Route bazlı koruma (basit koruma)
    // Public rotalar (login, register vb)
    const publicRoutes = ["/login", "/"];

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        // Sadece kontrol bitmişse işlem yap
        if (!isLoading) {
            if (!isAuthenticated && !publicRoutes.includes(pathname)) {
                router.push("/login");
            }

            if (isAuthenticated && pathname === "/login") {
                router.push("/dashboard");
            }
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Herhangi bir görsel element dönmeyiz (Sadece logic için)
    return null;
}
