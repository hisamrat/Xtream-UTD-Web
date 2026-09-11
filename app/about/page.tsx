import type { Metadata } from "next";
import { AboutClient } from "@/components/about/AboutClient";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Xtream UTD products, categories, support, and business details."
};

export default function AboutPage() {
  return <AboutClient />;
}
