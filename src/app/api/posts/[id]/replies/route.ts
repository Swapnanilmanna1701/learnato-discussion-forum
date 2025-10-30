import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, replies } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate id is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid post ID is required',
          code: 'INVALID_POST_ID'
        },
        { status: 400 }
      );
    }

    const postId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { content, author, parentReplyId } = body;

    // Validate required fields
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Content is required and must not be empty',
          code: 'MISSING_CONTENT'
        },
        { status: 400 }
      );
    }

    if (!author || typeof author !== 'string' || author.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Author is required and must not be empty',
          code: 'MISSING_AUTHOR'
        },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await db.select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // If parentReplyId is provided, validate it exists and belongs to the same post
    if (parentReplyId !== undefined && parentReplyId !== null) {
      if (isNaN(parseInt(parentReplyId))) {
        return NextResponse.json(
          { 
            error: 'Invalid parent reply ID',
            code: 'INVALID_PARENT_REPLY_ID'
          },
          { status: 400 }
        );
      }

      const parentReply = await db.select()
        .from(replies)
        .where(eq(replies.id, parseInt(parentReplyId)))
        .limit(1);

      if (parentReply.length === 0) {
        return NextResponse.json(
          { 
            error: 'Parent reply not found',
            code: 'PARENT_REPLY_NOT_FOUND'
          },
          { status: 404 }
        );
      }

      // Verify parent reply belongs to the same post
      if (parentReply[0].postId !== postId) {
        return NextResponse.json(
          { 
            error: 'Parent reply does not belong to this post',
            code: 'PARENT_REPLY_MISMATCH'
          },
          { status: 400 }
        );
      }
    }

    // Create the reply
    const now = new Date().toISOString();
    const newReply = await db.insert(replies)
      .values({
        postId,
        content: content.trim(),
        author: author.trim(),
        upvotes: 0,
        parentReplyId: parentReplyId ? parseInt(parentReplyId) : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newReply[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}