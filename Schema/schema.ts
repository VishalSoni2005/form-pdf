import {  z } from "zod";

export const schemaPurchaseItem = z.object({
  itemDescription: z
    .string()
    .min(1, { message: "Item description is required" }),
  purity: z.string().min(1, { message: "Purity is required" }),
  weight: z.coerce
    .number()
    .min(0, { message: "Weight must be a positive number" }),
  ratePerGram: z.coerce
    .number()
    .min(0, { message: "Rate per gram must be a positive number" }),
  amount: z.coerce.number().min(0).optional(),
});

export const schemaForm = z.object({
  // Customer Information
  customerName: z.string().min(1, { message: "Name is required" }),
  contactInfo: z
    .string()
    .min(1, { message: "Contact information is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  // Invoice Details
  invoiceNumber: z.string().min(1, { message: "Invoice number is required" }),
  date: z.date({ required_error: "Date is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
  total_amount: z.number().min(0, { message: "Total amount required" }),
  gst: z.number().optional(),
  makingChargePercentage: z.number().optional(),
  totalmaking_charge: z.number().optional(),

  // Purchase Details
  purchaseItems: z
    .array(schemaPurchaseItem)
    .min(1, { message: "At least one item is required" }),
});


//todo: result is { typescript type } not values of form
export type FormValuesTypes = z.infer<typeof schemaForm>; //* Zod's infer utility to automatically generate a TypeScript type from the given Zod schema
