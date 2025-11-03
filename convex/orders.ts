import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Order item schema
const orderItemSchema = v.object({
  id: v.number(),
  name: v.string(),
  price: v.number(),
  quantity: v.number(),
  image: v.string(),
});

// Create order mutation
export const createOrder = mutation({
  args: {
    customerName: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    zipCode: v.string(),
    country: v.string(),
    paymentMethod: v.union(v.literal("e-money"), v.literal("cash")),
    items: v.array(orderItemSchema),
    subtotal: v.number(),
    shipping: v.number(),
    tax: v.number(),
    total: v.number(),
    orderId: v.string(),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    
    return orderId;
  },
});

// Get order by ID
export const getOrder = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("orderId"), args.orderId))
      .first();
    
    return order;
  },
});

// Get all orders (for admin)
export const getAllOrders = query({
  handler: async (ctx) => {
    const orders = await ctx.db
      .query("orders")
      .order("desc")
      .collect();
    
    return orders;
  },
});

// Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("orderId"), args.orderId))
      .first();
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    await ctx.db.patch(order._id, {
      status: args.status,
    });
    
    return order._id;
  },
});