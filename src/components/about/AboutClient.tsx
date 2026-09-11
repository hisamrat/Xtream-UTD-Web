"use client";

import Link from "next/link";
import {
  Clock,
  Layers,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/components/site/LanguageProvider";
import { Breadcrumb } from "@/components/site/Breadcrumb";

const aboutCategories = siteConfig.categories.filter(
  (category) => category !== "All Products" && category !== "Gift Items"
);

export function AboutClient() {
  const { tCategory, language } = useLanguage();

  const trustPerks = [
    {
      icon: Sparkles,
      label: language === "bn" ? "প্রিমিয়াম কোয়ালিটি" : "Premium Quality",
      desc: language === "bn" ? "বাছাইকৃত আসল গ্যাজেট" : "Curated authentic gear"
    },
    {
      icon: ShieldCheck,
      label: language === "bn" ? "সাশ্রয়ী মূল্য" : "Affordable Pricing",
      desc: language === "bn" ? "স্বচ্ছ বাংলাদেশি টাকা" : "Transparent BDT pricing"
    },
    {
      icon: Truck,
      label: language === "bn" ? "৬৪ জেলায় ডেলিভারি" : "Nationwide Delivery",
      desc: language === "bn" ? "ঢাকা ৳৭০ ও সারাদেশে ৳১৩০" : "Dhaka ৳70 & outside ৳130"
    },
    {
      icon: Clock,
      label: language === "bn" ? "সাপোর্ট সময়সূচি" : "Support Hours",
      desc: language === "bn" ? "প্রতিদিন: সকাল ৯:০০ – রাত ১০:০০" : "Everyday: 9:00 AM – 10:00 PM"
    }
  ];

  return (
    <main className="page-main contact-page-main">
      <Breadcrumb items={[{ label: language === "bn" ? "আমাদের সম্পর্কে" : "About Us" }]} />

      {/* Hero Section */}
      <section className="contact-hero-section">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">
            {language === "bn" ? (
              <>
                প্রয়োজনীয় প্রোডাক্ট ও গ্যাজেট, <br />
                <span className="text-accent">দৈনন্দিন জীবন ও ক্রিয়েটরদের জন্য।</span>
              </>
            ) : (
              <>
                Useful Products &amp; Gear, <br />
                <span className="text-accent">Chosen for Everyday Life.</span>
              </>
            )}
          </h1>
          <p className="contact-hero-lede">
            {language === "bn"
              ? "Xtream UTD নিয়ে এসেছে ট্রেন্ডিং গ্যাজেট ও ক্রিয়েটর ইকুইপমেন্ট—ডেস্ক সেটআপ, বাসা, ভ্রমণ ও ক্রিয়েটরদের প্রাত্যহিক কাজের সুবিধার্থে। সেরা কোয়ালিটি, সাশ্রয়ী মূল্য এবং দেশব্যাপী নির্ভরযোগ্য কাস্টমার সাপোর্টই আমাদের মূল অঙ্গীকার।"
              : "Xtream UTD curates trending gadgets and accessories for desks, homes, travel, and creator routines. Our promise is simple: practical items, transparent BDT pricing, and responsive support across Bangladesh."}
          </p>

          {/* Quick Trust Highlights */}
          <div className="contact-perks-row" aria-label="Brand highlights">
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

      {/* Brand Values Bento Cards Grid */}
      <section className="stack-section" style={{ marginTop: "16px" }}>
        <div className="contact-bento-grid">
          {/* Card 1: Product Quality */}
          <div className="bento-card">
            <div className="bento-card-top">
              <div className="channel-icon-badge messenger-badge">
                <Sparkles size={20} aria-hidden="true" />
              </div>
              <span className="bento-tag">
                {language === "bn" ? "পণ্যের গুণগত মান" : "Quality Standards"}
              </span>
            </div>
            <div className="bento-card-content">
              <h3 className="bento-title">
                {language === "bn"
                  ? "কার্যকারিতা ও প্রিমিয়াম ফিনিশ"
                  : "Curated for Function & Finish"}
              </h3>
              <p className="bento-desc">
                {language === "bn"
                  ? "ব্যবহারযোগ্যতা, প্রিমিয়াম ফিনিশ এবং দীর্ঘস্থায়িত্ব নিশ্চিত করে প্রতিটি গ্যাজেট ও টুলস যত্নসহকারে বাছাই করা হয়েছে।"
                  : "Practical items carefully selected for function, finish, durability, and maximum everyday creator value."}
              </p>
            </div>
            <div className="bento-meta-badge">
              <PackageCheck size={13} aria-hidden="true" />
              <span>{language === "bn" ? "কোয়ালিটি গ্যারান্টি" : "Verified Quality"}</span>
            </div>
          </div>

          {/* Card 2: Affordable Pricing */}
          <div className="bento-card">
            <div className="bento-card-top">
              <div className="channel-icon-badge whatsapp-badge">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <span className="bento-tag">
                {language === "bn" ? "স্বচ্ছ মূল্য" : "Fair Pricing"}
              </span>
            </div>
            <div className="bento-card-content">
              <h3 className="bento-title">
                {language === "bn"
                  ? "সাশ্রয়ী ও স্বচ্ছ বাংলাদেশি মূল্য"
                  : "Affordable & Honest BDT Pricing"}
              </h3>
              <p className="bento-desc">
                {language === "bn"
                  ? "স্পষ্ট বাংলাদেশি টাকায় প্রদর্শিত মূল্য, কোনো লুকানো ফি নেই এবং আকর্ষণীয় স্পেশাল ডিসকাউন্ট অফার।"
                  : "Clear Bangladeshi Taka pricing with visible promotional discounts, transparent courier rates, and zero hidden costs."}
              </p>
            </div>
            <div className="bento-meta-badge">
              <ShieldCheck size={13} aria-hidden="true" />
              <span>{language === "bn" ? "১০০% স্বচ্ছ মূল্য" : "No Hidden Fees"}</span>
            </div>
          </div>

          {/* Card 3: Delivery Support */}
          <div className="bento-card">
            <div className="bento-card-top">
              <div className="channel-icon-badge location-badge">
                <Truck size={20} aria-hidden="true" />
              </div>
              <span className="bento-tag">
                {language === "bn" ? "ডেলিভারি সুবিধা" : "Nationwide Delivery"}
              </span>
            </div>
            <div className="bento-card-content">
              <h3 className="bento-title">
                {language === "bn"
                  ? "ঢাকার ভেতরে ৳৭০ | বাইরে ৳১৩০"
                  : "Inside Dhaka ৳70 | Outside ৳130"}
              </h3>
              <p className="bento-desc">
                {language === "bn"
                  ? "ঢাকা ও সারাদেশের ৬৪ জেলায় ২–৩ দিনে হোম ডেলিভারি এবং পার্সেল হাতে পেয়ে ক্যাশ অন ডেলিভারিতে মূল্য পরিশোধের সুবিধা।"
                  : "Inside Dhaka: ৳70 (24–48h). Outside Dhaka: ৳130 (48–72h) with Cash on Delivery nationwide in 2–3 days."}
              </p>
            </div>
            <div className="bento-meta-badge">
              <Truck size={13} aria-hidden="true" />
              <span>{language === "bn" ? "৬৪ জেলায় হোম ডেলিভারি" : "64 Districts Covered"}</span>
            </div>
          </div>

          {/* Card 4: Customer Care */}
          <div className="bento-card">
            <div className="bento-card-top">
              <div className="channel-icon-badge hours-badge">
                <Clock size={20} aria-hidden="true" />
              </div>
              <span className="bento-tag">
                {language === "bn" ? "কাস্টমার কেয়ার" : "Customer Care"}
              </span>
            </div>
            <div className="bento-card-content">
              <h3 className="bento-title">
                {language === "bn"
                  ? "প্রতিদিন সকাল ৯:০০ – রাত ১০:০০"
                  : "Everyday: 9:00 AM – 10:00 PM (BST)"}
              </h3>
              <p className="bento-desc">
                {language === "bn"
                  ? "হটলাইন (০১৬২২০০১৮৭৯), মেসেঞ্জার এবং অফিসিয়াল চ্যানেলে সপ্তাহের ৭ দিন সার্বক্ষণিক কাস্টমার সাপোর্ট সার্ভিস।"
                  : "Customer service available 7 days a week via direct hotline (01622001879), Messenger, WhatsApp, and official channels."}
              </p>
            </div>
            <div className="bento-meta-badge">
              <MapPin size={13} aria-hidden="true" />
              <span>{language === "bn" ? "মিরপুর-১০, ঢাকা" : "Mirpur-10, Dhaka"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Explorer Card Section */}
      <section className="stack-section" style={{ marginTop: "32px" }}>
        <div className="terms-preorder-card">
          <div className="terms-preorder-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div className="channel-icon-badge phone-badge" style={{ width: "36px", height: "36px" }}>
                <Layers size={18} aria-hidden="true" />
              </div>
              <span className="bento-tag">
                {language === "bn" ? "আমাদের কালেকশন" : "Our Collections"}
              </span>
            </div>
            <h2 className="terms-preorder-title" style={{ marginTop: "8px" }}>
              {language === "bn" ? "পণ্য কালেকশন অন্বেষণ করুন" : "Explore Curated Gear Categories"}
            </h2>
            <p className="page-lede flush-lede">
              {language === "bn"
                ? "আপনার কাজের পরিবেশ বা দৈনন্দিন ব্যবহারের জন্য পছন্দের ক্যাটাগরি বেছে নিন:"
                : "Find the exact creator tools, lighting, audio gear, and desk accessories for your setup:"}
            </p>
          </div>

          <div className="category-pills" style={{ marginTop: "12px" }}>
            {aboutCategories.map((category) => (
              <Link
                className="category-pill"
                href={`/products?category=${encodeURIComponent(category)}`}
                key={category}
              >
                {tCategory(category)}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

