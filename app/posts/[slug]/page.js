'use client';
import { Card,CardHeader, CardContent, CardAction  } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Heart, Share, GitFork, PackageOpen} from 'lucide-react';
import * as react from "react";
const {useState, useEffect} = react;
export default function PostPage({ params }) {
    const [post, setPost] = useState(null);

    const postId = params.slug;
    useEffect(()=>{
        const fetchPost = async ()=>{
            const{data, error} = await supabase
                .from('posts')
                .select('*')
                .eq('id', postId)
                .single();
            if(error){
                console.error("Error fetching post:", error);
            }else{
                setPost(data);
            }
        
        }
        fetchPost();
    }, [params]);
    if (!post) return <div>Yuklanmoqda...</div>;

    return (
        <div className="p-5 max-w-4xl mx-auto">
            <Card className={"bg-neutral-100 flex flex-col shadow-md justify-center items-center"}>
                <CardHeader className="text-2xl font-bold flex-row justify-center">{post.title}</CardHeader>
                <Card>
                    <CardAction className={'p-1  flex flex-row gap-2 justify-center ml-auto mr-auto'}>
                        <Button><Heart /></Button>
                        <Button><Share /></Button>
                        <Button><GitFork /></Button>
                        <Button><PackageOpen /></Button>
                    </CardAction>
                </Card>
                <Card>
                    <CardContent className={'mb-auto mt-auto mr-auto ml-auto'}>
                        <p>{post.content}</p>
                    </CardContent>
                </Card>
            </Card>
        </div>
    )
}