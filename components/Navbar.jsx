// components/Navbar.jsx
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Home, LogOut, Play, Text, User, UserPlus2, LogIn } from 'lucide-react';
const Navbar = () => {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChange'ni shu yerda ham ishlatamiz
    supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null); // State'ni tozalash
    router.push('/login'); // Kirish sahifasiga yo'naltirish
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white text-black dark:bg-zinc-800 dark:text-white border-b">
      <div className="text-xl font-bold">
        
        <Link href="/">DevConnect</Link>
      </div>

      <NavigationMenu>
        <NavigationMenuList>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Home>Home</Home>
            </NavigationMenuLink>
          </Link>
          <Link href="/posts" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Text>Posts</Text>
            </NavigationMenuLink>
          </Link>
          <Link href="/playground" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Play>Playground</Play>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex gap-2">
        {session ? (
          <>
            <Link href="/profile">
              <Button variant="outline"><User />Profile</Button>
            </Link>
            <Button onClick={handleSignOut}><LogOut />Sign Out</Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline"><LogIn />Login</Button>
            </Link>
            <Link href="/signup">
              <Button><UserPlus2 />Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;