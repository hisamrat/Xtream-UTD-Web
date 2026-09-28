import type { Metadata } from "next";
import { ContactClient } from "@/components/contact/ContactClient";
import { fetchAllProducts } from "@/lib/products-server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact Support & Inquiries",
  description:
    "Contact Xtream UTD for direct creator gadget support, product availability, custom desk setups, and delivery across Bangladesh via Facebook Messenger or customer form."
};

export default async function ContactPage() {
  const products = await fetchAllProducts();
  return <ContactClient products={products} />;
}
