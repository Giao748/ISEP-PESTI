import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, initializeDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const connection = getDbConnection();
    
    // Initialize database tables
    await initializeDatabase();
    
    // Check if we already have posts
    const [existingPosts] = await connection.execute('SELECT COUNT(*) as count FROM posts');
    const count = (existingPosts as any)[0]?.count || 0;
    
    if (count > 0) {
      return NextResponse.json({ message: 'Posts already exist' });
    }
    
    // Get a user to use as author (or create one if needed)
    const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
    const userId = (users as any[])[0]?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'No users found. Please register first.' }, { status: 400 });
    }
    
    // Sample posts data
    const samplePosts = [
      {
        author_id: userId,
        title: "Amazing Discovery: New Plant Species in Our Campus!",
        content: "During our weekly environmental walk, we discovered a beautiful new plant species growing near the library. This highlights the importance of preserving green spaces in urban areas. We're working on documenting and protecting this area.",
        category: "Good Practice",
        location: "Campus Library",
        tags: "biodiversity, campus, plants, discovery"
      },
      {
        author_id: userId,
        title: "Our Solar Panel Project: Phase 1 Complete!",
        content: "Great news! We've successfully installed the first set of solar panels on the engineering building. This project will reduce our campus carbon footprint by approximately 15%. Next phase: expanding to other buildings!",
        category: "Good Practice",
        location: "Engineering Building",
        tags: "solar, renewable energy, campus, sustainability"
      },
      {
        author_id: userId,
        title: "Innovative Water Recycling System",
        content: "Our team developed a smart water recycling system that can save up to 40% of water consumption in campus buildings. The system uses AI to optimize water usage based on occupancy patterns. Ready for implementation!",
        category: "Good Practice",
        location: "Innovation Lab",
        tags: "water conservation, AI, smart systems, technology"
      },
      {
        author_id: userId,
        title: "Campus Composting Initiative",
        content: "We've started a new composting program that collects food waste from the cafeteria and converts it into nutrient-rich soil for our campus gardens. This reduces waste and creates a circular economy!",
        category: "Good Practice",
        location: "Campus Cafeteria",
        tags: "composting, waste reduction, circular economy, gardens"
      },
      {
        author_id: userId,
        title: "Plastic Pollution in Our Local River",
        content: "We've identified a serious plastic pollution problem in our local river. The water quality is deteriorating due to plastic waste. We need immediate action to clean up and prevent further pollution.",
        category: "Environmental Problem",
        location: "Local River",
        tags: "plastic pollution, water quality, environmental damage"
      },
      {
        author_id: userId,
        title: "Air Quality Issues Near Industrial Area",
        content: "Students have reported respiratory problems due to poor air quality near the industrial area. We need to investigate the sources of pollution and advocate for better environmental regulations.",
        category: "Environmental Problem",
        location: "Industrial Area",
        tags: "air pollution, health, industrial waste"
      }
    ];
    
    // Insert sample posts
    for (const post of samplePosts) {
      await connection.execute(
        `INSERT INTO posts (author_id, title, content, category, location, tags) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [post.author_id, post.title, post.content, post.category, post.location, post.tags]
      );
    }
    
    return NextResponse.json({ 
      message: 'Sample posts created successfully',
      count: samplePosts.length
    });
    
  } catch (error) {
    console.error('Error initializing posts:', error);
    return NextResponse.json(
      { error: 'Failed to initialize posts' },
      { status: 500 }
    );
  }
} 