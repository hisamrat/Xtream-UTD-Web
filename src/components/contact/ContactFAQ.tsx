"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/site/LanguageProvider";

type FAQItem = {
  question: string;
  questionBn: string;
  answer: string;
  answerBn: string;
  category: string;
  categoryBn: string;
  icon: typeof HelpCircle;
};

const faqs: FAQItem[] = [
  {
    category: "Ordering & Checkout",
    categoryBn: "অর্ডার ও চেকআউট",
    question: "How do I place an order with Xtream UTD?",
    questionBn: "Xtream UTD-তে কীভাবে অর্ডার করব?",
    answer:
      "Select your desired gadgets, add them to your cart, and proceed to checkout, or call our hotline (01622001879) directly. Home delivery is available nationwide within 2–3 days. Your order will be confirmed after the order processing message from our seller desk.",
    answerBn:
      "আপনার পছন্দের গ্যাজেট কার্টে যোগ করে চেকআউট করুন অথবা আমাদের হটলাইনে (০১৬২২০০১৮৭৯) কল করুন। সারাদেশে ২–৩ দিনের মধ্যে হোম ডেলিভারি সুবিধা রয়েছে। সেলারের পক্ষ থেকে অর্ডার প্রসেসিং মেসেজ পাওয়ার পর অর্ডার চূড়ান্তভাবে কনফার্ম হবে।",
    icon: Sparkles
  },
  {
    category: "Nationwide Delivery",
    categoryBn: "দেশব্যাপী ডেলিভারি",
    question: "What are your delivery timelines and courier charges in Bangladesh?",
    questionBn: "ডেলিভারির সময়সীমা এবং কুরিয়ার চার্জ কত?",
    answer:
      "Inside Dhaka Delivery Charge is ৳70 (typically arrives within 24 to 48 hours). Outside Dhaka Delivery Charge is ৳130 (dispatched via trusted courier partners Pathao / Steadfast / eCourier across all 64 districts within 48 to 72 hours).",
    answerBn:
      "ঢাকার ভেতরে ডেলিভারি চার্জ ৭০/- (২৪ থেকে ৪৮ ঘণ্টা)। ঢাকার বাইরে ডেলিভারি চার্জ ১৩০/- (বিশ্বস্ত কুরিয়ার Pathao / Steadfast / eCourier-এর মাধ্যমে ৪৮ থেকে ৭২ ঘণ্টা) সারাদেশে ৬৪ জেলায় নির্ভরযোগ্যভাবে পৌঁছে দেওয়া হয়।",
    icon: Truck
  },
  {
    category: "Payment Method",
    categoryBn: "পেমেন্ট পদ্ধতি",
    question: "Is Cash on Delivery available across Bangladesh?",
    questionBn: "সারাদেশে কি ক্যাশ অন ডেলিভারি সুবিধা আছে?",
    answer:
      "Yes! Cash on Delivery is supported across all 64 districts in Bangladesh with home delivery available nationwide within 2–3 days.",
    answerBn:
      "হ্যাঁ! ঢাকা ও সারাদেশের ৬৪ জেলার প্রতিটি ঠিকানায় ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। পার্সেল হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।",
    icon: ShieldCheck
  },
  {
    category: "Product Authenticity",
    categoryBn: "পণ্যের নিশ্চয়তা",
    question: "Are all products 100% authentic and genuine?",
    questionBn: "পণ্যগুলো কি ১০০% আসল ও জেনুইন?",
    answer:
      "Yes! Xtream UTD maintains a strict 100% Authentic Product Guarantee across all trending gadgets, creator tools, desk setups, and lifestyle accessories.",
    answerBn:
      "হ্যাঁ! Xtream UTD-এর প্রতিটি গ্যাজেট, ক্রিয়েটর টুলস ও এক্সেসরিজে রয়েছে ১০০% আসল পণ্যের শতভাগ নিশ্চয়তা।",
    icon: Sparkles
  },
  {
    category: "Custom Setups",
    categoryBn: "কাস্টম সেটআপ ও পরামর্শ",
    question: "Do you offer consultations for custom creator desk and camera rigs?",
    questionBn: "আপনারা কি কনটেন্ট ক্রিয়েটর ও স্টুডিও সেটআপের জন্য পরামর্শ দেন?",
    answer:
      "Yes! Whether you need a multi-camera live streaming setup, podcast microphone array, gimbal balancing configuration, or studio lighting layout, our specialists will guide you to matching brackets, cables, and power solutions tailored to your budget.",
    answerBn:
      "হ্যাঁ! লাইভ স্ট্রিমিং, পডকাস্ট মাইক্রোফোন, গিম্বল ব্যালেন্সিং বা স্টুডিও লাইটিং সেটআপের জন্য আমাদের এক্সপার্ট টিম আপনাকে সঠিক গিয়ার ও এক্সেসরিজ নির্বাচনে সম্পূর্ণ বিনামূল্যে পরামর্শ দেবে।",
    icon: HelpCircle
  }
];

export function ContactFAQ() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="contact-faq-section">
      <div className="faq-header">
        <span className="section-kicker">
          {language === "bn" ? "সাহায্য ও স্পষ্টতা" : "Help & Clarity"}
        </span>
        <h2 className="faq-main-title">
          {language === "bn" ? "সচরাচর জিজ্ঞাসিত প্রশ্নাবলী" : "Frequently Asked Questions"}
        </h2>
        <p className="page-lede flush-lede">
          {language === "bn"
            ? "ডেলিভারি, পার্সেল চেকিং ও কাস্টমার সাপোর্ট সংক্রান্ত প্রয়োজনীয় সকল তথ্য।"
            : "Everything you need to know about dispatch, package verification, and customer support in Bangladesh."}
        </p>
      </div>

      <div className="faq-accordion-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const Icon = faq.icon;
          const questionText = language === "bn" ? faq.questionBn : faq.question;
          const answerText = language === "bn" ? faq.answerBn : faq.answer;

          return (
            <div className={`faq-accordion-item ${isOpen ? "is-open" : ""}`} key={faq.question}>
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
              >
                <div className="faq-question-left">
                  <div className="faq-icon-badge" aria-hidden="true">
                    <Icon size={18} />
                  </div>
                  <span className="faq-question-text">{questionText}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`faq-chevron ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {isOpen ? (
                <div className="faq-answer-panel">
                  <p className="faq-answer-text">{answerText}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
