import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { replies } from '@/db/schema';
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

    const replyId = parseInt(id);

    // Check if reply exists
    const existingReply = await db.select()
      .from(replies)
      .where(eq(replies.id, replyId))
      .limit(1);

    if (existingReply.length === 0) {
      return NextResponse.json(
        { 
          error: 'Reply not found',
          code: 'REPLY_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const currentReply = existingReply[0];
    const currentUpvotes = currentReply.upvotes;

    // Increment upvotes
    const updatedReply = await db.update(replies)
      .set({
        upvotes: currentUpvotes + 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(replies.id, replyId))
      .returning();

    return NextResponse.json(updatedReply[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}