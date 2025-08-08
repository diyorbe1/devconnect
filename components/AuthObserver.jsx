// components/AuthObserver.jsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthObserver() {
    const router = useRouter();

    useEffect(() => {
        // Bu funksiya URL'dagi hash (#) ichidagi ma'lumotlarni ajratib oladi
        const handleAuthCallback = async () => {
            const hash = window.location.hash;
            if (hash) {
                const params = new URLSearchParams(hash.substring(1));
                const accessToken = params.get('access_token');
                
                // Agar access token mavjud bo'lsa
                if (accessToken) {
                    const { data: { user } } = await supabase.auth.getUser();
                    
                    // Agar foydalanuvchi sessiyasi mavjud bo'lsa
                    if (user) {
                        // Foydalanuvchi profilini public.users jadvalida qidirish
                        const { data: profile, error } = await supabase
                            .from('users')
                            .select('*')
                            .eq('id', user.id)
                            .single();
                        
                        // Agar profil mavjud bo'lmasa, uni yaratish
                        if (error && error.code === 'PGRST116') {
                            await supabase.from('users').insert({
                                id: user.id,
                                email: user.email
                            });
                        }
                        
                        // To'g'ri sahifaga yo'naltirish va URL'dan tokenni tozalash
                        router.replace('/profile'); 
                    }
                }
            }
        };

        handleAuthCallback();
    }, [router]);

    return null; // Bu komponent ekranda hech narsa ko'rsatmaydi
}