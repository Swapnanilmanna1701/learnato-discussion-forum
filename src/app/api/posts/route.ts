import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const sort = searchParams.get('sort') ?? 'date';
    const order = searchParams.get('order') ?? 'desc';

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: 'Invalid limit parameter',
        code: 'INVALID_LIMIT' 
      }, { status: 400 });
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: 'Invalid offset parameter',
        code: 'INVALID_OFFSET' 
      }, { status: 400 });
    }

    if (!['date', 'upvotes'].includes(sort)) {
      return NextResponse.json({ 
        error: 'Invalid sort parameter. Must be "date" or "upvotes"',
        code: 'INVALID_SORT' 
      }, { status: 400 });
    }

    if (!['asc', 'desc'].includes(order)) {
      return NextResponse.json({ 
        error: 'Invalid order parameter. Must be "asc" or "desc"',
        code: 'INVALID_ORDER' 
      }, { status: 400 });
    }

    let query = db.select().from(posts);

    const sortField = sort === 'date' ? posts.createdAt : posts.upvotes;
    const orderFn = order === 'asc' ? asc : desc;

    const results = await query
      .orderBy(orderFn(sortField))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized - please sign in to create posts',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ 
        error: 'Title is required and must not be empty',
        code: 'MISSING_TITLE' 
      }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ 
        error: 'Content is required and must not be empty',
        code: 'MISSING_CONTENT' 
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const newPost = await db.insert(posts)
      .values({
        title: title.trim(),
        content: content.trim(),
        author: session.user.name,
        userId: session.user.id,
        upvotes: 0,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newPost[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}