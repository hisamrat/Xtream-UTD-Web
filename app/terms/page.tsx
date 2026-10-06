import type { Metadata } from "next";
import { TermsView } from "@/features/content-pages/components/TermsView";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions, delivery coverage, cash on delivery, and return guidelines for Xtream UTD."
};

export default function TermsPage() {
  return <TermsView />;
}
