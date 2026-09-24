"use client";

import { ShieldCheck, Truck, Sparkles, MessageCircle } from "lucide-react";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactFAQ } from "@/components/contact/ContactFAQ";
import type { Product } from "@/lib/product-schema";
import { useLanguage } from "@/components/site/LanguageProvider";
import { Breadcrumb } from "@/components/site/Breadcrumb";

type ContactClientProps = {
  products: Product[];
};

export function ContactClient({ products }: ContactClientProps) {
  const { language } = useLanguage();

  const trustPerks = [
    {
      icon: Sparkles,
      label: language === "bn" ? "১০০% আসল প্রোডাক্ট" : "100% Authentic Product",
      desc: language === "bn" ? "১০০% অথেনটিক গ্যারান্টি" : "100% authentic guarantee"
    },
    {
      icon: Truck,
      label: language === "bn" ? "৬৪ জেলায় ডেলিভারি" : "64-District Dispatch",
      desc: language === "bn" ? "ঢাকা ৳৭০ ও সারাদেশে ৳১৩০" : "Dhaka ৳70 & nationwide ৳130"
    },
    {
      icon: ShieldCheck,
      label: language === "bn" ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery",
      desc: language === "bn" ? "সারাদেশে ২–৩ দিনে ডেলিভারি" : "Nationwide in 2–3 days"
    },
    {
      icon: MessageCircle,
      label: language === "bn" ? "সাপোর্ট সময়সূচি" : "Support Hours",
      desc: language === "bn" ? "প্রতিদিন: সকাল ৯:০০ – রাত ১০:০০" : "Everyday: 9:00 AM – 10:00 PM"
    }
  ];

  return (
    <main className="page-main contact-page-main contact-page">
      <Breadcrumb items={[{ label: language === "bn" ? "যোগাযোগ" : "Contact" }]} />
      {/* Contact Hero Section */}
      <section className="contact-hero-section">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">
            {language === "bn" ? (
              <>
                ক্রিয়েটর গিয়ার বা গ্যাজেট নিয়ে সাহায্য চাই? <br />
                <span className="text-accent">Xtream UTD-এর সাথে কথা বলুন।</span>
              </>
            ) : (
              <>
                Need Creator Gear Help? <br />
                <span className="text-accent">Talk with Xtream UTD.</span>
              </>
            )}
          </h1>
          <p className="contact-hero-lede">
            {language === "bn"
              ? "স্টুডিও সেটআপ, ক্যামেরার এক্সেসরিজ খোঁজা বা দেশব্যাপী পার্সেল ট্র্যাকিং—আমাদের সাপোর্ট টিম সবসময় আপনাকে সহযোগিতা করতে প্রস্তুত।"
              : "Whether you're building a hybrid studio, searching for rare mirrorless accessories, or tracking a nationwide delivery, our support team in Dhaka is here to help."}
          </p>

          {/* Quick Trust Highlights */}
          <div className="contact-perks-row" aria-label="Customer trust commitments">
            {trustPerks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div className="perk-chip" key={perk.label}>
                  <div className="perk-chip-icon" aria-hidden="true">
                    <Icon size={16} />
                  </div>
                  <div className="perk-chip-text">
                    <span className="perk-label">{perk.label}</span>
                    <span className="perk-desc">{perk.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Two-Column Contact Section */}
      <section className="contact-main-grid">
        <ContactChannels />
        <ContactForm products={products} />
      </section>

      {/* Frequently Asked Questions */}
      <section className="contact-faq-container">
        <ContactFAQ />
      </section>
    </main>
  );
}

