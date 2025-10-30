import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
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

    // Fetch current post
    const currentPost = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (currentPost.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const currentUpvotes = currentPost[0].upvotes;

    // Increment upvotes
    const updatedPost = await db
      .update(posts)
      .set({
        upvotes: currentUpvotes + 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(posts.id, postId))
      .returning();

    return NextResponse.json(updatedPost[0], { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}