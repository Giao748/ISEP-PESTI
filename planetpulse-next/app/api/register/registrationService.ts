import { NextResponse } from "next/server";
import { createPool } from "mysql2/promise";

const pool = createPool({
  host: "localhost",
  user: "root",
  password: "Setamurcha12!",
  database: "PlanetPulse",
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { username, email, password, nationality, role } = data;

    const Role = role || "Member"; // Default to "Member" if no role is provided
    if (!username || !email || !password || !nationality ) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        role ENUM('Admin', 'Validator', 'Member') DEFAULT 'Member',
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS members (
        id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO users (username, email, password, role) 
      VALUES (?, ?, ?, ?);
      INSERT INTO members (username, email, password, nationality, role)
      VALUES (?, ?, ?, ?, ?)`,
      [username, email, password, nationality, role]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DB error:", error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Duplicate entry')) {
        return NextResponse.json(
          { success: false, error: "Email already exists" },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}