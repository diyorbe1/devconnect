// posts/new/page.js
"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewPostPage() {
    const router = useRouter();
    const { session, loading } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        if (!loading && !session) {
            router.push('/login');
        }
    }, [loading, session, router]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        
        if (!session) {
            console.error("User not authenticated.");
            return;
        }

        const { error } = await supabase
            .from('posts')
            .insert({
                title,
                content,
                user_id: session.user.id,
                category: category,
            });

        if (error) {
            console.error("Error creating post:", error);
        } else {
            router.push('/posts');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!session) {
        return null;
    }

    return (
        <form onSubmit={handleCreatePost} className="p-7 max-w-xl mx-auto rounded-lg shadow-lg mt-10 flex flex-col gap-3">
            <h1 className="text-2xl font-bold">Create New Post</h1>
            <Label htmlFor="title">Post Title:</Label>
            <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <Label htmlFor="content">Post Content:</Label>
            <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-40 p-2 border rounded-md dark:bg-zinc-700"
                required
            />
            <Label htmlFor="category">Category:</Label>
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="w-full">
                    <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="problem-solving">Problem Solving</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Button type="submit">Create Post</Button>
        </form>
    );
}