import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { addPaymentProcessingJob } from "@/queues/producers";

function generateOrderNumber() {
  return `SF-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      customer: body.customer,

      items: body.items,

      subtotal: body.subtotal,

      deliveryFee: 10,

      total: body.subtotal + 10,

      status: "pending_payment",

      timeline: [
        {
          type: "order_created",
          message: "Order created",
          timestamp: new Date(),
        },
      ],
    });

    await addPaymentProcessingJob(order._id.toString());

    return NextResponse.json({
      success: true,
      orderId: order._id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 },
    );
  }
}
