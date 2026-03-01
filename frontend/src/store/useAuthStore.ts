import { create } from "zustand";
import Cookies from "js-cookie";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    tenantId: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    checkAuth: () => void; // Uygulama açılışında token kontrolü
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Başlangıçta yükleniyor kabul edelim, hydrate olana kadar.

    login: (token, userData) => {
        Cookies.set("token", token, { expires: 7 }); // 7 gün geçerli çerez
        set({ user: userData, isAuthenticated: true, isLoading: false });
    },

    logout: () => {
        Cookies.remove("token");
        set({ user: null, isAuthenticated: false, isLoading: false });
        // Logout olunca opsiyonel frontend routing yapılabilir (hooks içinde tercih edilir)
    },

    checkAuth: () => {
        const token = Cookies.get("token");
        if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }

        // JWT Payload decode edilerek User objesi çıkartılabilir (basit base64 json parse)
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );

            const decoded = JSON.parse(jsonPayload);

            const roles = Array.isArray(decoded.role)
                ? decoded.role
                : decoded.role
                    ? [decoded.role]
                    : [];

            set({
                user: {
                    id: decoded.nameid || "",
                    firstName: decoded.given_name || "",
                    lastName: decoded.family_name || "",
                    email: decoded.email || decoded.unique_name || "",
                    tenantId: decoded.TenantId || "",
                    roles: roles,
                },
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (err) {
            console.error("Token parse error", err);
            Cookies.remove("token");
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
