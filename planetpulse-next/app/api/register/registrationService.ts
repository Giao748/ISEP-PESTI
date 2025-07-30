import { NextRequest, NextResponse } from "next/server";
import { 
  getDbConnection, 
  hashPassword, 
  initializeDatabase, 
  logGdprProcessing, 
  recordUserConsent 
} from "@/lib/database";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function POST(req: NextRequest) {
  try {
    // Initialize database tables if they don't exist
    await initializeDatabase();
    
    const data = await req.json();
    const { 
      username, 
      email, 
      password, 
      nationality, 
      role, 
      gdprConsent, 
      dataProcessingConsent, 
      marketingConsent 
    } = data;

    // Validation
    if (!username || !email || !password || !nationality) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // GDPR Consent validation
    if (!gdprConsent) {
      return NextResponse.json(
        { success: false, error: "GDPR consent is required to create an account" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const db = getDbConnection();
    const userRole = role || "Member";

    // Check if user already exists
    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username]
    ) as [RowDataPacket[], any];

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: "Email or username already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Get client IP and User Agent for GDPR logging
    const clientIP = req.headers.get("x-forwarded-for") || 
                    req.headers.get("x-real-ip") || 
                    "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Begin transaction
    await db.execute("START TRANSACTION");

    try {
      // Insert user
      const [userResult] = await db.execute(
        `INSERT INTO users 
         (username, email, password_hash, role, gdpr_consent, gdpr_consent_date, 
          data_processing_consent, marketing_consent) 
         VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [username, email, passwordHash, userRole, gdprConsent, dataProcessingConsent, marketingConsent]
      ) as [ResultSetHeader, any];

      const userId = userResult.insertId;

      // Insert member profile
      await db.execute(
        `INSERT INTO members (user_id, nationality) VALUES (?, ?)`,
        [userId, nationality]
      );

      // Record GDPR consent history
      await recordUserConsent(userId, "gdpr", gdprConsent, clientIP, userAgent);
      await recordUserConsent(userId, "data_processing", dataProcessingConsent || false, clientIP, userAgent);
      await recordUserConsent(userId, "marketing", marketingConsent || false, clientIP, userAgent);

      // Log GDPR processing activity
      await logGdprProcessing(
        userId,
        "create",
        "consent",
        "personal_data,profile_data",
        "User account creation and profile management",
        "registration_system"
      );

      // Commit transaction
      await db.execute("COMMIT");

      return NextResponse.json({ 
        success: true, 
        message: "Account created successfully",
        userId: userId
      });

    } catch (transactionError) {
      // Rollback transaction on error
      await db.execute("ROLLBACK");
      throw transactionError;
    }

  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("Duplicate entry")) {
        return NextResponse.json(
          { success: false, error: "Email or username already exists" },
          { status: 409 }
        );
      }
      
      if (error.message.includes("ENCRYPTION_SECRET")) {
        console.error("Database configuration error:", error.message);
        return NextResponse.json(
          { success: false, error: "Server configuration error" },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}