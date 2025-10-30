import { db } from '@/db';
import { posts } from '@/db/schema';

async function main() {
    const samplePosts = [
        {
            title: 'Welcome to the Forum!',
            author: 'Admin',
            content: 'Welcome everyone! Please read our community guidelines: Be respectful, stay on topic, and help each other learn. We\'re excited to build this community together!',
            upvotes: 45,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            title: 'What\'s your favorite framework?',
            author: 'DevUser',
            content: 'I\'ve been exploring different web frameworks lately. Currently loving React and Next.js for the great developer experience. What are you all using for your projects?',
            upvotes: 28,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            title: 'Tips for beginners',
            author: 'ExpertCoder',
            content: 'Starting your coding journey? Here are my top tips: 1) Build projects, not just tutorials. 2) Read documentation. 3) Don\'t be afraid to ask questions. 4) Consistency beats intensity. Keep coding!',
            upvotes: 50,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            title: 'Project showcase thread',
            author: 'Creator',
            content: 'Share what you\'ve been working on! Whether it\'s a small script or a full application, we\'d love to see it. Drop your GitHub links and tell us about your projects.',
            upvotes: 12,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(posts).values(samplePosts);
    
    console.log('✅ Posts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});