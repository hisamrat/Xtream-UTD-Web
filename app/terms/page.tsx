import type { Metadata } from "next";
import { TermsClient } from "@/components/terms/TermsClient";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions, delivery coverage, cash on delivery, and return guidelines for Xtream UTD."
};

export default function TermsPage() {
  return <TermsClient />;
}
