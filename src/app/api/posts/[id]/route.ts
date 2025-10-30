import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, replies } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is present and is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const postId = parseInt(id);

    // Fetch the post by ID
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    // Return 404 if post not found
    if (post.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Fetch all replies for this post, ordered chronologically
    const postReplies = await db
      .select()
      .from(replies)
      .where(eq(replies.postId, postId))
      .orderBy(asc(replies.createdAt));

    // Return post with all its replies
    return NextResponse.json(
      {
        post: post[0],
        replies: postReplies
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}