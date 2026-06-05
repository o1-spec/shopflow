import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { addPaymentProcessingJob } from "@/queues/producers";

const MOCK_CUSTOMERS = [
  { name: "John Doe", email: "john.doe@acme.corp" },
  { name: "Jane Smith", email: "jane.smith@globex.io" },
  { name: "Alice Johnson", email: "alice.j@skynet.com" },
  { name: "Bob Miller", email: "bob.miller@initech.org" },
  { name: "Charlie Green", email: "charlie.g@umbrella.net" },
  { name: "Diana Prince", email: "diana@wayne.co" },
  { name: "Bruce Wayne", email: "bruce@wayne.co" },
];

function generateOrderNumber() {
  return `SF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const count = Math.min(Math.max(Number(body.count) || 1, 1), 20);

    const products = await Product.find({ status: "active" }).lean();
    if (products.length === 0) {
      return NextResponse.json({ success: false, error: "No active products in database. Run seed first." }, { status: 400 });
    }

    const createdOrderIds = [];

    for (let i = 0; i < count; i++) {
      // Pick random customer
      const customer = MOCK_CUSTOMERS[Math.floor(Math.random() * MOCK_CUSTOMERS.length)];
      
      // Pick 1 to 3 random products
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numProducts);

      const items = selected.map((p: any) => ({
        productId: p._id,
        name: p.name,
        quantity: Math.floor(Math.random() * 2) + 1,
        price: p.price,
      }));

      const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
      const deliveryFee = 10;
      const total = subtotal + deliveryFee;

      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        customer,
        items,
        subtotal,
        deliveryFee,
        total,
        status: "pending_payment",
        timeline: [
          {
            type: "order_created",
            message: "Order created via load generator",
            timestamp: new Date(),
          },
        ],
      });

      await addPaymentProcessingJob(order._id.toString());
      createdOrderIds.push(order._id);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${count} mock orders.`,
      orderIds: createdOrderIds,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
