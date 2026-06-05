import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { WorkerHeartbeat } from "@/models/WorkerHeartbeat";
import { JobEvent } from "@/models/JobEvent";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch worker heartbeats
    const heartbeats = await WorkerHeartbeat.find({})
      .sort({ queueName: 1 })
      .lean();

    // Fetch recent events (last 15)
    const recentEvents = await JobEvent.find({})
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    return NextResponse.json({
      success: true,
      heartbeats,
      recentEvents,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
