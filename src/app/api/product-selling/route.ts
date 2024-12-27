import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || !["ADMIN", "MODERATOR"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { productPurchaseId, sellingPrice, unit, quantity } = body;

    // Validate required fields
    if (!productPurchaseId || !sellingPrice || !unit || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if the product purchase is already deducted
    const productPurchase = await prisma.productPurchase.findUnique({
      where: { id: parseInt(productPurchaseId) },
    });

    if (!productPurchase) {
      return NextResponse.json(
        { error: "Product purchase not found" },
        { status: 404 },
      );
    }

    if (productPurchase.status === "deducted") {
      return NextResponse.json(
        { error: "Product purchase is already deducted" },
        { status: 400 },
      );
    }

    // Create a new product selling record
    const productSelling = await prisma.productSelling.create({
      data: {
        productPurchaseId: parseInt(productPurchaseId),
        sellingPrice,
        unit,
        quantity,
        clerkUserId: userId,
      },
    });

    // Update the product purchase status to 'deducted'
    await prisma.productPurchase.update({
      where: { id: parseInt(productPurchaseId) },
      data: { status: "deducted" },
    });

    // Create notification
    const adminsAndModerators = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MODERATOR"] } },
    });

    for (const user of adminsAndModerators) {
      await prisma.notification.create({
        data: {
          message: `New product selling added for productPurchaseId: ${productPurchaseId}`,
          type: "new_product_selling",
          userId: user.clerkUserId,
        },
      });
    }

    return NextResponse.json(
      { message: "Product selling saved successfully", productSelling },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error saving product selling:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || !["ADMIN", "MODERATOR"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const productSellings = await prisma.productSelling.findMany({
      include: {
        productPurchase: true,
      },
    });

    const productSellingsWithProductName = productSellings.map((selling) => ({
      ...selling,
      productName: selling.productPurchase.productName,
    }));

    console.log("Fetched product sellings:", productSellingsWithProductName); // Log the data

    return NextResponse.json(productSellingsWithProductName, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching product sellings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
