"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CarFront, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Form şeması ve doğrulama (validation)
const formSchema = z.object({
    email: z.string().min(1, { message: "Email gereklidir." }).email({ message: "Geçerli bir email adresi giriniz." }),
    password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
});

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            // Backend JWT token login isteği
            const response = await apiClient.post("/Auth/login", {
                email: values.email,
                password: values.password,
            });

            const data = response.data;
            if (data.success && data.data?.token) {
                // Token'ı store'a kaydet (Bu da decode işlemi yapıp User verisini çıkartacak, AuthStore'u tetikleyecek)
                login(data.data.token, {
                    id: "",
                    firstName: "",
                    lastName: "",
                    email: values.email,
                    roles: [],
                    tenantId: "",
                });

                // checkAuth layout'ta tetiklenecek şekilde ayarlandığı için yönlendirmeyi yapıyoruz
                toast.success("Giriş başarılı! Yönlendiriliyorsunuz...", { icon: "👋" });
                router.push("/dashboard");
            } else {
                toast.error("Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin.");
            }
        } catch (error: any) {
            toast.error(error.message || "Giriş yaparken bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 z-0 h-full w-full bg-size-[16px_16px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"></div>

            <div className="z-10 w-full max-w-md">
                <div className="mb-8 flex flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl mb-4 shadow-blue-600/20">
                        <CarFront size={32} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">OtoAjandam</h1>
                    <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400">Servis kayıtlarınızı dijitalde, güvenle yönetin.</p>
                </div>

                <Card className="w-full border-zinc-200/50 shadow-xl shadow-zinc-200/40 backdrop-blur-sm dark:border-zinc-800/50 dark:shadow-none dark:bg-zinc-900/80">
                    <CardHeader>
                        <CardTitle className="text-xl">Oturum Aç</CardTitle>
                        <CardDescription>
                            İşletme hesabınıza giriş yapmak için bilgilerinizi girin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Adresi</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="ornek@servis.com"
                                                    autoComplete="email"
                                                    className="h-11 bg-white dark:bg-zinc-950"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Şifre</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    autoComplete="current-password"
                                                    className="h-11 bg-white dark:bg-zinc-950"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-11 mt-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all font-medium text-[15px]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Giriş Yapılıyor...
                                        </>
                                    ) : (
                                        <>
                                            Giriş Yap
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-800 pt-6">
                        <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                            Henüz OtoAjandam sistemine kayıtlı değil misiniz? <br />
                            <span className="font-semibold text-blue-600 cursor-pointer hover:underline mt-1 inline-block">Bize ulaşın.</span>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
