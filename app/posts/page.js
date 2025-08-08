'use client';
import {AuthProvider} from '@/components/AuthProvider';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import * as react from "react";
import {useRouter} from 'next/navigation';
const { useState, useEffect } = react;
export default function PostsPage(){

    const [posts, setPosts] = useState([]);
    const Router = useRouter();
    useEffect(()=> {
        const fetchPosts = async()=>{
            const { data, error } = await supabase
                .from('posts')
                .select("*")
            if (!error){
                setPosts(data);
            }else{
                console.log("error:", error)
            }
        }
        fetchPosts();
    }, []); 
    return(
        <div className='p-5 flex flex-col gap-2'>
            {posts.map((post) => (
                        <Card key={post.id} onClick={()=> Router.push('/posts/'+post.id)} className='cursor-pointer hover:shadow-lg transition-shadow duration-200'>
                            <CardHeader>{post.title}</CardHeader>
                            <CardContent>
                                <p>{post.content}</p>
                            </CardContent>
                        </Card>
                    ))}
        </div>
    )
}