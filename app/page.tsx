import InvoiceForm from "@/components/InvoiceForm";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-2 text-amber-900">
          Jewelry Invoice
        </h1>
        <p className="text-amber-700 mb-8">
          Create and manage your jewelry billing invoices
        </p>
        <InvoiceForm />
      </div>
    </main>
  );
}
