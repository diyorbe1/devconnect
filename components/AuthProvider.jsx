// components/AuthProvider.jsx
"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';

// 1. AuthContext yaratamiz
const AuthContext = createContext({ session: null, loading: true });

export default function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setLoading(false);
        });

        // Hozirgi sessiyani bir marta tekshirish
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // 2. AuthContext.Provider orqali session va loading holatini butun ilovaga tarqatamiz
    const value = {
        session,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. Foydalanish uchun custom hook yaratamiz
export const useAuth = () => {
    return useContext(AuthContext);
};