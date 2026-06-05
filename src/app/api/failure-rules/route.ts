import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { FailureRule } from "@/models/FailureRule";

export async function GET() {
  try {
    await connectToDatabase();
    const rules = await FailureRule.find({}).sort({ key: 1 }).lean();
    return NextResponse.json({ success: true, rules });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { key, enabled, probability } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: "Missing key" }, { status: 400 });
    }

    const rule = await FailureRule.findOneAndUpdate(
      { key },
      {
        ...(enabled !== undefined && { enabled }),
        ...(probability !== undefined && { probability: Number(probability) }),
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
