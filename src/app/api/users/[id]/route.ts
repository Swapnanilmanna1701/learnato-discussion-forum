import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    const userRecord = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(userRecord[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in to update profile', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Forbidden - you can only update your own profile', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, bio, image } = body;

    const updates: {
      name?: string;
      bio?: string;
      image?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: 'Name must be a string', code: 'INVALID_NAME_TYPE' },
          { status: 400 }
        );
      }

      const trimmedName = name.trim();
      if (trimmedName === '') {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'EMPTY_NAME' },
          { status: 400 }
        );
      }

      updates.name = trimmedName;
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        return NextResponse.json(
          { error: 'Bio must be a string', code: 'INVALID_BIO_TYPE' },
          { status: 400 }
        );
      }

      updates.bio = bio;
    }

    if (image !== undefined) {
      if (typeof image !== 'string') {
        return NextResponse.json(
          { error: 'Image must be a string', code: 'INVALID_IMAGE_TYPE' },
          { status: 400 }
        );
      }

      updates.image = image;
    }

    const updatedUser = await db
      .update(user)
      .set(updates)
      .where(eq(user.id, id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        createdAt: user.createdAt,
      });

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}