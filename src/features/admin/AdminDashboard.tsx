"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlignLeft,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Share2,
  Trash2,
  Truck,
  Edit,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Store,
  Clock
} from "lucide-react";
import type { Product } from "@/domain/product/product-schema";
import type { StoreSettings } from "@/domain/settings/settings-schema";
import { ProductEditModal } from "./ProductEditModal";

type AdminDashboardProps = {
  onLogout: () => void;
};

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"products" | "general" | "delivery" | "socials">("products");

  // Sidebar collapse toggle state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Table pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Store Settings state
  const [settings, setSettings] = useState<StoreSettings>({
    siteName: "Xtream UTD",
    siteDescription: "Trending gadgets and accessories for your desk, home and everyday life.",
    siteContactEmail: "xtreamutd@gmail.com",
    sitePhone: "01622001879",
    siteHours: "Everyday: 9:00 AM – 10:00 PM (BST)",
    whatsappUrl: "https://wa.me/8801622001879",
    messengerUrl: "https://m.me/xtreamutd",
    locationName: "Mirpur-10, Dhaka, Bangladesh",
    deliveryDhaka: "৳70 (24–48 Hours)",
    deliveryOutside: "৳130 (48–72 Hours)",
    deliveryNote: "Cash on delivery available nationwide. Orders confirmed after phone/message confirmation.",
    courierPartners: ["Pathao", "Steadfast", "eCourier"],
    fbPageUrl: "https://www.facebook.com/xtreamutd",
    fbUrl: "https://www.facebook.com/xtreamutd",
    igUrl: "https://www.instagram.com/xtream_utd",
    ytUrl: "https://www.youtube.com/channel/UCE17s5QKd7QbuRE2dezkxxQ"
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Reload products from API
  const reloadProducts = async (fresh = true) => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/admin/products${fresh ? "?fresh=true" : ""}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("[Admin] Failed to load products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [prodRes, setRes] = await Promise.all([
          fetch("/api/admin/products?fresh=true"),
          fetch("/api/admin/settings")
        ]);
        const prodData = await prodRes.json();
        const setData = await setRes.json();
        if (!ignore) {
          if (prodData.success && Array.isArray(prodData.products)) {
            setProducts(prodData.products);
          }
          if (setData.success && setData.settings) {
            setSettings(setData.settings);
          }
        }
      } catch (err) {
        console.error("[Admin] Failed to load data:", err);
      } finally {
        if (!ignore) {
          setLoadingProducts(false);
        }
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, []);

  // Compute distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return Array.from(set).sort();
  }, [products]);

  // Compute stats
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.stock === "In stock").length;
    const lowStock = products.filter((p) => p.stock === "Low stock").length;
    const outOfStock = products.filter((p) => p.stock === "Out of stock").length;
    return { total, inStock, lowStock, outOfStock, categoriesCount: categories.length };
  }, [products, categories]);

  // Compute next suggested numeric Product ID
  const suggestedProductNo = useMemo(() => {
    let max = 0;
    for (const p of products) {
      const num = parseInt(p.id, 10);
      if (!isNaN(num) && num > max) max = num;
    }
    return max > 0 ? String(max + 1) : String(products.length + 1);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = productSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);

      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchStock = stockFilter === "all" || p.stock === stockFilter;

      return matchSearch && matchCategory && matchStock;
    });
  }, [products, productSearch, categoryFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Paginated product slice
  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, safeCurrentPage, pageSize]);

  // Handle save from modal
  const handleSaveProduct = async (productData: Partial<Product>, isNew: boolean): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isNew ? "create" : "update",
          product: productData,
          productId: productData.id
        })
      });

      const data = await res.json();
      if (data.success) {
        const sheetInfo = data.sheetSync?.synced ? " & auto-saved to Google Sheet!" : "!";
        setStatusMessage({
          type: "success",
          text: isNew
            ? `Product "${productData.title}" created${sheetInfo}`
            : `Product "${productData.title}" updated${sheetInfo}`
        });
        setTimeout(() => setStatusMessage(null), 5000);
        await reloadProducts();
        return true;
      }
      return false;
    } catch (err) {
      console.error("[Admin] Save product failed:", err);
      return false;
    }
  };

  // Handle delete
  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will also remove it from Google Sheet.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          productId: id
        })
      });

      const data = await res.json();
      if (data.success) {
        const sheetInfo = data.sheetSync?.synced ? " and removed from Google Sheet." : ".";
        setStatusMessage({ type: "success", text: `Product "${title}" deleted${sheetInfo}` });
        setTimeout(() => setStatusMessage(null), 5000);
        await reloadProducts();
      } else {
        alert(data.error || "Failed to delete product.");
      }
    } catch (err) {
      console.error("[Admin] Delete product failed:", err);
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setStatusMessage({ type: "success", text: "Store settings saved and published successfully!" });
        setTimeout(() => {
          setSaveSuccess(false);
          setStatusMessage(null);
        }, 4000);
      }
    } catch (err) {
      console.error("[Admin] Failed to save settings:", err);
      setStatusMessage({ type: "error", text: "Failed to save settings. Please try again." });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="admin-saas-layout">
      {/* ------------------------------------------------------------- */}
      {/* Left Navigation Sidebar (Dashboard Theme)                      */}
      {/* ------------------------------------------------------------- */}
      <aside className={`admin-saas-sidebar ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
        {/* Admin Profile Header */}
        <div className="admin-sidebar-header">
          {!isSidebarCollapsed && (
            <div className="admin-sidebar-brand-wrap">
              <div className="admin-user-avatar">
                <span>XS</span>
              </div>
              <div className="admin-user-details">
                <span className="admin-user-name">Xtream Store Admin</span>
                <span className="admin-user-email">xtreamutd@gmail.com</span>
              </div>
            </div>
          )}
          <button
            type="button"
            className="admin-sidebar-toggle-btn"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            title={isSidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
          >
            <AlignLeft size={18} />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="admin-sidebar-nav-section">
          <span className="admin-nav-category-title">MAIN MENU</span>
          <nav className="admin-sidebar-nav">
            <button
              type="button"
              className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
              title="Products Catalog"
            >
              <Package size={18} className="admin-nav-icon" />
              <span className="admin-nav-label">Products Catalog</span>
              <span className="admin-nav-counter">{products.length}</span>
            </button>

            <button
              type="button"
              className={`admin-nav-item ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
              title="Store Information"
            >
              <Store size={18} className="admin-nav-icon" />
              <span className="admin-nav-label">Store Information</span>
            </button>

            <button
              type="button"
              className={`admin-nav-item ${activeTab === "delivery" ? "active" : ""}`}
              onClick={() => setActiveTab("delivery")}
              title="Fulfillment & Hub"
            >
              <Truck size={18} className="admin-nav-icon" />
              <span className="admin-nav-label">Fulfillment & Hub</span>
            </button>

            <button
              type="button"
              className={`admin-nav-item ${activeTab === "socials" ? "active" : ""}`}
              onClick={() => setActiveTab("socials")}
              title="Socials & Channels"
            >
              <Share2 size={18} className="admin-nav-icon" />
              <span className="admin-nav-label">Socials & Channels</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-footer-btn store-link" title="Return to Store">
            <ArrowLeft size={16} />
            <span>Return to Store</span>
          </Link>

          <button type="button" onClick={onLogout} className="admin-footer-btn logout-btn" title="Log Out">
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* Main Content Viewport                                          */}
      {/* ------------------------------------------------------------- */}
      <div className="admin-saas-main">
        {/* Top Navbar */}
        <header className="admin-saas-topbar">
          <div className="admin-topbar-left">
            <h1 className="admin-topbar-title">
              {activeTab === "products" && "Product Catalog & Inventory"}
              {activeTab === "general" && "Store Profile & Contact Settings"}
              {activeTab === "delivery" && "Fulfillment, Shipping & Hub"}
              {activeTab === "socials" && "Social Communities & Links"}
            </h1>
            <div className="admin-topbar-breadcrumb">
              <span>Admin</span>
              <span>/</span>
              <span className="current">
                {activeTab === "products" && "Website Product Information"}
                {activeTab === "general" && "General Settings"}
                {activeTab === "delivery" && "Fulfillment"}
                {activeTab === "socials" && "Social Channels"}
              </span>
            </div>
          </div>

          <div className="admin-topbar-right">
            {activeTab === "products" && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsModalOpen(true);
                }}
                className="admin-primary-add-btn"
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </header>

        {/* Global Toast Notification */}
        {statusMessage && (
          <div className={`admin-toast-banner ${statusMessage.type === "success" ? "is-success" : "is-error"}`}>
            {statusMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab 1: Products Inventory */}
        {activeTab === "products" && (
          <div className="admin-content-inner">
            {/* 4 Metric KPI Cards (matching reference design) */}
            <div className="admin-saas-kpi-grid">
              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap icon-blue">
                  <Package size={22} />
                </div>
                <div className="admin-kpi-content">
                  <span className="admin-kpi-number">{stats.total}</span>
                  <span className="admin-kpi-label">Total Catalog Products</span>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap icon-green">
                  <CheckCircle2 size={22} />
                </div>
                <div className="admin-kpi-content">
                  <span className="admin-kpi-number text-green">{stats.inStock}</span>
                  <span className="admin-kpi-label">In Stock Items</span>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap icon-amber">
                  <Clock size={22} />
                </div>
                <div className="admin-kpi-content">
                  <span className="admin-kpi-number text-amber">{stats.lowStock}</span>
                  <span className="admin-kpi-label">Low Stock (Alert)</span>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon-wrap icon-red">
                  <AlertCircle size={22} />
                </div>
                <div className="admin-kpi-content">
                  <span className="admin-kpi-number text-red">{stats.outOfStock}</span>
                  <span className="admin-kpi-label">Out of Stock</span>
                </div>
              </div>
            </div>

            {/* Main Products Table Container (Card Box) */}
            <div className="admin-saas-card-box">
              {/* Filter and Search Bar */}
              <div className="admin-card-toolbar">
                <div className="admin-saas-search">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by title, slug, or ID..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="saas-search-input"
                  />
                </div>

                <div className="admin-card-filters">
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="admin-saas-select"
                  >
                    <option value="all">All Categories ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={stockFilter}
                    onChange={(e) => {
                      setStockFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="admin-saas-select"
                  >
                    <option value="all">All Stock Status</option>
                    <option value="In stock">In stock</option>
                    <option value="Low stock">Low stock</option>
                    <option value="Out of stock">Out of stock</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => reloadProducts(true)}
                    disabled={loadingProducts}
                    className="admin-reload-btn"
                    title="Reload fresh data from Google Sheet"
                  >
                    <RefreshCw size={15} className={loadingProducts ? "animate-spin" : ""} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="admin-table-responsive">
                <table className="admin-saas-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px", textAlign: "center", whiteSpace: "nowrap" }}>Sr No</th>
                      <th style={{ width: "115px", whiteSpace: "nowrap" }}>Product No 📍</th>
                      <th>Product Details</th>
                      <th>Category</th>
                      <th>Price (BDT)</th>
                      <th>Stock</th>
                      <th>Badge</th>
                      <th style={{ textAlign: "right", width: "110px", whiteSpace: "nowrap" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="admin-empty-cell">
                          {loadingProducts ? "Loading catalog from database..." : "No products found matching criteria."}
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((p, index) => {
                        const srNo = (safeCurrentPage - 1) * pageSize + index + 1;
                        return (
                          <tr key={p.id}>
                            {/* Sr No */}
                            <td style={{ textAlign: "center", color: "#64748b", fontWeight: "700", fontSize: "12.5px" }}>
                              {srNo}
                            </td>

                            {/* Product ID */}
                            <td style={{ whiteSpace: "nowrap" }}>
                              <span className="admin-id-pill">{p.id}</span>
                            </td>

                          {/* Product Name & Thumbnail */}
                          <td>
                            <div className="admin-product-cell">
                              <div className="admin-prod-thumb">
                                {p.cover_image ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={p.cover_image} alt={p.title} />
                                ) : (
                                  <Package size={18} className="placeholder-icon" />
                                )}
                              </div>
                              <div className="admin-prod-info">
                                <span className="admin-prod-title">{p.title}</span>
                                <span className="admin-prod-slug">{p.slug}</span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td>
                            <span className="admin-cat-pill">{p.category}</span>
                          </td>

                          {/* Price */}
                          <td>
                            <div className="admin-price-box">
                              <span className="admin-price-current">৳{p.price.toLocaleString("en-BD")}</span>
                              {p.old_price > p.price && (
                                <span className="admin-price-old">৳{p.old_price.toLocaleString("en-BD")}</span>
                              )}
                            </div>
                          </td>

                          {/* Stock Status */}
                          <td>
                            <span
                              className={`admin-status-badge ${
                                p.stock === "In stock"
                                  ? "badge-in-stock"
                                  : p.stock === "Low stock"
                                  ? "badge-low-stock"
                                  : "badge-out-stock"
                              }`}
                            >
                              <span className="status-dot" />
                              {p.stock}
                            </span>
                          </td>

                          {/* Badge */}
                          <td>
                            {p.badge ? <span className="admin-badge-label">{p.badge}</span> : <span className="text-muted">-</span>}
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <div className="admin-actions-group">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsModalOpen(true);
                                }}
                                className="admin-action-btn edit"
                                title="Edit Product Info"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id, p.title)}
                                className="admin-action-btn delete"
                                title="Delete Product"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            <div className="admin-pagination-container">
              <div className="admin-pagination-info">
                Showing{" "}
                <strong>
                  {filteredProducts.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(safeCurrentPage * pageSize, filteredProducts.length)}
                </strong>{" "}
                of <strong>{filteredProducts.length}</strong> products
              </div>

              <div className="admin-pagination-controls">
                <div className="admin-page-size-wrap">
                  <span className="admin-page-size-label">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="admin-page-size-select"
                    aria-label="Products per page"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="admin-pagination-nav">
                  <button
                    type="button"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="admin-page-btn nav-btn"
                    title="Previous Page"
                  >
                    <ChevronLeft size={15} />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`admin-page-btn num-btn ${safeCurrentPage === pageNum ? "active" : ""}`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="admin-page-btn nav-btn"
                    title="Next Page"
                  >
                    <span>Next</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Table Footer info */}
            <div className="admin-table-footer">
              <span>Total catalog: {products.length} products</span>
              <span className="sheet-sync-status">🟢 Google Sheet Connected (`Website Product Information`)</span>
            </div>
            </div>
          </div>
        )}

        {/* Tab 2: Store Info Settings */}
        {activeTab === "general" && (
          <form onSubmit={handleSaveSettings} className="admin-content-inner">
            <div className="admin-saas-card-box form-card">
              <div className="form-card-header">
                <div>
                  <h2 className="form-card-title">General Store & Contact Information</h2>
                  <p className="form-card-desc">Configure brand bio, helpline numbers, email and business hours.</p>
                </div>
                <button type="submit" disabled={savingSettings} className="admin-primary-add-btn">
                  {saveSuccess ? <Check size={16} /> : <Save size={16} />}
                  <span>{saveSuccess ? "Saved!" : savingSettings ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>

              <div className="admin-form-grid">
                <div className="form-field">
                  <label>Store / Brand Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Helpline Phone Number</label>
                  <input
                    type="text"
                    value={settings.sitePhone}
                    onChange={(e) => setSettings({ ...settings, sitePhone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Support Email Address</label>
                  <input
                    type="email"
                    value={settings.siteContactEmail}
                    onChange={(e) => setSettings({ ...settings, siteContactEmail: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Business / Support Hours</label>
                  <input
                    type="text"
                    value={settings.siteHours}
                    onChange={(e) => setSettings({ ...settings, siteHours: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>WhatsApp Direct Link</label>
                  <input
                    type="url"
                    value={settings.whatsappUrl}
                    onChange={(e) => setSettings({ ...settings, whatsappUrl: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Facebook Messenger Link</label>
                  <input
                    type="url"
                    value={settings.messengerUrl}
                    onChange={(e) => setSettings({ ...settings, messengerUrl: e.target.value })}
                  />
                </div>

                <div className="form-field full-col">
                  <label>Store Description / Bio</label>
                  <textarea
                    rows={3}
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Tab 3: Delivery & Hub */}
        {activeTab === "delivery" && (
          <form onSubmit={handleSaveSettings} className="admin-content-inner">
            <div className="admin-saas-card-box form-card">
              <div className="form-card-header">
                <div>
                  <h2 className="form-card-title">Fulfillment & Physical Hub Settings</h2>
                  <p className="form-card-desc">Configure dispatch hub location, coverage terms, and flat shipping rates.</p>
                </div>
                <button type="submit" disabled={savingSettings} className="admin-primary-add-btn">
                  {saveSuccess ? <Check size={16} /> : <Save size={16} />}
                  <span>{saveSuccess ? "Saved!" : savingSettings ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>

              <div className="admin-form-grid">
                <div className="form-field full-col">
                  <label>Physical Hub / Warehouse Address</label>
                  <input
                    type="text"
                    value={settings.locationName}
                    onChange={(e) => setSettings({ ...settings, locationName: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Inside Dhaka Delivery Terms</label>
                  <input
                    type="text"
                    value={settings.deliveryDhaka}
                    onChange={(e) => setSettings({ ...settings, deliveryDhaka: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Outside Dhaka Delivery Terms</label>
                  <input
                    type="text"
                    value={settings.deliveryOutside}
                    onChange={(e) => setSettings({ ...settings, deliveryOutside: e.target.value })}
                  />
                </div>

                <div className="form-field full-col">
                  <label>Delivery Guarantee Note</label>
                  <input
                    type="text"
                    value={settings.deliveryNote}
                    onChange={(e) => setSettings({ ...settings, deliveryNote: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Tab 4: Socials */}
        {activeTab === "socials" && (
          <form onSubmit={handleSaveSettings} className="admin-content-inner">
            <div className="admin-saas-card-box form-card">
              <div className="form-card-header">
                <div>
                  <h2 className="form-card-title">Social Media & Communication Channels</h2>
                  <p className="form-card-desc">Update brand handles and social community links displayed in the footer and contact hubs.</p>
                </div>
                <button type="submit" disabled={savingSettings} className="admin-primary-add-btn">
                  {saveSuccess ? <Check size={16} /> : <Save size={16} />}
                  <span>{saveSuccess ? "Saved!" : savingSettings ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>

              <div className="admin-form-grid">
                <div className="form-field">
                  <label>Official Facebook Page URL</label>
                  <input
                    type="url"
                    value={settings.fbPageUrl}
                    onChange={(e) => setSettings({ ...settings, fbPageUrl: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Facebook Profile Link</label>
                  <input
                    type="url"
                    value={settings.fbUrl}
                    onChange={(e) => setSettings({ ...settings, fbUrl: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Instagram Profile Link</label>
                  <input
                    type="url"
                    value={settings.igUrl}
                    onChange={(e) => setSettings({ ...settings, igUrl: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>YouTube Channel Link</label>
                  <input
                    type="url"
                    value={settings.ytUrl}
                    onChange={(e) => setSettings({ ...settings, ytUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Product Edit / Create Modal */}
      {isModalOpen && (
        <ProductEditModal
          key={editingProduct ? editingProduct.id : "new"}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onSave={handleSaveProduct}
          categories={categories}
          suggestedProductNo={suggestedProductNo}
        />
      )}
    </div>
  );
}
