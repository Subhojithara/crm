import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// Define custom error type
interface CustomError extends Error {
  code?: string;
  message: string;
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  console.log("Authenticated user ID:", userId);

  if (!userId) {
    console.error("Authentication failed: User ID not found");
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    let body;
    try {
      body = await req.json();
      console.log("Request Body:", body);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 },
      );
    }

    const {
      companyId,
      clientId,
      items,
      igst,
      cgst,
      sgst,
      totalAmount,
      netAmount,
      paymentStatus,
      paymentMethod,
      amountPaid,
      carId,
    } = body;

    // Validate input
    if (
      !companyId ||
      !clientId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.some((item) => !item.productId || !item.quantity) ||
      igst === undefined ||
      cgst === undefined ||
      sgst === undefined ||
      totalAmount === undefined ||
      netAmount === undefined
    ) {
      console.error("Invalid input data:", body);
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 },
      );
    }

    // Optionally, validate if companyId and clientId exist
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    const client = await prisma.customer.findUnique({
      where: { id: clientId },
    });

    if (!company) {
      console.error("Company not found:", companyId);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (!client) {
      console.error("Client not found:", clientId);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Start a transaction
    const result = await prisma.$transaction(
      async (prisma) => {
        console.log("Starting database transaction");

        // Create the InvoiceTable entry first
        const newInvoiceTable = await prisma.invoiceTable.create({
          data: {
            companyId,
            clientId,
            igst: Number(igst),
            cgst: Number(cgst),
            sgst: Number(sgst),
            totalAmount: Number(totalAmount),
            netAmount: Number(netAmount),
            paymentStatus: paymentStatus || "UNPAID",
            paymentMethod: paymentMethod || null,
            amountPaid: Number(amountPaid) || 0,
            userId: userId,
            carId: carId || null,
            invoiceItems: {
              create: items.map((item) => ({
                productId: Number(item.productId),
                productName: item.productName,
                quantity: Number(item.quantity),
                unit: item.unit,
                crateId: item.crateId ? Number(item.crateId) : null,
                crateName: item.crateName,
                crateQuantity: item.crateQuantity
                  ? Number(item.crateQuantity)
                  : null,
                unitPrice: Number(item.price),
                totalPrice: Number(item.price) * Number(item.quantity),
              })),
            },
          },
          include: {
            invoiceItems: true,
            client: true,
            company: true,
          },
        });
        console.log("Created new invoice:", newInvoiceTable);

        // Process product quantities
        await Promise.all(
          items.map(async (item) => {
            const productSelling = await prisma.productSelling.findUnique({
              where: { id: Number(item.productId) },
            });

            if (!productSelling) {
              console.error(`Product with ID ${item.productId} not found`);
              throw new Error(`Product with ID ${item.productId} not found`);
            }

            if (productSelling.quantity < Number(item.quantity)) {
              console.error(
                `Insufficient quantity for product "${productSelling.productPurchaseId}". Available: ${productSelling.quantity}, Requested: ${item.quantity}`,
              );
              throw new Error(
                `Insufficient quantity for product "${productSelling.productPurchaseId}". Available: ${productSelling.quantity}, Requested: ${item.quantity}`,
              );
            }

            await prisma.productSelling.update({
              where: { id: Number(item.productId) },
              data: {
                quantity: {
                  decrement: Number(item.quantity),
                },
              },
            });
            console.log(`Updated quantity for product ID ${item.productId}`);
          }),
        );

        // Process crate quantities
        await Promise.all(
          items
            .filter((item) => item.crateId && item.crateQuantity > 0)
            .map(async (item) => {
              const crate = await prisma.crate.findUnique({
                where: { id: Number(item.crateId) },
              });

              if (!crate) {
                console.error(`Crate with ID ${item.crateId} not found`);
                throw new Error(`Crate with ID ${item.crateId} not found`);
              }

              if (crate.crateQuantity < Number(item.crateQuantity)) {
                console.error(
                  `Insufficient quantity for crate "${crate.crateName}". Available: ${crate.crateQuantity}, Requested: ${item.crateQuantity}`,
                );
                throw new Error(
                  `Insufficient quantity for crate "${crate.crateName}". Available: ${crate.crateQuantity}, Requested: ${item.crateQuantity}`,
                );
              }

              await prisma.crate.update({
                where: { id: Number(item.crateId) },
                data: {
                  crateQuantity: {
                    decrement: Number(item.crateQuantity),
                  },
                },
              });
              console.log(`Updated quantity for crate ID ${item.crateId}`);
            }),
        );

        // Create notifications
        const adminsAndModerators = await prisma.user.findMany({
          where: { role: { in: ["ADMIN", "MODERATOR"] } },
        });
        console.log("Creating notifications for admins and moderators");

        await Promise.all(
          adminsAndModerators.map((user) =>
            prisma.notification.create({
              data: {
                message: `New invoice created with ID: ${newInvoiceTable.id}`,
                type: "new_invoice",
                userId: user.clerkUserId,
              },
            }),
          ),
        );

        console.log("Transaction completed successfully");
        return newInvoiceTable;
      },
      {
        maxWait: 10000, // Maximum time to wait for transaction
        timeout: 20000, // Maximum time for the transaction to complete
      },
    );

    console.log("Invoice created successfully:", result);
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const err = error as CustomError;
    console.error("Error creating InvoiceTable entry:", err);

    // Determine the appropriate error status and message
    let status = 500;
    let message = "An unexpected error occurred while creating the invoice";

    if (err.message.includes("not found")) {
      status = 404;
      message = err.message;
    } else if (err.message.includes("Insufficient quantity")) {
      status = 400;
      message = err.message;
    } else if (err.code === "P2002") {
      status = 409;
      message = "A conflict occurred while creating the invoice";
    }

    return NextResponse.json(
      {
        error: {
          message,
          ...(process.env.NODE_ENV === "development" && {
            detail: err.message,
            stack: err.stack,
          }),
        },
      },
      { status },
    );
  }
}

// GET method to fetch invoices with relations
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const customerId = searchParams.get("customerId");
  const invoiceId = searchParams.get("invoiceId");
  const { userId } = getAuth(req);
  console.log("Authenticated user ID:", userId);

  if (!userId) {
    console.error("Authentication failed: User ID not found");
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    // Fetch the user to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      console.error("User not found for ID:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (invoiceId) {
      console.log("Fetching payments for invoice ID:", invoiceId);
      // Fetch payments for a specific invoice
      const payments = await prisma.payment.findMany({
        where: { invoiceId: Number(invoiceId) },
        orderBy: { paymentDate: "desc" },
      });
      console.log("Found payments:", payments);
      return NextResponse.json(payments, { status: 200 });
    }

    if (id) {
      console.log("Fetching invoice with ID:", id);
      // Fetch a single invoice by ID with relations
      const invoice = await prisma.invoiceTable.findUnique({
        where: { id: Number(id) },
        include: {
          company: true,
          client: true,
          invoiceItems: true,
        },
      });
      if (!invoice) {
        console.error("Invoice not found for ID:", id);
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 },
        );
      }
      console.log("Found invoice:", invoice);
      return NextResponse.json(invoice, { status: 200 });
    }

    if (customerId) {
      console.log("Fetching invoices for customer ID:", customerId);
      // Fetch all invoices for a specific customer
      const invoices = await prisma.invoiceTable.findMany({
        where: { clientId: Number(customerId) },
        include: {
          company: true,
          client: true,
        },
        orderBy: { createdAt: "desc" },
      });
      console.log("Found invoices for customer:", invoices);
      return NextResponse.json(invoices, { status: 200 });
    }

    // Check if the user is an admin, moderator, or member
    console.log("User role:", user.role);
    if (["ADMIN", "MODERATOR", "MEMBER"].includes(user.role)) {
      console.log("Fetching all invoices (admin, moderator, or member)");
      // Fetch all invoices with relations
      const invoices = await prisma.invoiceTable.findMany({
        include: {
          company: true,
          client: true,
        },
        orderBy: { createdAt: "desc" },
      });
      console.log("Found invoices:", invoices);
      return NextResponse.json(invoices, { status: 200 });
    } else {
      console.log("Fetching invoices for user ID:", userId);
      // Fetch invoices for the authenticated user with relations
      const invoices = await prisma.invoiceTable.findMany({
        where: { userId: userId },
        include: {
          company: true,
          client: true,
        },
        orderBy: { createdAt: "desc" },
      });
      console.log("Found invoices for user:", invoices);
      return NextResponse.json(invoices, { status: 200 });
    }
  } catch (error: unknown) {
    const err = error as CustomError;
    console.error("Error fetching invoice(s):", err);
    return NextResponse.json(
      { error: "Failed to fetch invoice(s)" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = getAuth(req);
  console.log("Authenticated user ID:", userId);

  if (!userId) {
    console.error("Authentication failed: User ID not found");
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    console.log("Request Body:", body);
    const {
      id,
      companyId,
      clientId,
      items,
      igst,
      cgst,
      sgst,
      totalAmount,
      netAmount,
    } = body;

    // Validate input
    if (
      typeof id !== "number" ||
      !companyId ||
      !clientId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      igst === undefined ||
      cgst === undefined ||
      sgst === undefined ||
      totalAmount === undefined ||
      netAmount === undefined
    ) {
      console.error("Invalid input data:", body);
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 },
      );
    }

    // Optionally, validate if companyId and clientId exist
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    const client = await prisma.customer.findUnique({
      where: { id: clientId },
    });

    if (!company) {
      console.error("Company not found:", companyId);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (!client) {
      console.error("Client not found:", clientId);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Start a transaction
    const updatedInvoice = await prisma.$transaction(async (prisma) => {
      console.log("Starting database transaction for invoice update");

      // Fetch the existing invoice along with its items
      const existingInvoice = await prisma.invoiceTable.findUnique({
        where: { id: id },
        include: { invoiceItems: true }, // Include related invoiceItems
      });

      if (!existingInvoice) {
        console.error("Invoice not found for ID:", id);
        throw new Error("Invoice not found");
      }

      // 1. Update InvoiceTable data
      console.log("Updating invoice data for ID:", id);
      const updatedInvoice = await prisma.invoiceTable.update({
        where: { id: id },
        data: {
          companyId,
          clientId,
          igst: Number(igst),
          cgst: Number(cgst),
          sgst: Number(sgst),
          totalAmount: Number(totalAmount),
          netAmount: Number(netAmount),
          // ... other fields
        },
      });

      // 2. Manage InvoiceItems: Create, Update, Delete
      console.log("Managing invoice items for invoice ID:", id);
      const existingItemsMap = new Map(
        existingInvoice.invoiceItems.map((item) => [item.productId, item]),
      );

      for (const newItem of items) {
        const existingItem = existingItemsMap.get(newItem.productId);

        if (existingItem) {
          console.log("Updating existing invoice item:", existingItem.id);
          // Update existing InvoiceItem
          await prisma.invoiceItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: Number(newItem.quantity),
              unit: newItem.unit,
              crateId: newItem.crateId ? Number(newItem.crateId) : null,
              crateName: newItem.crateName,
              crateQuantity: newItem.crateQuantity
                ? Number(newItem.crateQuantity)
                : null,
              unitPrice: Number(newItem.price),
              totalPrice: Number(newItem.price) * Number(newItem.quantity),
            },
          });
          existingItemsMap.delete(newItem.productId);
        } else {
          console.log(
            "Creating new invoice item for product ID:",
            newItem.productId,
          );
          // Create new InvoiceItem
          await prisma.invoiceItem.create({
            data: {
              invoiceId: id,
              productId: Number(newItem.productId),
              productName: newItem.productName,
              quantity: Number(newItem.quantity),
              unit: newItem.unit,
              crateId: newItem.crateId ? Number(newItem.crateId) : null,
              crateName: newItem.crateName,
              crateQuantity: newItem.crateQuantity
                ? Number(newItem.crateQuantity)
                : null,
              unitPrice: Number(newItem.price),
              totalPrice: Number(newItem.price) * Number(newItem.quantity),
            },
          });
        }
      }

      // Delete removed InvoiceItems
      console.log("Deleting removed invoice items");
      for (const existingItem of existingItemsMap.values()) {
        await prisma.invoiceItem.delete({
          where: { id: existingItem.id },
        });
      }

      // 3. Adjust Product and Crate Quantities (similar to your existing logic)
      // ... (Your logic to update ProductSelling and Crate quantities) ...

      // ... rest of your transaction logic ...
      console.log("Transaction completed successfully");
      return updatedInvoice;
    });

    console.log("Invoice updated successfully:", updatedInvoice);
    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error: unknown) {
    const err = error as CustomError;
    console.error("Error updating InvoiceTable entry:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update invoice" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { userId } = getAuth(req);
  console.log("Authenticated user ID:", userId);

  if (!userId) {
    console.error("Authentication failed: User ID not found");
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    console.log("Request Body:", body);

    if ("paymentAmount" in body) {
      const { id, paymentAmount, paymentMethod } = body;

      if (
        typeof id !== "number" ||
        typeof paymentAmount !== "number" ||
        paymentAmount <= 0
      ) {
        console.error("Invalid payment data:", body);
        return NextResponse.json(
          { error: "Invalid payment data" },
          { status: 400 },
        );
      }

      const invoice = await prisma.invoiceTable.findUnique({ where: { id } });

      if (!invoice) {
        console.error("Invoice not found for ID:", id);
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 },
        );
      }

      if (invoice.paymentStatus === "PAID") {
        console.warn("Invoice already paid for ID:", id);
        return NextResponse.json(
          { error: "Invoice already paid" },
          { status: 400 },
        );
      }

      if (invoice.amountPaid + paymentAmount > invoice.netAmount) {
        console.error("Payment exceeds net amount for invoice ID:", id);
        return NextResponse.json(
          { error: "Payment exceeds net amount" },
          { status: 400 },
        );
      }

      const updatedInvoice = await prisma.$transaction(async (tx) => {
        console.log("Starting database transaction for payment update");

        const updated = await tx.invoiceTable.update({
          where: { id },
          data: {
            amountPaid: invoice.amountPaid + paymentAmount,
            paymentStatus:
              invoice.amountPaid + paymentAmount >= invoice.netAmount
                ? "PAID"
                : "UNPAID",
            updatedAt: new Date(),
          },
        });
        console.log("Updated invoice for payment:", updated);

        // Create a new payment record
        console.log("Creating new payment record for invoice ID:", id);
        await tx.payment.create({
          data: {
            invoiceId: id,
            amount: paymentAmount,
            paymentMethod: paymentMethod || "Unknown",
            paymentDate: new Date(),
          },
        });

        // Create notification for payment
        const adminsAndModerators = await prisma.user.findMany({
          where: { role: { in: ["ADMIN", "MODERATOR"] } },
        });
        console.log(
          "Creating notifications for admins and moderators about payment",
        );

        for (const user of adminsAndModerators) {
          await prisma.notification.create({
            data: {
              message: `Payment of ${paymentAmount} received for invoice ID: ${id}`,
              type: "new_payment",
              userId: user.clerkUserId,
            },
          });
        }

        console.log("Transaction completed successfully");
        return updated;
      });

      console.log("Invoice updated with payment:", updatedInvoice);
      return NextResponse.json(updatedInvoice, { status: 200 });
    }

    // ... existing PATCH logic for updating invoices
  } catch (error: unknown) {
    const err = error as CustomError;
    console.error("Error updating InvoiceTable entry:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update invoice" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = getAuth(req);
  console.log("Authenticated user ID:", userId);

  if (!userId) {
    console.error("Authentication failed: User ID not found");
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    console.log("Request Body:", body);
    const { id } = body;

    // Validate input
    if (typeof id !== "number") {
      console.error("Invalid invoice ID:", id);
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 },
      );
    }

    // Fetch invoice before deletion for notification
    const invoiceToDelete = await prisma.invoiceTable.findUnique({
      where: { id },
      include: {
        client: true,
        company: true,
      },
    });

    if (!invoiceToDelete) {
      console.error("Invoice not found for ID:", id);
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Start a transaction
    await prisma.$transaction(async (tx) => {
      console.log("Starting database transaction for invoice deletion");

      // Fetch the invoice to get the related InvoiceItems
      const invoice = await tx.invoiceTable.findUnique({
        where: { id },
        include: { invoiceItems: true }, // Include related InvoiceItems
      });

      if (!invoice) {
        console.error("Invoice not found for ID:", id);
        throw new Error("Invoice not found");
      }

      // Iterate over each InvoiceItem to update product and crate quantities
      for (const item of invoice.invoiceItems) {
        // Update product quantity
        console.log(
          "Updating product quantity for product ID:",
          item.productId,
        );
        const productSelling = await tx.productSelling.findUnique({
          where: { id: item.productId },
        });

        if (!productSelling) {
          console.error(`Product with ID ${item.productId} not found`);
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        await tx.productSelling.update({
          where: { id: item.productId },
          data: { quantity: productSelling.quantity + item.quantity },
        });

        // Update crate quantity if crateId is present
        if (item.crateId) {
          console.log("Updating crate quantity for crate ID:", item.crateId);
          const crate = await tx.crate.findUnique({
            where: { id: item.crateId },
          });

          if (!crate) {
            console.error(`Crate with ID ${item.crateId} not found`);
            throw new Error(`Crate with ID ${item.crateId} not found`);
          }

          await tx.crate.update({
            where: { id: item.crateId },
            data: {
              crateQuantity: crate.crateQuantity + (item.crateQuantity || 0),
            },
          });
        }
      }

      // Delete related InvoiceItems first (important due to foreign key constraint)
      console.log("Deleting invoice items for invoice ID:", id);
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      // Delete the invoice
      console.log("Deleting invoice with ID:", id);
      await tx.invoiceTable.delete({
        where: { id },
      });

      console.log("Transaction completed successfully");
    });

    // Create deletion notification
    const adminsAndModerators = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MODERATOR"] } },
    });
    console.log(
      "Creating notifications for admins and moderators about invoice deletion",
    );

    for (const user of adminsAndModerators) {
      await prisma.notification.create({
        data: {
          message: `Invoice deleted with ID: ${id}`,
          type: "delete_invoice",
          userId: user.clerkUserId,
        },
      });
    }

    console.log("Invoice deleted successfully:", id);
    return NextResponse.json(
      { message: "Invoice deleted successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    const err = error as CustomError;
    console.error("Error deleting InvoiceTable entry:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete invoice" },
      { status: 500 },
    );
  }
}
