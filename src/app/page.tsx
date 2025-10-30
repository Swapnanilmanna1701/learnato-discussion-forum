"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, ArrowUp, Plus, Search, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { toast } from "sonner";

type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
};

export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Create post form state
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAuthor, setNewPostAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [sortBy, sortOrder]);

  // Real-time updates
  useRealtimeUpdates({
    endpoint: `/api/posts?sort=${sortBy}&order=${sortOrder}`,
    interval: 5000,
    onUpdate: (newData) => {
      const oldCount = posts.length;
      const newCount = newData.length;
      
      if (newCount > oldCount) {
        toast.success("New posts available!", {
          description: `${newCount - oldCount} new post${newCount - oldCount > 1 ? 's' : ''} added`,
        });
      }
      
      setPosts(newData);
    },
    enabled: !loading && !isCreateDialogOpen,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?sort=${sortBy}&order=${sortOrder}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostAuthor.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          author: newPostAuthor,
        }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      // Reset form and close dialog
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostAuthor("");
      setIsCreateDialogOpen(false);
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (postId: number) => {
    try {
      const response = await fetch(`/api/posts/${postId}/upvote`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to upvote post");

      // Update local state optimistically
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
      ));
    } catch (error) {
      console.error("Error upvoting post:", error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Discussion Forum</h1>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                  <DialogDescription>
                    Share your thoughts with the community
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Your Name</Label>
                    <Input
                      id="author"
                      placeholder="Enter your name"
                      value={newPostAuthor}
                      onChange={(e) => setNewPostAuthor(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="What's your post about?"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Share your thoughts..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={6}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Post"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Sort Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="upvotes">By Upvotes</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No posts found matching your search" : "No posts yet. Be the first to create one!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {/* Upvote Button */}
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpvote(post.id)}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                      <span className="text-sm font-semibold">{post.upvotes}</span>
                    </div>
                    
                    {/* Post Info */}
                    <div className="flex-1">
                      <Link href={`/posts/${post.id}`}>
                        <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                          {post.title}
                        </CardTitle>
                      </Link>
                      <CardDescription className="mt-1">
                        by {post.author} • {formatDate(post.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">
                    {post.content}
                  </p>
                  <div className="mt-4">
                    <Link href={`/posts/${post.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        View Discussion
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}