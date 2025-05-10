"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
// import { z } from "zod";

// ui components ////////////////////////
import {
  CalendarIcon,
  CheckCircle2,
  PlusCircle,
  Trash2,
  Calculator,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
//////////////////////////////////////////////
import generate from "@/lib/action/GeneratePdf";
import {
  type FormValuesTypes,
  schemaForm,
  schemaPurchaseItem,
} from "@/Schema/schema";

//* form schemas
export const purchaseItemSchema = schemaPurchaseItem;
const formSchema = schemaForm;

export default function InvoiceForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [gstIncluded, setGstIncluded] = useState(false);

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [makingCharge, setMakingCharge] = useState<number>(0);

  const [dateSelected, setDateSelected] = useState<boolean>(false);

  //* using useForm hook to access form values and resolver to validate
  const form = useForm<FormValuesTypes>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      contactInfo: "",
      address: "",
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 1000)
      ).padStart(3, "0")}`,
      date: new Date(),
      status: "",
      gst: 0,
      totalmaking_charge: undefined,
      paymentMethod: "",
      total_amount: undefined,
      purchaseItems: [
        {
          itemDescription: "",
          purity: "",
          weight: undefined,
          ratePerGram: undefined,
          amount: undefined,
        },
      ],
    },
  });

  //* feild contains array of object ( purchase items )
  //* append method to add new feild
  //* remove method to remove feild
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "purchaseItems", // unique name of array
  });

  const watchPurchaseItems = form.watch("purchaseItems");

  async function onSubmit(data: FormValuesTypes) {
    setIsSubmitted(true);

    try {
      const pdfBytes = await generate(data);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${data.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log("error occured: ", error);
    } finally {
      setIsSubmitted(false);
    }
  }

  const handleGstChange = (value: string) => {
    form.setValue("gst", 0);
    setGstIncluded(value === "include");
  };

  useEffect(() => {
    const total = watchPurchaseItems.reduce(
      (acc, item) => acc + (item.amount || 0),
      0
    );
    setTotalAmount(total);
  }, [watchPurchaseItems]);

  // Calculate total amount whenever purchase items change, GST selection changes, or making charge changes
  useEffect(() => {
    const itemsTotal = watchPurchaseItems.reduce(
      (acc, item) =>
        acc + (Number.parseFloat(item.amount?.toString() ?? "0") || 0),
      0
    );

    // Add making charge
    let finalTotal = itemsTotal + makingCharge;

    form.setValue("totalmaking_charge", makingCharge);

    // Apply GST 
    if (gstIncluded) {
      const gstAmount = finalTotal * 0.03; // 3% GST
      form.setValue("gst", gstAmount); //! SETVALUE TO SET THE FORM VALUE
      finalTotal += gstAmount;
      form.setValue("total_amount", finalTotal);
      // finalTotal = finalTotal * 1.03; // Adding 3% GST
    }

    setTotalAmount(finalTotal);
  }, [watchPurchaseItems, gstIncluded, makingCharge, form]);
  return (
    <>
      {isSubmitted ? (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 text-lg">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your jewelry invoice has been successfully saved.
          </AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* //! Customer Information */}
        <Card className="mb-8 border-amber-200 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-amber-100 to-amber-50 px-6 py-4">
            <CardTitle className="text-2xl font-serif text-amber-900">
              Customer Information
            </CardTitle>
            <CardDescription className="text-amber-700">
              Enter the customer details for this invoice
            </CardDescription>
          </div>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="customerName"
                  className="text-amber-900 font-medium">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  {...form.register("customerName")}
                  placeholder="Customer name"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                />
                {form.formState.errors.customerName && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.customerName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="contactInfo"
                  className="text-amber-900 font-medium">
                  Contact Information <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactInfo"
                  {...form.register("contactInfo")}
                  placeholder="Phone or email"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                />
                {form.formState.errors.contactInfo && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.contactInfo.message}
                  </p>
                )}
              </div>
            </div>

            {/* //! Address */}

            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-amber-900 font-medium">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                {...form.register("address")}
                placeholder="Full address"
                className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* //! Invoice Details */}

        <Card className="mb-8 border-amber-200 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-amber-100 to-amber-50 px-6 py-4">
            <CardTitle className="text-2xl font-serif text-amber-900">
              Invoice Details
            </CardTitle>
            <CardDescription className="text-amber-700">
              Enter the details of this invoice
            </CardDescription>
          </div>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="invoiceNumber"
                  className="text-amber-900 font-medium">
                  Invoice Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="invoiceNumber"
                  {...form.register("invoiceNumber")}
                  placeholder="INV-0001"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                />
                {form.formState.errors.invoiceNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.invoiceNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="date"
                  className="text-amber-900 font-medium">
                  Date <span className="text-red-500">*</span>
                </Label>

                <Popover
                  open={dateSelected}
                  onOpenChange={setDateSelected}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setDateSelected(!dateSelected)}
                      className={cn(
                        "w-full justify-start text-left font-normal border-amber-200 hover:bg-amber-50 hover:text-amber-900",
                        !form.getValues("date") && "text-muted-foreground"
                      )}>
                      <CalendarIcon className="mr-2 h-4 w-4 text-amber-700" />
                      {form.getValues("date") ? (
                        format(form.getValues("date"), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0 border-amber-200">
                    <Calendar
                      mode="single"
                      selected={form.getValues("date")}
                      onSelect={(date) => {
                        if (date) {
                          form.setValue("date", date);
                          setDateSelected(false);
                        }
                      }}
                      initialFocus
                      className="rounded-md border-amber-200"
                    />
                  </PopoverContent>
                </Popover>

                {form.formState.errors.date && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.date.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-amber-900 font-medium">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  defaultValue={form.getValues("status")}
                  onValueChange={(value) => form.setValue("status", value)}>
                  <SelectTrigger
                    id="status"
                    className="border-amber-200 focus:ring-amber-400">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="border-amber-200">
                    <SelectItem
                      value="Pending"
                      className="text-amber-900 hover:bg-amber-50">
                      Pending
                    </SelectItem>
                    <SelectItem
                      value="Paid"
                      className="text-amber-900 hover:bg-amber-50">
                      Paid
                    </SelectItem>
                    <SelectItem
                      value="Overdue"
                      className="text-amber-900 hover:bg-amber-50">
                      Overdue
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="paymentMethod"
                  className="text-amber-900 font-medium">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Select
                  defaultValue={form.getValues("paymentMethod")}
                  onValueChange={(value) =>
                    form.setValue("paymentMethod", value)
                  }>
                  <SelectTrigger
                    id="paymentMethod"
                    className="border-amber-200 focus:ring-amber-400">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="border-amber-200">
                    <SelectItem
                      value="Cash"
                      className="text-amber-900 hover:bg-amber-50">
                      Cash
                    </SelectItem>
                    <SelectItem
                      value="Credit Card"
                      className="text-amber-900 hover:bg-amber-50">
                      Credit Card
                    </SelectItem>
                    <SelectItem
                      value="Bank Transfer"
                      className="text-amber-900 hover:bg-amber-50">
                      Bank Transfer
                    </SelectItem>
                    <SelectItem
                      value="UPI"
                      className="text-amber-900 hover:bg-amber-50">
                      UPI
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentMethod && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.paymentMethod.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* //! Purchase Details */}

        <Card className="mb-8 border-amber-200 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-amber-100 to-amber-50 px-6 py-4">
            <CardTitle className="text-2xl font-serif text-amber-900">
              Purchase Details
            </CardTitle>
            <CardDescription className="text-amber-700">
              Enter the details of the purchased jewelry items
            </CardDescription>
          </div>

          <CardContent className="p-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="mb-6">
                {index > 0 && <Separator className="mb-6 bg-amber-200" />}

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-amber-900">
                    Item {index + 1}
                  </h3>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor={`purchaseItems.${index}.itemDescription`}
                      className="text-amber-900 font-medium">
                      Item Description <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`purchaseItems.${index}.itemDescription`}
                      {...form.register(
                        `purchaseItems.${index}.itemDescription`
                      )}
                      placeholder="Gold Ring, Diamond Necklace, etc."
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    />
                    {form.formState.errors.purchaseItems?.[index]
                      ?.itemDescription && (
                      <p className="text-sm text-red-500 mt-1">
                        {
                          form.formState.errors.purchaseItems[index]
                            ?.itemDescription?.message
                        }
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`purchaseItems.${index}.purity`}
                        className="text-amber-900 font-medium">
                        Purity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`purchaseItems.${index}.purity`}
                        {...form.register(`purchaseItems.${index}.purity`)}
                        placeholder="e.g., 24K, 18K, 916"
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      />
                      {form.formState.errors.purchaseItems?.[index]?.purity && (
                        <p className="text-sm text-red-500 mt-1">
                          {
                            form.formState.errors.purchaseItems[index]?.purity
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`purchaseItems.${index}.weight`}
                        className="text-amber-900 font-medium">
                        Weight (g) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`purchaseItems.${index}.weight`}
                        type="number"
                        step="0.01"
                        {...form.register(`purchaseItems.${index}.weight`)}
                        placeholder="0.00"
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      />
                      {form.formState.errors.purchaseItems?.[index]?.weight && (
                        <p className="text-sm text-red-500 mt-1">
                          {
                            form.formState.errors.purchaseItems[index]?.weight
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`purchaseItems.${index}.ratePerGram`}
                        className="text-amber-900 font-medium">
                        Rate per Gram <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`purchaseItems.${index}.ratePerGram`}
                        type="number"
                        step="0.01"
                        {...form.register(`purchaseItems.${index}.ratePerGram`)}
                        placeholder="0.00"
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      />
                      {form.formState.errors.purchaseItems?.[index]
                        ?.ratePerGram && (
                        <p className="text-sm text-red-500 mt-1">
                          {
                            form.formState.errors.purchaseItems[index]
                              ?.ratePerGram?.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      {/*//!  amount section of each items */}
                      <Label
                        htmlFor={`purchaseItems.${index}.amount`}
                        className="text-amber-900 font-medium">
                        Amount
                      </Label>

                      <div className="relative">
                        <Input
                          id={`purchaseItems.${index}.amount`}
                          type="number"
                          {...form.register(`purchaseItems.${index}.amount`)}
                          className="bg-amber-50 border-amber-200 pr-10"
                        />
                        <Calculator className="absolute right-3 top-2.5 h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  itemDescription: "",
                  purity: "",
                  weight: 0,
                  ratePerGram: 0,
                  amount: 0,
                })
              }
              className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-900">
              <PlusCircle className="h-4 w-4 mr-2" /> Add Another Item
            </Button>

            {form.formState.errors.purchaseItems &&
              "root" in form.formState.errors.purchaseItems && (
                <p className="text-sm text-red-500 mt-2">
                  {form.formState.errors.purchaseItems.root?.message}
                </p>
              )}
          </CardContent>

          {/* //!  total amount section */}
          <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-6 border-t border-amber-200 space-y-4">
            {/* Total Making Charge */}
            <div className="flex justify-between items-center gap-y-4">
              <h3 className="text-xl font-serif font-semibold text-amber-900">
                Total Making Charge
              </h3>
              <Input
                type="number"
                value={makingCharge}
                onChange={(e) =>
                  setMakingCharge(Number.parseFloat(e.target.value) || 0)
                }
                // {...form.register("totalmaking_charge")}
                className="bg-white border-amber-200 pr-2 w-42 sm:w-62"
              />
            </div>

            {/* GST Selection */}
            <div className="flex justify-between items-center gap-4">
              <Label
                htmlFor="gst"
                className="text-amber-900 text-xl font-bold">
                GST (3%) <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={handleGstChange}>
                <SelectTrigger
                  id="gst"
                  className="border-amber-200 focus:ring-amber-400">
                  <SelectValue placeholder="Select GST" />
                </SelectTrigger>
                <SelectContent className="border-amber-200">
                  <SelectItem
                    value="include"
                    className="text-amber-900 hover:bg-amber-50">
                    Include
                  </SelectItem>
                  <SelectItem
                    value="exclude"
                    className="text-amber-900 hover:bg-amber-50">
                    Exclude
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            {/* Total Amount Display */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif font-semibold text-amber-900">
                Total Amount {gstIncluded && <span>(GST Included)</span>}
              </h3>
              <div className="text-2xl font-bold text-amber-900">
                ₹{totalAmount.toFixed(2)}{" "}
              </div>
            </div>
          </div>
          {/* </div> */}

          <CardFooter className="bg-amber-50 p-6 flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
              size="lg">
              Submit Invoice
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={() => form.reset()}
              size="lg">
              Reset Form
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
}
