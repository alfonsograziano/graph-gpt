import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getConnectionStatus } from "@/lib/database";
import { withErrorHandling, logger } from "@/utils/errorHandler";

const healthCheck = async (request: NextRequest): Promise<NextResponse> => {
  logger.info("Health check requested", { url: request.url });

  try {
    // Test database connection
    await connectToDatabase();
    const isConnected = getConnectionStatus();

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: isConnected,
        status: isConnected ? "connected" : "disconnected",
      },
      environment: process.env.NODE_ENV || "development",
    };

    logger.info("Health check completed", health);

    return NextResponse.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error("Health check failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Health check failed",
        data: {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          database: {
            connected: false,
            status: "error",
          },
          environment: process.env.NODE_ENV || "development",
        },
      },
      { status: 503 }
    );
  }
};

export const GET = withErrorHandling(healthCheck);
