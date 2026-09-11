"use client";

import {
  Clock,
  Package,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck
} from "lucide-react";
import { useLanguage } from "@/components/site/LanguageProvider";
import { Breadcrumb } from "@/components/site/Breadcrumb";

export function TermsClient() {
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
      icon: Clock,
      label: language === "bn" ? "সাপোর্ট সময়সূচি" : "Support Hours",
      desc: language === "bn" ? "প্রতিদিন: সকাল ৯:০০ – রাত ১০:০০" : "Everyday: 9:00 AM – 10:00 PM"
    }
  ];

  return (
    <main className="page-main contact-page-main">
      <Breadcrumb items={[{ label: language === "bn" ? "শর্তাবলী ও নিয়মাবলী" : "Terms & Conditions" }]} />

      {/* Hero Section */}
      <section className="contact-hero-section">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">
            {language === "bn" ? (
              <>
                স্বচ্ছ পলিসি ও নিয়মাবলী, <br />
                <span className="text-accent">নিরাপদ কেনাকাটার বিশ্বস্ত নিশ্চয়তা।</span>
              </>
            ) : (
              <>
                Transparent Policies, <br />
                <span className="text-accent">Built on Customer Trust.</span>
              </>
            )}
          </h1>
          <p className="contact-hero-lede">
            {language === "bn"
              ? "সারাদেশে নিরাপদ ও ঝামেলামুক্ত কেনাকাটার জন্য Xtream UTD-এর গ্রাহকবান্ধব পলিসি—ক্যাশ অন ডেলিভারি, দ্রুত কুরিয়ার সুবিধা এবং শতভাগ আসল পণ্যের নিশ্চয়তাসহ।"
              : "Clear, customer-first policies designed for safe shopping across Bangladesh with Cash on Delivery, reliable courier dispatch, and 100% genuine product verification."}
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

      {/* Core Agreements Bento Cards Grid */}
      <section className="stack-section" style={{ marginTop: "16px" }}>
        <div className="contact-bento-grid">
          {/* Card 1: Pricing & Delivery Charges */}
          <div className="bento-card">
            <div className="bento-card-top">
              <div className="channel-icon-badge location-badge">
                <Truck size={20} aria-hidden="true" />
              </div>
              <span className="bento-tag">
                {language === "bn" ? "ডেলিভারি চার্জ" : "Delivery Rates"}
              </span>
            </div>
            <div className="bento-card-content">
              <h3 className="bento-title">
                {language === "bn"
                  ? "ঢাকার ভেতরে ৳৭০ | ঢাকার বাইরে ৳১৩০"
                  : "৳70 Inside Dhaka | ৳130 Outside Dhaka"}
              </h3>
              <p className="bento-desc">
                {language === "bn"
                  ? "Xtream UTD-তে প্রদর্শিত সকল মূল্য বাংলাদেশি টাকায় (৳ / BDT)। Pathao, Steadfast ও eCourier-এর মাধ্যমে ৬৪ জেলায় ২৪ থেকে ৭২ ঘণ্টার মধ্যে ডেলিভারি পৌঁছে দেওয়া হয়।"
                  : "All prices are in Bangladeshi Taka (৳ / BDT). Dispatched via Pathao, Steadfast, and eCourier across all 64 districts within 24 to 72 hours."}
              </p>
            </div>
            <div className="bento-meta-badge">
              <Truck size={13} aria-hidden="true" />
              <span>{language === "bn" ? "২–৩ দিনে হোম ডেলিভারি" : "2–3 Days Home Delivery"}</span>
            </div>
          </div>

          {/* Card 2: Cash on Delivery */}
          <div className="bento-card">
            <div className="bento-card-top">
              <div className="channel-icon-badge whatsapp-badge">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <span className="bento-tag">
                {language === "bn" ? "পেমেন্ট সুবিধা" : "Payment Method"}
              </span>
            </div>
            <div className="bento-card-content">
              <h3 className="bento-title">
                {language === "bn"
                  ? "সারাদেশে ৬৪ জেলায় ক্যাশ অন ডেলিভারি"
                  : "100% Cash on Delivery Nationwide"}
              </h3>
              <p className="bento-desc">
                {language === "bn"
                  ? "আমরা মূলত ক্যাশ অন ডেলিভারি (COD) পদ্ধতিতে কাজ করি ঢাকা ও সারাদেশের ৬৪ জেলায়। পার্সেল রিসিভ করার সময় সম্পূর্ণ মূল্য পরিশোধ করতে পারবেন।"
                  : "We operate primarily via Cash on Delivery (COD) across Dhaka and all 64 districts in Bangladesh with zero prepayment risk on in-stock orders."}
              </p>
            </div>
            <div className="bento-meta-badge">
              <ShieldCheck size={13} aria-hidden="true" />
              <span>{language === "bn" ? "ক্যাশ অন ডেলিভারি প্রযোজ্য" : "Cash on Delivery Available"}</span>
            </div>
          </div>

          {/* Card 3: 100% Authentic Product Guarantee */}
          <div className="bento-card">
            <div className="bento-card-top">
              <div className="channel-icon-badge messenger-badge">
                <Sparkles size={20} aria-hidden="true" />
              </div>
              <span className="bento-tag">
                {language === "bn" ? "পণ্যের শতভাগ নিশ্চয়তা" : "Authenticity Guarantee"}
              </span>
            </div>
            <div className="bento-card-content">
              <h3 className="bento-title">
                {language === "bn"
                  ? "১০০% আসল ও যাচাইকৃত গ্যাজেট"
                  : "100% Authentic & Genuine Products"}
              </h3>
              <p className="bento-desc">
                {language === "bn"
                  ? "Xtream UTD-এর সকল গ্যাজেট, ক্রিয়েটর টুলস, লাইটিং ও ডেস্ক এক্সেসরিজ শতভাগ আসল, টেকসই এবং কোয়ালিটি-টেস্টেড।"
                  : "All gadgets, creator tools, camera rigs, lighting, and desk accessories sold by Xtream UTD are 100% authentic and verified."}
              </p>
            </div>
            <div className="bento-meta-badge">
              <RotateCcw size={13} aria-hidden="true" />
              <span>{language === "bn" ? "কোয়ালিটি পরীক্ষিত" : "Quality Tested"}</span>
            </div>
          </div>

          {/* Card 4: Order Confirmation & Processing */}
          <div className="bento-card">
            <div className="bento-card-top">
              <div className="channel-icon-badge email-badge">
                <PackageCheck size={20} aria-hidden="true" />
              </div>
              <span className="bento-tag">
                {language === "bn" ? "অর্ডার প্রসেসিং" : "Order Confirmation"}
              </span>
            </div>
            <div className="bento-card-content">
              <h3 className="bento-title">
                {language === "bn"
                  ? "সেলার মেসেজে অর্ডার চূড়ান্তকরণ"
                  : "Confirmed via Seller Message"}
              </h3>
              <p className="bento-desc">
                {language === "bn"
                  ? "অর্ডার সাবমিট করার পর আমাদের সেলার ডেস্ক থেকে প্রসেসিং ও কনফার্মেশন মেসেজ পাওয়ার পর আপনার অর্ডার চূড়ান্তভাবে নিশ্চিত করা হবে।"
                  : "Orders are reviewed and confirmed promptly by our seller desk. You will receive direct updates until your parcel is delivered."}
              </p>
            </div>
            <div className="bento-meta-badge">
              <PackageCheck size={13} aria-hidden="true" />
              <span>{language === "bn" ? "সেলার ভেরিফিকেশন" : "Verified Before Dispatch"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Order Terms & Conditions Section */}
      <section id="pre-order" className="stack-section terms-preorder-section" style={{ marginTop: "32px" }}>
        <div className="terms-preorder-card">
          <div className="terms-preorder-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div className="channel-icon-badge phone-badge" style={{ width: "36px", height: "36px" }}>
                <Package size={18} aria-hidden="true" />
              </div>
              <span className="bento-tag">
                {language === "bn" ? "চীন থেকে সরাসরি প্রি-অর্ডার" : "Direct Import Pre-Order"}
              </span>
            </div>
            <h2 className="terms-preorder-title" style={{ marginTop: "8px" }}>
              {language === "bn" ? "কিভাবে প্রি-অর্ডার করবেন (How to Place a Pre-Order)" : "How to Place a Pre-Order"}
            </h2>
            <p className="page-lede flush-lede">
              {language === "bn"
                ? "চীন থেকে কাঙ্ক্ষিত প্রিমিয়াম গ্যাজেট ও অ্যাক্সেসরিজ প্রি-অর্ডারের স্বচ্ছ নিয়মাবলী:"
                : "Step-by-step requirements for custom gadget pre-orders from China to Bangladesh."}
            </p>
          </div>

          <ul className="terms-preorder-list">
            <li>
              <span className="preorder-bullet-icon" aria-hidden="true">✓</span>
              <span>
                {language === "bn" ? (
                  <>প্রি-অর্ডার কনফার্ম করতে পণ্যের মূল্যের <strong>৫০% অগ্রিম পেমেন্ট (50% of the product price in advance)</strong> করতে হবে।</>
                ) : (
                  <>To place a pre-order, you need to pay <strong>50% of the product price in advance</strong>.</>
                )}
              </span>
            </li>
            <li>
              <span className="preorder-bullet-icon" aria-hidden="true">✓</span>
              <span>
                {language === "bn" ? (
                  <>বাকি <strong>৫০% মূল্য পণ্য হাতে পাওয়ার পর ক্যাশ অন ডেলিভারিতে (remaining 50% upon delivery)</strong> পরিশোধ করা যাবে।</>
                ) : (
                  <>The <strong>remaining 50% can be paid upon delivery</strong> of the product.</>
                )}
              </span>
            </li>
            <li>
              <span className="preorder-bullet-icon" aria-hidden="true">✓</span>
              <span>
                {language === "bn" ? (
                  <>প্রি-অর্ডার ডেলিভারির সময় সাধারণত <strong>২৫–৩০ দিন (25–30 days)</strong>।</>
                ) : (
                  <>Delivery usually takes <strong>25–30 days</strong>.</>
                )}
              </span>
            </li>
            <li>
              <span className="preorder-bullet-icon" aria-hidden="true">✓</span>
              <span>
                {language === "bn" ? (
                  <>অগ্রিম পেমেন্ট <strong>বিকাশ বা নগদ (bKash or Nagad)</strong>-এর মাধ্যমে সম্পন্ন করা যাবে।</>
                ) : (
                  <>The advance payment can be made via <strong>bKash or Nagad</strong>.</>
                )}
              </span>
            </li>
            <li>
              <span className="preorder-bullet-icon" aria-hidden="true">✓</span>
              <span>
                {language === "bn" ? (
                  <>প্রি-অর্ডার করার পর <strong>চীন থেকে বাংলাদেশে পণ্য পৌঁছানোর প্রতিটি ধাপের নিয়মিত আপডেট (regular updates on the product’s journey from China to Bangladesh)</strong> আপনাকে প্রদান করা হবে।</>
                ) : (
                  <>After placing your pre-order, you will receive <strong>regular updates on the product’s journey from China to Bangladesh</strong>.</>
                )}
              </span>
            </li>
          </ul>

          <div className="terms-preorder-alert" role="alert">
            <span className="preorder-alert-icon" aria-hidden="true">📢</span>
            <div className="preorder-alert-content">
              <strong>{language === "bn" ? "জরুরী নির্দেশিকা (Important):" : "Important:"}</strong>{" "}
              {language === "bn" ? (
                <>প্রি-অর্ডার করা পণ্য বাংলাদেশে পৌঁছানোর পর আপনি যদি পার্সেল রিসিভ না করেন, তবে <strong>অগ্রিম প্রদানকৃত পেমেন্ট রিফান্ড করা হবে না (advance payment will not be refunded)</strong>।</>
              ) : (
                <>Once the pre-ordered product arrives in Bangladesh, if you do not receive it, the <strong>advance payment will not be refunded</strong>.</>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

