import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production API domain'ini Next.js rewrites veya image domains için izin ver
  images: {
    domains: ["api-otoajandam.runasp.net"],
  },
  // HTTPS yönlendirmesi production ortamda sunucu tarafında yapılacak
  // (runasp.net zaten HTTPS sağlıyor)
};

export default nextConfig;
