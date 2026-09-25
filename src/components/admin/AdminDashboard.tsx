"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Globe,
  MapPin,
  Package,
  Save,
  Share2,
  Trash2,
  Truck
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { products as initialProducts } from "@/lib/products";
import type { Product } from "@/lib/product-schema";

type AdminDashboardProps = {
  onLogout: () => void;
};

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"general" | "delivery" | "socials" | "products">("general");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Store General Settings
  const [siteName, setSiteName] = useState<string>(siteConfig.name);
  const [siteDescription, setSiteDescription] = useState<string>(siteConfig.description);
  const [siteContactEmail, setSiteContactEmail] = useState<string>(siteConfig.order.email);
  const [sitePhone, setSitePhone] = useState<string>(siteConfig.order.phone);
  const [siteHours, setSiteHours] = useState<string>(siteConfig.business.hours);

  // Delivery & Location Settings
  const [locationName, setLocationName] = useState<string>(siteConfig.business.location);
  const [deliveryDhaka, setDeliveryDhaka] = useState<string>(siteConfig.business.deliveryDhaka);
  const [deliveryOutside, setDeliveryOutside] = useState<string>(siteConfig.business.deliveryOutside);
  const [deliveryNote, setDeliveryNote] = useState<string>(siteConfig.business.delivery);

  // Social Links
  const [fbUrl, setFbUrl] = useState<string>(siteConfig.socials.facebook);
  const [igUrl, setIgUrl] = useState<string>(siteConfig.socials.instagram);
  const [ytUrl, setYtUrl] = useState<string>(siteConfig.socials.youtube);
  const [fbPageUrl, setFbPageUrl] = useState<string>(siteConfig.business.facebookPageUrl);

  // Products state
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [productSearch, setProductSearch] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const filteredProducts = productList.filter(
    (p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleDeleteProduct = (id: string) => {
    setProductList((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="admin-dashboard-container">
      {/* Top Navbar */}
      <header className="admin-dash-header">
        <div className="admin-dash-header-left">
          <Link href="/" className="admin-store-link">
            <ArrowLeft size={16} />
            <span>Return to Store</span>
          </Link>
          <div className="admin-brand-badge">
            <span className="admin-badge-dot" />
            <span className="admin-brand-title">Xtream UTD Administration</span>
          </div>
        </div>
        <div className="admin-dash-header-right">
          <span className="admin-user-pill">xtreamutd@gmail.com</span>
          <button type="button" onClick={onLogout} className="admin-logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-dash-main">
        {/* Navigation Tabs */}
        <div className="admin-tabs-bar">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "general" ? "is-active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <Globe size={16} />
            <span>General Info</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "delivery" ? "is-active" : ""}`}
            onClick={() => setActiveTab("delivery")}
          >
            <Truck size={16} />
            <span>Delivery & Location</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "socials" ? "is-active" : ""}`}
            onClick={() => setActiveTab("socials")}
          >
            <Share2 size={16} />
            <span>Socials & Channels</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "products" ? "is-active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Package size={16} />
            <span>Product Inventory (${productList.length})</span>
          </button>
        </div>

        {/* Tab 1: General Info */}
        {activeTab === "general" && (
          <form onSubmit={handleSave} className="admin-form-panel">
            <div className="admin-panel-header">
              <div>
                <h2 className="admin-panel-title">Store Identity & Business Information</h2>
                <p className="admin-panel-desc">Manage store metadata, contact details, and customer service hours.</p>
              </div>
              <button type="submit" className="admin-save-btn">
                {saveSuccess ? <Check size={16} /> : <Save size={16} />}
                <span>{saveSuccess ? "Changes Saved!" : "Save Changes"}</span>
              </button>
            </div>

            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-label">Store Brand Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Official Contact Email</label>
                <input
                  type="email"
                  className="admin-input"
                  value={siteContactEmail}
                  onChange={(e) => setSiteContactEmail(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Helpline Phone Number</label>
                <input
                  type="text"
                  className="admin-input"
                  value={sitePhone}
                  onChange={(e) => setSitePhone(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Business / Support Hours</label>
                <input
                  type="text"
                  className="admin-input"
                  value={siteHours}
                  onChange={(e) => setSiteHours(e.target.value)}
                />
              </div>

              <div className="admin-form-group full-width">
                <label className="admin-label">Brand Bio & Meta Description</label>
                <textarea
                  rows={3}
                  className="admin-input"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                />
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Delivery & Location */}
        {activeTab === "delivery" && (
          <form onSubmit={handleSave} className="admin-form-panel">
            <div className="admin-panel-header">
              <div>
                <h2 className="admin-panel-title">Fulfillment & Physical Hub Settings</h2>
                <p className="admin-panel-desc">Configure dispatch hub location, coverage terms, and flat shipping rates.</p>
              </div>
              <button type="submit" className="admin-save-btn">
                {saveSuccess ? <Check size={16} /> : <Save size={16} />}
                <span>{saveSuccess ? "Changes Saved!" : "Save Changes"}</span>
              </button>
            </div>

            <div className="admin-form-grid">
              <div className="admin-form-group full-width">
                <label className="admin-label">Physical Hub / Warehouse Address</label>
                <div className="admin-input-icon-wrap">
                  <MapPin size={16} className="admin-input-icon" />
                  <input
                    type="text"
                    className="admin-input with-icon"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Inside Dhaka Delivery Terms</label>
                <input
                  type="text"
                  className="admin-input"
                  value={deliveryDhaka}
                  onChange={(e) => setDeliveryDhaka(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Outside Dhaka Delivery Terms</label>
                <input
                  type="text"
                  className="admin-input"
                  value={deliveryOutside}
                  onChange={(e) => setDeliveryOutside(e.target.value)}
                />
              </div>

              <div className="admin-form-group full-width">
                <label className="admin-label">Delivery Guarantee Note</label>
                <input
                  type="text"
                  className="admin-input"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                />
              </div>
            </div>
          </form>
        )}

        {/* Tab 3: Socials & Channels */}
        {activeTab === "socials" && (
          <form onSubmit={handleSave} className="admin-form-panel">
            <div className="admin-panel-header">
              <div>
                <h2 className="admin-panel-title">Social Media & Communication Channels</h2>
                <p className="admin-panel-desc">Update brand handles and social community links displayed in the footer and contact hubs.</p>
              </div>
              <button type="submit" className="admin-save-btn">
                {saveSuccess ? <Check size={16} /> : <Save size={16} />}
                <span>{saveSuccess ? "Changes Saved!" : "Save Changes"}</span>
              </button>
            </div>

            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-label">Official Facebook Page URL</label>
                <input
                  type="url"
                  className="admin-input"
                  value={fbPageUrl}
                  onChange={(e) => setFbPageUrl(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Facebook Profile Link</label>
                <input
                  type="url"
                  className="admin-input"
                  value={fbUrl}
                  onChange={(e) => setFbUrl(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Instagram Profile Link</label>
                <input
                  type="url"
                  className="admin-input"
                  value={igUrl}
                  onChange={(e) => setIgUrl(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">YouTube Channel Link</label>
                <input
                  type="url"
                  className="admin-input"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                />
              </div>
            </div>
          </form>
        )}

        {/* Tab 4: Product Inventory */}
        {activeTab === "products" && (
          <div className="admin-form-panel">
            <div className="admin-panel-header">
              <div>
                <h2 className="admin-panel-title">Catalog Inventory Management</h2>
                <p className="admin-panel-desc">Monitor product pricing, stock availability, and featured status.</p>
              </div>
              <div className="admin-prod-top-actions">
                <input
                  type="text"
                  placeholder="Search catalogue items..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>

            <div className="admin-products-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product Title</th>
                    <th>Category</th>
                    <th>Price (BDT)</th>
                    <th>Stock Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="admin-prod-title-cell">
                        <span className="admin-prod-name">{product.title}</span>
                        <span className="admin-prod-slug">{product.slug}</span>
                      </td>
                      <td>
                        <span className="admin-cat-badge">{product.category}</span>
                      </td>
                      <td className="admin-price-cell">৳{product.price.toLocaleString("en-BD")}</td>
                      <td>
                        <span className={`admin-stock-badge ${product.stock === "In stock" ? "in-stock" : product.stock === "Low stock" ? "low-stock" : "out-of-stock"}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="admin-del-btn"
                          title="Delete from catalogue"
                          aria-label={`Delete ${product.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
