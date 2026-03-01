import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5158/api";

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Her istekte Auth Token ekle
apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: 401 hatalarında login'e yönlendir, genel hataları bas
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove("token");
            // Sıklıkla client-side history değişimiyle veya direkt window.location ile çözülür. 
            // Sunucu tarafında patlarsa layout bunu halledebilir, şimdilik browser bazlı atalım.
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }

        // Uygulamanın Backend yapısı (ApiResponse) üzerinden dönen özel hatalar
        const customMessage = error.response?.data?.message;
        if (customMessage) {
            return Promise.reject(new Error(customMessage));
        }

        return Promise.reject(error);
    }
);

export default apiClient;
