// app/signup/page.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // Xatolarni saqlash uchun state
    const router = useRouter(); // router hookini ishlatamiz

    const handleSignUp = async (e) => {
        e.preventDefault(); // Sahifaning qayta yuklanishini oldini oladi
        setError(null); // Eski xatolarni tozalash

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            setError(error.message); // Xatoni statega saqlash
        } else {
            
            // Muvaffaqiyatli ro'yxatdan o'tganda foydalanuvchini yo'naltirish
            // Eslatma: Supabase email tasdiqlash uchun xabar yuboradi.
            // Buni hisobga olgan holda foydalanuvchiga xabar berish yaxshiroq.
            router.push('/check-email'); // Masalan, emailni tekshirish sahifasiga yo'naltiramiz
        }
    };
    
    // Sizning kodingizda bor bo'lgan, lekin bu yerda to'g'ri ishlashi uchun
    // qandaydir provayderlar orqali kirish funksiyasi.
    async function signInWithProvider(provider) {
      // Hozircha bu funksiyani shunday qoldiramiz, keyinroq tushuntiraman.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider
      })
    }

    return (
        <form onSubmit={handleSignUp} className="p-7 max-w-md mx-auto rounded-lg shadow-lg mt-10 flex flex-col gap-3">
            <Label htmlFor="email">Email:</Label>
            <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email} // state bilan bog'lash
                onChange={(e) => setEmail(e.target.value)} // o'zgarishlarni kuzatish
            />
            <Label htmlFor="password">Password:</Label>
            <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password} // state bilan bog'lash
                onChange={(e) => setPassword(e.target.value)} // o'zgarishlarni kuzatish
            />

            {error && <p className="text-red-500 text-sm">{error}</p>} {/* Xatolarni ko'rsatish */}

            <Button type="submit">Ro'yxatdan o'tish</Button>

            <div className="flex flex-col gap-2 mt-4">
                <Button variant='outline' onClick={() => signInWithProvider("google")}>Continue with Google</Button>
                <Button variant='outline' onClick={() => signInWithProvider("github")}>Continue with Github</Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
                Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
            </p>
        </form>
    );
}