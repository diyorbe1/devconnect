'use client';
import { CardHeader, Card, CardAction, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
export default function Home() {
  return (
    <div className="p-7">
      <h1 className="text-3xl font-bold" style={{textAlign:"center"}}>Welcome to DevConnect!</h1>
      <p style={{textAlign:"center"}}>Keling, dasturchilar jamiyatini quraylik!</p>
      <div>
        <Card className={"mt-5 p-6 border border-gray-300 hover:border-blue-500 shadow-lg rounded-4xl"}>
          <Link href="/playground"><CardHeader>
            <h2 className="text-2xl font-bold text-center">
              Playground
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-center font-bold font-gray-500">Discover new tools and resources for developers.</p>
          </CardContent>
          <CardFooter className={"flex justify-center w-full"}>
            <Button >Explore</Button>
          </CardFooter>
          </Link>
          <Dialog >
            <DialogTrigger asChild>
              <Button  variant="outline">Share idea</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Share your ideas</DialogTitle>
              <DialogDescription>
                We value your feedback and suggestions.
              </DialogDescription>
              <DialogFooter>
                <DialogClose><Button variant="outline">Close</Button></DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
        
      </div>
    </div>
  );
}
