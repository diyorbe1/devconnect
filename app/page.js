// app/page.js
'use client';
import { CardHeader, Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      // API'dan ma'lumotlarni olish
      const response = await fetch("/api/posts");
      const data = await response.json();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
    <div className="p-7 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Welcome to DevConnect!</h1>
      <p className="text-center mt-2 text-lg">Keling, dasturchilar jamiyatini quraylik!</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Playground bo'limi */}
        <Card className="p-6 border border-gray-300 hover:border-blue-500 hover:shadow-xl transition-shadow duration-300 rounded-3xl">
          <Link href="/playground">
            <CardHeader>
              <h2 className="text-2xl font-bold text-center">Playground</h2>
            </CardHeader>
            <CardContent>
              <p className="text-center font-semibold text-gray-500">Discover new tools and resources for developers.</p>
            </CardContent>
            <CardFooter className="flex justify-center w-full mt-4">
              <Button>Explore</Button>
            </CardFooter>
          </Link>
        </Card>
        
        {/* Fikr almashish uchun Dialog */}
        <Card className="p-6 border border-gray-300 hover:border-blue-500 hover:shadow-xl transition-shadow duration-300 rounded-3xl flex flex-col justify-between">
          <div>
            <CardHeader>
              <h2 className="text-2xl font-bold text-center">Fikr almashish</h2>
            </CardHeader>
            <CardContent>
              <p className="text-center font-semibold text-gray-500">Oʻz gʻoyalaringiz va takliflaringiz bilan oʻrtoqlashing.</p>
            </CardContent>
          </div>
          <CardFooter className="flex justify-center w-full mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Gʻoya bilan oʻrtoqlashish</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogTitle>Gʻoyalaringizni oʻrtoqlashing</DialogTitle>
                <DialogDescription>Sizning fikrlaringiz biz uchun juda qadrli.</DialogDescription>
                <div className="p-4"><p>Bu joyga g'oyangizni kiritishingiz mumkin.</p></div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Yopish</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">So'nggi postlar</h2>
        <ScrollArea className="h-[350px] w-full rounded-md border p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow duration-200 rounded-xl">
                  <CardHeader>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{post.content}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" className="p-0">Koʻproq bilish</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p>Postlar yuklanmoqda...</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}