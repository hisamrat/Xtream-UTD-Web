"use client";

import { Check, Clock, Copy, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { contactChannels as copy } from "@/content/contact";
import { deliveryParams } from "@/features/brand/trust-points";
import { useI18n } from "@/i18n/LanguageProvider";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";

export function ContactChannels() {
  const { localize } = useI18n();
  const clipboard = useCopyToClipboard();
  const { phone, email } = siteConfig.order;

  const copyButton = (value: string, key: string, label: string) => (
    <button type="button" className="bento-icon-btn" onClick={() => void clipboard.copy(value, key)} aria-label={label}>
      {clipboard.isCopied(key) ? <Check size={15} className="text-emerald" aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
    </button>
  );

  return (
    <div className="contact-channels-container">
      <div className="channels-header">
        <div className="live-status-pill">
          <span className="live-dot" aria-hidden="true" />
          <span>{localize(copy.statusOnline)}</span>
          <span className="status-divider" aria-hidden="true">
            •
          </span>
          <span className="response-time">{localize(copy.responseTime)}</span>
        </div>
        <h2 className="channels-title">{localize(copy.title)}</h2>
        <p className="channels-subtitle">{localize(copy.subtitle)}</p>
      </div>

      <div className="contact-bento-grid">
        <div className="bento-card channel-phone">
          <div className="bento-card-top">
            <div className="channel-icon-badge phone-badge">
              <Phone size={19} aria-hidden="true" />
            </div>
            <span className="bento-tag">{localize(copy.phoneTag)}</span>
          </div>
          <div className="bento-card-content">
            <h3 className="bento-title">{phone}</h3>
            <p className="bento-desc">{localize(copy.phoneDesc)}</p>
          </div>
          <div className="bento-actions-row">
            <a href={`tel:${phone}`} className="bento-pill-btn" aria-label={localize(copy.phoneAria)}>
              <Phone size={14} aria-hidden="true" />
              <span>{localize(copy.phoneAction)}</span>
            </a>
            {copyButton(phone, "phone", localize(copy.phoneCopyAria))}
          </div>
        </div>

        <div className="bento-card channel-email">
          <div className="bento-card-top">
            <div className="channel-icon-badge email-badge">
              <Mail size={19} aria-hidden="true" />
            </div>
            <span className="bento-tag">{localize(copy.emailTag)}</span>
          </div>
          <div className="bento-card-content">
            <h3 className="bento-title">{email}</h3>
            <p className="bento-desc">{localize(copy.emailDesc)}</p>
          </div>
          <div className="bento-actions-row">
            <a href={`mailto:${email}`} className="bento-pill-btn" aria-label={localize(copy.emailAria)}>
              <Mail size={14} aria-hidden="true" />
              <span>{localize(copy.emailAction)}</span>
            </a>
            {copyButton(email, "email", localize(copy.emailCopyAria))}
          </div>
        </div>

        <div className="bento-card channel-location">
          <div className="bento-card-top">
            <div className="channel-icon-badge location-badge">
              <MapPin size={19} aria-hidden="true" />
            </div>
            <span className="bento-tag">{localize(copy.locationTag, deliveryParams)}</span>
          </div>
          <div className="bento-card-content">
            <h3 className="bento-title">{localize(siteConfig.business.location)}</h3>
            <p className="bento-desc">{localize(copy.locationDesc, deliveryParams)}</p>
          </div>
          <div className="bento-meta-badge">
            <Sparkles size={13} aria-hidden="true" />
            <span>{localize(copy.locationBadge)}</span>
          </div>
        </div>

        <div className="bento-card channel-hours">
          <div className="bento-card-top">
            <div className="channel-icon-badge hours-badge">
              <Clock size={19} aria-hidden="true" />
            </div>
            <span className="bento-tag">{localize(copy.hoursTag)}</span>
          </div>
          <div className="bento-card-content">
            <h3 className="bento-title">{localize(siteConfig.business.hours)}</h3>
            <p className="bento-desc">{localize(copy.hoursDesc)}</p>
          </div>
          <div className="bento-meta-badge">
            <Check size={13} aria-hidden="true" />
            <span>{localize(copy.hoursBadge)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
