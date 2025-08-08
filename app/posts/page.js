'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ArrowRight, LayoutGrid, LayoutList } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'grid' yoki 'list'
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, title, content, created_at,
          user_id (
            full_name,
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (!error) setPosts(data);
      else console.error(error);
    };

    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .subscribe();

    fetchPosts();

    return () => supabase.removeChannel(subscription);
  }, []);

  // Keyboard nav
//   useEffect(() => {
//     const handleKey = (e) => {
//       if (e.ctrlKey && e.key === 'ArrowRight') router.push('/posts/new');
//       if (e.ctrlKey && e.key === 'ArrowLeft') router.push('/');
//     };
//     window.addEventListener('keydown', handleKey);
//     return () => window.removeEventListener('keydown', handleKey);
//   }, [router]);

  // Style for container based on view mode
  const containerClasses =
    viewMode === 'grid'
      ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
      : 'flex flex-col gap-4';

  // Card style based on view mode
  const cardClasses =
    viewMode === 'grid'
      ? 'group cursor-pointer border border-gray-200 hover:border-blue-500 transition-all duration-300 rounded-3xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
      : 'group cursor-pointer border border-gray-200 hover:border-blue-500 transition-all duration-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-row items-center gap-5 p-5';

  return (
    <div className="min-h-screen bg-gray-50 py-15">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with arrange buttons */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
            <p className="text-gray-600 text-sm">All recent posts</p>
          </div>

          {/* Arrange buttons */}
          <div className="flex items-center space-x-2" role="group" aria-label="View mode toggle">
            <button
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`p-2 rounded-md border ${
                viewMode === 'grid' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              title="Grid View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`p-2 rounded-md border ${
                viewMode === 'list' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              title="List View"
            >
              <LayoutList className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Posts Container */}
        <div className={containerClasses}>
          <AnimatePresence initial={false}>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card
                  onClick={() => router.push(`/posts/${post.id}`)}
                  className={cardClasses}
                  tabIndex={0}
                  role="button"
                  aria-label={`View post titled ${post.title}`}
                >
                  {/* Card content differs by view */}
                  {viewMode === 'grid' ? (
                    <>
                      <CardHeader className="p-5 border-b border-gray-100">
                        <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                          {post.title}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </div>
                      </CardHeader>

                      <CardContent className="p-5">
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                          {post.content}
                        </p>
                      </CardContent>

                      <CardFooter onClick={() => router.push(`/posts/${post.user_id?.username}`)} className="p-5 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3" onClick={(e) => {
      e.stopPropagation(); // ichki onClick tashqi onClickni to‘xtatadi
      router.push(`/posters/${post.user_id?.username}`);
    }}>
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_id?.full_name)}`}
                              alt={post.user_id?.full_name}
                            />
                            <AvatarFallback>
                              {post.user_id?.full_name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{post.user_id?.full_name}</p>
                            
                                <Link href={`/posters/${post.user_id?.username}`} className="text-xs text-blue-600 underline">
  @{post.user_id?.username}
</Link>

                            
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </CardFooter>
                    </>
                  ) : (
                    <>
                      {/* LIST VIEW */}
                      <div  className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="text-gray-700 text-sm mt-1 line-clamp-2">{post.content}</p>
                        <div onClick={(e) => {
      e.stopPropagation(); // ichki onClick tashqi onClickni to‘xtatadi
      router.push(`/posters/${post.user_id?.username}`)}} className="flex items-center gap-3 mt-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_id?.full_name)}`}
                              alt={post.user_id?.full_name}
                            />
                            <AvatarFallback>
                              {post.user_id?.full_name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{post.user_id?.full_name}</p>
                            <Link href={"/posters/" + post.user_id?.username} className="text-xs text-blue-500 underline">@{post.user_id?.username}</Link>
                          </div>
                          <div className="ml-auto flex items-center gap-1 text-gray-500 text-xs whitespace-nowrap">
                            <Clock className="w-4 h-4" aria-hidden="true" />
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No posts available.
          </div>
        )}
      </div>
    </div>
  );
}
