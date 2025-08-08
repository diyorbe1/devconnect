'use client' // for Next.js App Router

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/AuthProvider'

export default function SessionInfo() {
    const router = useRouter();
  const [session, setSession] = useState(null)

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!error && data.session) {
        setSession(data.session);
      } else {
        console.error("Error:", error);
        router.push('/login'); // Agar sessiya bo'lmasa, login sahifasiga yo'naltirish
      }
    }

    getSession()
  }, [router])

  if (!session) return null;

  return (
    <div className='p-5 max-w-lg mx-auto mt-8 flex flex-col gap-2 justify-center items-center'>
      <Card className='flex flex-col items-center gap-3 bg-neutral-100 dark:bg-zinc-800 p-5 rounded-lg shadow-md'>
        <Avatar className={"w-36 h-36"}>
        <AvatarImage src="https://github.com/shadcn.png" alt="" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <h2 className='text-lg font-bold'>{session.user.email}</h2>
      </Card>
      <div className='w-full'>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
                <CardHeader>
                    <CardTitle>Profile information</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        <p>Email: {session.user.email}</p>
                    </CardDescription>
                </CardContent>
            </Card>
            
          </TabsContent>
          <TabsContent value="settings">
            <Card>
                <CardHeader>
                    <CardTitle>Profile information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                value={session.user.email}
                            />
                        </div>
                        <Button type="submit">Save changes</Button>
                    </form>
                                   </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
