import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  orders: defineTable({
    customerName: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    zipCode: v.string(),
    country: v.string(),
    paymentMethod: v.union(v.literal("e-money"), v.literal("cash")),
    items: v.array(v.object({
      id: v.number(),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      image: v.string(),
    })),
    subtotal: v.number(),
    shipping: v.number(),
    tax: v.number(),
    total: v.number(),
    orderId: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    createdAt: v.number(),
  })
    .index("by_orderId", ["orderId"])
    .index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"]),
});