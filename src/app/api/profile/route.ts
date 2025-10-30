import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session using better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { 
          error: 'Unauthorized - please sign in',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Query user table by session user ID
    const userRecord = await db.select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Return user profile without updatedAt field
    const { updatedAt, ...userProfile } = userRecord[0];

    return NextResponse.json(userProfile, { status: 200 });

  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}