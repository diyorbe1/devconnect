'use client';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Card, CardAction, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
export default function PosterPage({ params }) {
  // Agar params.slug string bo‘lsa:
  const posterId = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();
  const [poster, setPoster] = useState(null);

  useEffect(() => {
    const fetchPoster = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", posterId);

      if (!error && data.length > 0) {
        setPoster(data[0]);
      } else {
        setPoster(null);
        if (error) console.log("error", error);
      }
    };

    fetchPoster();
  }, [posterId]);

  if (!poster) return <p>Loading..</p>;

  return (
    <div className="p-6 flex flex-col gap-5 items-center">
      <div className='flex border border-gray-300 hover:border-blue-500 transition-all duration-300 flex-col items-center gap-3 bg-neutral-100 dark:bg-zinc-800 p-5 rounded-lg shadow-md'>
        <Avatar className={"w-36 h-36"}>
        <AvatarImage src="https://github.com/shadcn.png" alt="" />
        <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className="text-xl">{poster.full_name}</h1>

      </div>
        <div className="grid w-full max-w-sm items-center gap-3 bg-neutral-100 dark:bg-zinc-800 p-5 rounded-lg shadow-md">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" value={poster.email} readOnly/>
    </div>
        <div className="grid w-full max-w-sm items-center gap-3 bg-neutral-100 dark:bg-zinc-800 p-5 rounded-lg shadow-md">
      <Label htmlFor="username">Username</Label>
      <Input type="username" id="username" value={`@${poster.username}`} readOnly/>
        </div>
        <div className="grid grid-cols-2 gap-3">
        <Card>
            <CardContent>
                <div>
                    <Label htmlFor="created_at">Joined</Label>
                    <Input type="text" id="created_at" value={new Date(poster.created_at).toLocaleDateString()} readOnly/>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardContent>
                <div>
                    <Label htmlFor="live_url">Live URL</Label>
                    <Input type="text" className={"cursor-pointer underline text-blue-500"} id="live_url" value={poster.live_url} readOnly onClick={()=>router.push(poster.live_url)}/>
                </div>
            </CardContent>
        </Card>
    </div>
    </div>
  );
}