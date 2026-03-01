"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Car, Wrench, BarChart2, Users, CheckCircle, ChevronDown,
  ArrowRight, Star, Phone, Mail, MapPin, Menu, X,
  Package, CreditCard, Printer, Shield, Zap, Clock,
  CarFront, TrendingUp, Bell, ExternalLink
} from "lucide-react";

// ─── Hook: ScrollSpy animasyon için görünürlük takibi ───────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, isVisible };
}

// ─── Animasyonlu Sayaç ────────────────────────────────────────────────────────
function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useInView();
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 1800;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end]);
  return <span ref={ref}>{count.toLocaleString("tr-TR")}{suffix}</span>;
}

// ─── Özellik Kartı ────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, delay }: {
  icon: any; title: string; desc: string; color: string; delay: number;
}) {
  const { ref, isVisible } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group p-7 rounded-3xl border border-zinc-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500 cursor-default ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={26} />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── ANA BİLEŞEN ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", garage: "", message: "" });
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => setFormSent(true), 600);
  };

  const features = [
    { icon: CarFront, title: "Araç Yönetimi", desc: "Plaka, marka, model ve müşteri ilişkisini tek panelden takip edin. Servis geçmişi anında erişilebilir.", color: "bg-blue-50 text-blue-600", delay: 0 },
    { icon: Wrench, title: "İş Emri (Fiş) Sistemi", desc: "Yeni servis fişi oluşturun, işlem kalemlerini katalogunuzdan seçin, ustalarınıza atayın.", color: "bg-purple-50 text-purple-600", delay: 100 },
    { icon: Package, title: "Katalog ve Envanter", desc: "Yedek parça stoklarını ve hizmet fiyat listenizi dijital ortamda tutun. Otomatik arama ile fişe ekleyin.", color: "bg-amber-50 text-amber-600", delay: 200 },
    { icon: CreditCard, title: "Tahsilat ve Ödeme", desc: "Nakit, kart veya havale ile ödeme alın. Fiş bazında açık hesap ve kalan borcu anlık görün.", color: "bg-emerald-50 text-emerald-600", delay: 300 },
    { icon: Printer, title: "Fiş Yazdırma", desc: "Tek tıkla profesyonel servis fişi çıktısı alın. Müşterinize verin, arşivinizde saklayın.", color: "bg-rose-50 text-rose-600", delay: 400 },
    { icon: BarChart2, title: "Raporlama", desc: "Aylık ciro, giren araç ve ayın ustası istatistiklerini gerçek zamanlı takip edin.", color: "bg-teal-50 text-teal-600", delay: 500 },
  ];

  const heroRef = useInView(0.1);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ─── HEADER ──────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-zinc-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <CarFront size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-zinc-900 tracking-tight">OtoAjandam</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Özellikler", id: "features" },
              { label: "Avantajlar", id: "why" },
              { label: "İletişim", id: "contact" },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Portal Button + Mobile Menu */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-300 hover:shadow-blue-600/40 hover:-translate-y-0.5 hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-linear-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              <ExternalLink size={16} className="relative z-10" />
              <span className="relative z-10">Portala Giriş</span>
            </Link>
            <button
              className="md:hidden p-2 rounded-xl hover:bg-zinc-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-zinc-100 px-6 py-4 space-y-3 animate-in slide-in-from-top duration-200">
            {["features", "why", "contact"].map((id) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left py-2 font-semibold text-zinc-700 hover:text-blue-600 transition-colors capitalize">
                {id === "features" ? "Özellikler" : id === "why" ? "Avantajlar" : "İletişim"}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden bg-linear-to-b from-slate-50 via-blue-50/30 to-white">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 -right-32 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTEgMWg1OHY1OEgxVjF6IiBmaWxsPSIjMDAwMDAwMDUiLz48L2c+PC9zdmc+')] opacity-30" />
        </div>

        <div ref={heroRef.ref} className={`relative z-10 text-center max-w-4xl mx-auto transition-all duration-1000 ${heroRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-full mb-8 shadow-sm">
            <Zap size={14} className="text-blue-500" />
            Türkiye'nin Oto Servis Takip Platformu
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tight leading-[1.05] mb-6">
            Atölyenizi{" "}
            <span className="relative">
              <span className="text-blue-600">Dijital</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M2 6C50 2 150 2 198 6" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            {" "}Çağa<br />Taşıyın
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Araç kabulünden iş emirlerine, tahsilattan raporlamaya kadar tüm süreçleri tek platformda yönetin.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-600/40"
            >
              Hemen Başla
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => scrollTo("features")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-zinc-200 text-zinc-700 font-bold text-lg px-8 py-4 rounded-2xl hover:border-zinc-300 hover:bg-zinc-50 hover:-translate-y-1 transition-all duration-300 shadow-sm"
            >
              Özellikleri Gör
              <ChevronDown size={20} className="animate-bounce" />
            </button>
          </div>
        </div>

        {/* Floating UI Preview */}
        <div className={`relative z-10 mt-16 max-w-5xl mx-auto w-full transition-all duration-1000 delay-300 ${heroRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
          <div className="bg-white rounded-3xl shadow-2xl shadow-zinc-900/10 border border-zinc-100 overflow-hidden">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-5 py-4 bg-zinc-50 border-b border-zinc-100">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="flex-1 mx-4 bg-white rounded-lg h-7 flex items-center px-3 border border-zinc-200">
                <span className="text-xs text-zinc-400 font-mono">app.otoajandam.com</span>
              </div>
            </div>
            {/* Fake Dashboard Preview */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Servis Fişleri", val: "12", color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Aylık Ciro", val: "₺47.500", color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Giren Araç", val: "38", color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Ayın Ustası", val: "Ali U.", color: "text-purple-600", bg: "bg-purple-50" },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-2xl p-4`}>
                  <div className="text-xs font-semibold text-zinc-500 mb-1">{item.label}</div>
                  <div className={`text-2xl font-black ${item.color}`}>{item.val}</div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 space-y-3">
              {["34ABC123 • BMW 3 Serisi • Yağ Değişimi", "06XYZ789 • Toyota Corolla • Fren Balata", "35DEF456 • Honda Civic • Periyodik Bakım"].map((row, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-50 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-zinc-100">
                      <CarFront size={16} className="text-zinc-500" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-700">{row}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">İşlemde</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-400 animate-bounce">
          <span className="text-xs font-medium">Aşağı Kaydır</span>
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { val: 500, suffix: "+", label: "Aktif Atölye" },
            { val: 12000, suffix: "+", label: "Aylık İş Emri" },
            { val: 99, suffix: "%", label: "Memnuniyet" },
            { val: 7, suffix: "/24", label: "Destek" },
          ].map((s) => (
            <div key={s.label} className="group">
              <p className="text-4xl md:text-5xl font-black tracking-tight group-hover:scale-105 transition-transform">
                <AnimatedCounter end={s.val} suffix={s.suffix} />
              </p>
              <p className="text-blue-200 text-sm font-semibold mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-4 py-2 rounded-full mb-4 border border-blue-100">
              <Wrench size={14} /> Tüm Özellikler
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 mb-4">İhtiyacınız Olan Her Şey,<br />Tek Yerde</h2>
            <p className="text-xl text-zinc-500 max-w-xl mx-auto">Kağıt ve deftere veda edin. OtoAjandam ile atölyenizi tamamen dijitalleştirin.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ─── WHY / TESTIMONIAL ────────────────────────────────────────── */}
      <section id="why" className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-emerald-100">
                <Shield size={14} /> Neden OtoAjandam?
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-900 mb-8 leading-tight">Rakiplerden<br />Farklı Olun</h2>
              <div className="space-y-5">
                {[
                  { icon: Clock, text: "Araç kabulünden teslimata kadar her adımı saniyeler içinde tamamlayın." },
                  { icon: TrendingUp, text: "Gerçek zamanlı raporlarla haftalık ve aylık performansınızı anlık takip edin." },
                  { icon: Users, text: "Müşteri ve araç geçmişini kolayca bulun. Sadık müşterilerinizle güçlü ilişki kurun." },
                  { icon: Bell, text: "Ödeme hatırlatmaları ve açık iş uyarıları ile hiçbir işi atlamayın." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <item.icon size={20} />
                    </div>
                    <p className="text-zinc-600 text-lg leading-relaxed font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-5">
              {[
                { name: "Mehmet K.", role: "Oto Servis Sahibi, İstanbul", quote: "Artık kağıt defterim yok. Her şey elimde. Müşterilerim de çok memnun, çünkü geldiklerinde aracının geçmişini anında görüyoruz.", stars: 5 },
                { name: "Fatma Y.", role: "Servis Müdürü, Ankara", quote: "Tahsilat takibi özelliği sayesinde açık hesapları sıfıra indirdim. Aylık ciro raporları da çok işe yarıyor.", stars: 5 },
                { name: "Hasan D.", role: "Lastik & Balata Atölyesi, İzmir", quote: "Kurulumu çok kolaydı. İlk gün kullanmaya başladım. Personelim de hızla adapte oldu.", stars: 5 },
              ].map((t, i) => (
                <div key={i} className="bg-zinc-50 border border-zinc-100 hover:border-blue-200 hover:bg-blue-50/30 rounded-3xl p-6 transition-all duration-300">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-zinc-700 leading-relaxed italic mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 text-sm">{t.name}</p>
                      <p className="text-zinc-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Bugün Başlayın</h2>
          <p className="text-xl text-blue-200 mb-10">30 dakikada atölyeniz için kurulum tamamlanır. Teknik bilgi gerekmez.</p>
          <Link
            href="/login"
            className="group inline-flex items-center gap-3 bg-white text-blue-700 font-black text-xl px-10 py-5 rounded-2xl shadow-2xl hover:bg-blue-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-white/20"
          >
            Ücretsiz Hesap Oluştur
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ─── CONTACT ──────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-indigo-100">
              <Mail size={14} /> İletişim & Başvuru
            </div>
            <h2 className="text-4xl font-black text-zinc-900 mb-4">Sorularınız mı Var?</h2>
            <p className="text-lg text-zinc-500 mb-10">Demo talep edin, destek alın veya firmanız için özel teklif isteyin. Uzman ekibimiz en kısa sürede size ulaşır.</p>
            <div className="space-y-5">
              {[
                { icon: Phone, label: "+90 850 000 0000", sub: "Pazartesi-Cuma, 09:00-18:00" },
                { icon: Mail, label: "destek@otoajandam.com", sub: "7/24 e-posta desteği" },
                { icon: MapPin, label: "Türkiye Geneli", sub: "Bulut tabanlı, her yerden erişim" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-300">
                    <c.icon size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">{c.label}</p>
                    <p className="text-sm text-zinc-400">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8">
            {formSent ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={36} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 mb-2">Başvurunuz Alındı!</h3>
                <p className="text-zinc-500">En geç 1 iş günü içinde sizi arayacağız.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <h3 className="text-xl font-black text-zinc-900 mb-2">Demo Talep Et / Başvur</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ad Soyad *</label>
                    <input
                      required
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                      placeholder="Adınız"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Telefon *</label>
                    <input
                      required
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                      placeholder="05xx xxx xx xx"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">E-posta</label>
                  <input
                    type="email"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="email@ornek.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Atölye / Firma Adı</label>
                  <input
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="Oto Servis Adı"
                    value={formData.garage}
                    onChange={e => setFormData({ ...formData, garage: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mesajınız</label>
                  <textarea
                    rows={4}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
                    placeholder="Demo için uygun zamanınız, özel ihtiyaçlarınız..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  Başvuruyu Gönder
                  <ArrowRight size={20} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-zinc-950 text-white py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-10 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <CarFront size={20} />
              </div>
              <span className="text-xl font-black tracking-tight">OtoAjandam</span>
            </div>
            <p className="text-zinc-400 text-sm text-center">Türkiye genelinde oto servis atölyelerine özel yönetim yazılımı.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
            >
              <ExternalLink size={16} />
              Portala Giriş
            </Link>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} OtoAjandam. Tüm hakları saklıdır.</p>
            <div className="flex gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Gizlilik</a>
              <a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a>
              <a href="#" className="hover:text-white transition-colors">KVKK</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
