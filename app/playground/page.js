// app/playground/page.js
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from '@/components/AuthProvider';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function PlaygroundPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [globalBoards, setGlobalBoards] = useState([]);
  const [myBoards, setMyBoards] = useState([]);

  const fetchBoards = async () => {
    const userId = session?.user?.id;

    // Global boards (ommaviy taxtalar)ni olish
    const { data: globalData, error: globalError } = await supabase
      .from('boards')
      .select(`
        *,
        blocks (id, content, type)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (globalError) console.error('Error fetching global boards:', globalError);
    else setGlobalBoards(globalData || []);

    // Mening shaxsiy boards'larimni olish (agar foydalanuvchi tizimda bo'lsa)
    if (userId) {
      const { data: myData, error: myError } = await supabase
        .from('boards')
        .select(`
          *,
          blocks (id, content, type)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (myError) console.error('Error fetching my boards:', myError);
      else setMyBoards(myData || []);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [session]);

  const handleCreateNewBoard = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    const { error } = await supabase
      .from('boards')
      .insert({
        title: "New Project Board",
        user_id: session.user.id,
        is_public: false
      });

    if (error) {
      console.error("Error creating new board:", error);
    } else {
      fetchBoards(); // Taxtani yangilab olish
    }
  };

  const renderBoard = (board) => (
    <Card key={board.id} onClick={() => router.push(`/playground/${board.id}`)} className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle>{board.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-2">
          {board.blocks.length} {board.blocks.length === 1 ? 'block' : 'blocks'}
        </p>
        <div className="flex flex-wrap gap-2">
          {board.blocks.slice(0, 5).map(block => (
            <span key={block.id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {block.type}
            </span>
          ))}
          {board.blocks.length > 5 && (
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
              + {board.blocks.length - 5} more
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Playground</h1>

      {/* Mening loyihalarim */}
      {session && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">My Playground</h2>
            <Button onClick={handleCreateNewBoard}>
              <Plus className="h-4 w-4 mr-2" />
              Create Board
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myBoards.length > 0 ? myBoards.map(renderBoard) : (
              <p className="text-gray-500">You don't have any project boards yet.</p>
            )}
          </div>
        </section>
      )}

      {/* Global loyihalar */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Global Playground</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {globalBoards.length > 0 ? globalBoards.map(renderBoard) : (
            <p className="text-gray-500">No public project boards available.</p>
          )}
        </div>
      </section>
    </div>
  );
}