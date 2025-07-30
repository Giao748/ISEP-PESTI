import { NextRequest, NextResponse } from "next/server";
import { exportUserData, logGdprProcessing } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    // In a real implementation, you would verify user authentication here
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Export user data for GDPR Article 20 compliance
    const userData = await exportUserData(parseInt(userId));

    // Log the data export operation
    await logGdprProcessing(
      parseInt(userId),
      "export",
      "consent",
      "all_personal_data",
      "GDPR Article 20 data portability request",
      "data_export_api"
    );

    // Set appropriate headers for file download
    const response = NextResponse.json(userData);
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="user_data_${userId}_${new Date().toISOString().split('T')[0]}.json"`
    );
    response.headers.set('Content-Type', 'application/json');

    return response;

  } catch (error) {
    console.error("Data export error:", error);
    
    if (error instanceof Error && error.message === "User not found") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to export user data" },
      { status: 500 }
    );
  }
}