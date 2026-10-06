import type { Metadata } from "next";
import { ContactView } from "@/features/contact/components/ContactView";

export const metadata: Metadata = {
  title: "Contact Support & Inquiries",
  description:
    "Contact Xtream UTD for direct creator gadget support, product availability, custom desk setups, and delivery across Bangladesh via Facebook Messenger or customer form."
};

export default function ContactPage() {
  return <ContactView />;
}
