"use client";

import { useState } from "react";
import {
  Check,
  Clock,
  Copy,
  Mail,
  MapPin,
  Phone,
  Sparkles
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/components/site/LanguageProvider";

export function ContactChannels() {
  const { language } = useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      // Fallback if clipboard API restricted
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1500);
    }
  };

  const displayPhone = siteConfig.order.phone;
  const displayEmail = siteConfig.order.email;
  const displayHours = siteConfig.business.hours;

  return (
    <div className="contact-channels-container">
      <div className="channels-header">
        <div className="live-status-pill" aria-label="Support Status: Live">
          <span className="live-dot" aria-hidden="true" />
          <span>{language === "bn" ? "সাপোর্ট ডেস্ক অনলাইন" : "Support Desk Online"}</span>
          <span className="status-divider">•</span>
          <span className="response-time">
            {language === "bn" ? "১৫ মিনিটে উত্তর দেওয়া হয়" : "Replies in ~15 mins"}
          </span>
        </div>
        <h2 className="channels-title">
          {language === "bn" ? "সরাসরি যোগাযোগ চ্যানেল" : "Direct Quick-Connect"}
        </h2>
        <p className="channels-subtitle">
          {language === "bn"
            ? "প্রোডাক্টের তথ্য, মূল্য নিশ্চিতকরণ বা দেশব্যাপী ডেলিভারি সংক্রান্ত পরামর্শের জন্য আপনার পছন্দের মাধ্যম বেছে নিন।"
            : "Choose your preferred direct channel for instant product advice, price confirmation, or nationwide delivery details."}
        </p>
      </div>

      <div className="contact-bento-grid">
        {/* Phone Hotline Card */}
        <div className="bento-card channel-phone">
          <div className="bento-card-top">
            <div className="channel-icon-badge phone-badge">
              <Phone size={19} aria-hidden="true" />
            </div>
            <span className="bento-tag">
              {language === "bn" ? "কাস্টমার হটলাইন" : "Customer Hotline"}
            </span>
          </div>
          <div className="bento-card-content">
            <h3 className="bento-title">{displayPhone}</h3>
            <p className="bento-desc">
              {language === "bn"
                ? "পণ্য অনুসন্ধান, পরামর্শ ও দ্রুত অর্ডারের জন্য সরাসরি কল করুন।"
                : "Direct phone line for urgent inquiries, advice & order confirmation."}
            </p>
          </div>
          <div className="bento-actions-row">
            <a
              href={`tel:${siteConfig.order.phone}`}
              className="bento-pill-btn"
              aria-label="Call Xtream UTD hotline"
            >
              <Phone size={14} aria-hidden="true" />
              <span>{language === "bn" ? "কল করুন" : "Call Now"}</span>
            </a>
            <button
              type="button"
              className="bento-icon-btn"
              onClick={() => copyToClipboard(displayPhone, "phone")}
              aria-label="Copy phone number"
            >
              {copiedKey === "phone" ? (
                <Check size={15} className="text-emerald" aria-hidden="true" />
              ) : (
                <Copy size={15} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Email Support Card */}
        <div className="bento-card channel-email">
          <div className="bento-card-top">
            <div className="channel-icon-badge email-badge">
              <Mail size={19} aria-hidden="true" />
            </div>
            <span className="bento-tag">
              {language === "bn" ? "অফিসিয়াল ইমেইল" : "Official Inquiries"}
            </span>
          </div>
          <div className="bento-card-content">
            <h3 className="bento-title">{displayEmail}</h3>
            <p className="bento-desc">
              {language === "bn"
                ? "ইনভয়েস, বাল্ক ও প্রাতিষ্ঠানিক অর্ডার এবং তথ্যের জন্য ইমেইল করুন।"
                : "For invoices, bulk orders, corporate inquiries and official requests."}
            </p>
          </div>
          <div className="bento-actions-row">
            <a
              href={`mailto:${siteConfig.order.email}`}
              className="bento-pill-btn"
              aria-label="Send email to Xtream UTD"
            >
              <Mail size={14} aria-hidden="true" />
              <span>{language === "bn" ? "ইমেইল পাঠান" : "Email Us"}</span>
            </a>
            <button
              type="button"
              className="bento-icon-btn"
              onClick={() => copyToClipboard(displayEmail, "email")}
              aria-label="Copy email address"
            >
              {copiedKey === "email" ? (
                <Check size={15} className="text-emerald" aria-hidden="true" />
              ) : (
                <Copy size={15} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Dhaka Hub & Delivery Card */}
        <div className="bento-card channel-location">
          <div className="bento-card-top">
            <div className="channel-icon-badge location-badge">
              <MapPin size={19} aria-hidden="true" />
            </div>
            <span className="bento-tag">
              {language === "bn" ? "৬৪ জেলা" : "64 Districts"}
            </span>
          </div>
          <div className="bento-card-content">
            <h3 className="bento-title">
              {language === "bn" ? "মিরপুর-১০, ঢাকা" : siteConfig.business.location}
            </h3>
            <p className="bento-desc">
              {language === "bn"
                ? "ঢাকার ভেতরে ডেলিভারি চার্জ ৭০/- (২৪–৪৮ ঘণ্টা), ঢাকার বাইরে ১৩০/- (৪৮–৭২ ঘণ্টা) সারাদেশে ৬৪ জেলায় ক্যাশ অন ডেলিভারি।"
                : "Inside Dhaka: ৳70 (24–48h). Outside Dhaka: ৳130 (48–72h via Pathao / Steadfast / eCourier) nationwide with Cash on Delivery."}
            </p>
          </div>
          <div className="bento-meta-badge">
            <Sparkles size={13} aria-hidden="true" />
            <span>
              {language === "bn"
                ? "১০০% অথেনটিক প্রোডাক্ট গ্যারান্টি"
                : "100% Authentic Product Guarantee"}
            </span>
          </div>
        </div>

        {/* Operating Hours Card */}
        <div className="bento-card channel-hours">
          <div className="bento-card-top">
            <div className="channel-icon-badge hours-badge">
              <Clock size={19} aria-hidden="true" />
            </div>
            <span className="bento-tag">
              {language === "bn" ? "সময়সূচি" : "Schedule"}
            </span>
          </div>
          <div className="bento-card-content">
            <h3 className="bento-title">{displayHours}</h3>
            <p className="bento-desc">
              {language === "bn"
                ? "সপ্তাহের ৭ দিন কাস্টমার সাপোর্ট সার্ভিস সক্রিয়।"
                : "Customer service available 7 days a week for all inquiries."}
            </p>
          </div>
          <div className="bento-meta-badge">
            <Check size={13} aria-hidden="true" />
            <span>{language === "bn" ? "সপ্তাহের ৭ দিন খোলা" : "7 Days a Week"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
