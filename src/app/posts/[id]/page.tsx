"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ArrowLeft, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

type Reply = {
  id: number;
  postId: number;
  content: string;
  author: string;
  upvotes: number;
  parentReplyId: number | null;
  createdAt: string;
  updatedAt: string;
};

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reply form state
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPostAndReplies();
    }
  }, [postId]);

  // Real-time updates for replies
  useRealtimeUpdates({
    endpoint: `/api/posts/${postId}`,
    interval: 5000,
    onUpdate: (data) => {
      const oldReplyCount = replies.length;
      const newReplyCount = data.replies.length;
      
      if (newReplyCount > oldReplyCount) {
        toast.success("New replies!", {
          description: `${newReplyCount - oldReplyCount} new repl${newReplyCount - oldReplyCount > 1 ? 'ies' : 'y'} added`,
        });
      }
      
      setPost(data.post);
      setReplies(data.replies);
    },
    enabled: !loading && !isSubmitting,
  });

  const fetchPostAndReplies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      const data = await response.json();
      setPost(data.post);
      setReplies(data.replies);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvotePost = async () => {
    if (!post) return;
    
    try {
      const response = await fetch(`/api/posts/${post.id}/upvote`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to upvote post");

      setPost({ ...post, upvotes: post.upvotes + 1 });
    } catch (error) {
      console.error("Error upvoting post:", error);
    }
  };

  const handleUpvoteReply = async (replyId: number) => {
    try {
      const response = await fetch(`/api/replies/${replyId}/upvote`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to upvote reply");

      setReplies(replies.map(reply =>
        reply.id === replyId ? { ...reply, upvotes: reply.upvotes + 1 } : reply
      ));
    } catch (error) {
      console.error("Error upvoting reply:", error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim() || !replyAuthor.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          author: replyAuthor,
          parentReplyId: replyingTo,
        }),
      });

      if (!response.ok) throw new Error("Failed to create reply");

      const newReply = await response.json();
      setReplies([...replies, newReply]);
      setReplyContent("");
      setReplyAuthor("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error creating reply:", error);
      alert("Failed to create reply");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Build threaded reply structure
  const buildReplyTree = (parentId: number | null = null): Reply[] => {
    return replies
      .filter(reply => reply.parentReplyId === parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const ReplyComponent = ({ reply, depth = 0 }: { reply: Reply; depth?: number }) => {
    const childReplies = buildReplyTree(reply.id);
    const maxDepth = 5;
    const indentClass = depth >= maxDepth ? "" : `ml-${Math.min(depth, 5) * 4}`;

    return (
      <div className={`${depth > 0 ? 'mt-4' : ''}`}>
        <Card className={`${depth > 0 ? 'border-l-2 border-l-primary/20' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUpvoteReply(reply.id)}
                  className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <span className="text-xs font-semibold">{reply.upvotes}</span>
              </div>
              <div className="flex-1">
                <CardDescription className="text-xs">
                  {reply.author} • {formatDate(reply.createdAt)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-8 text-xs"
              onClick={() => {
                setReplyingTo(reply.id);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </CardContent>
        </Card>
        
        {childReplies.length > 0 && (
          <div className={depth < maxDepth ? 'ml-6 mt-2 space-y-2' : 'mt-2 space-y-2'}>
            {childReplies.map((childReply) => (
              <ReplyComponent key={childReply.id} reply={childReply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Forum
              </Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Forum
              </Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Post not found</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const topLevelReplies = buildReplyTree(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Forum
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Post Detail */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleUpvotePost}
                  className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary"
                >
                  <ArrowUp className="h-6 w-6" />
                </Button>
                <span className="text-base font-semibold">{post.upvotes}</span>
              </div>
              
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{post.title}</CardTitle>
                <CardDescription>
                  by {post.author} • {formatDate(post.createdAt)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </CardContent>
        </Card>

        {/* Replies Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-xl font-semibold">
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </h2>
          </div>

          {topLevelReplies.length > 0 ? (
            <div className="space-y-4">
              {topLevelReplies.map((reply) => (
                <ReplyComponent key={reply.id} reply={reply} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No replies yet. Be the first to reply!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reply Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {replyingTo ? 'Reply to comment' : 'Add a Reply'}
            </CardTitle>
            {replyingTo && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Replying to comment
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="h-6 text-xs"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply-author">Your Name</Label>
                <Input
                  id="reply-author"
                  placeholder="Enter your name"
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply-content">Your Reply</Label>
                <Textarea
                  id="reply-content"
                  placeholder="Share your thoughts..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Send className="h-4 w-4" />
                {isSubmitting ? "Posting..." : "Post Reply"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}