// app/check-email/page.js
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CheckEmailPage() {
    const router = useRouter();

    useEffect(() => {
        const handleSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            // Agar foydalanuvchi sessiyasi mavjud bo'lsa (ya'ni, magic linkni bosgan bo'lsa)
            if (session) {
                // public.users jadvalida foydalanuvchi profilini qidirish
                const { data: profile, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                // Agar profil mavjud bo'lmasa, uni yaratish
                if (error && error.code === 'PGRST116') { // PGRST116 - "no rows found" degan xato
                    await supabase.from('users').insert({
                        id: session.user.id,
                        email: session.user.email
                    });
                }
                
                router.push('/profile'); // Profil yaratilgandan so'ng, profil sahifasiga o'tkazish
            }
        };

        handleSession();
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <h1 className="text-xl font-bold text-center">Iltimos, emailingizni tasdiqlang.</h1>
        </div>
    );
}