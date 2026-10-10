"use client";

import { useState, useRef } from "react";
import { X, Upload, Plus, Trash2, Check, AlertCircle } from "lucide-react";
import type { Product, StockStatus } from "@/domain/product/product-schema";

type ProductEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null; // null means "Create New"
  onSave: (product: Partial<Product>, isNew: boolean) => Promise<boolean>;
  categories: string[];
  suggestedProductNo?: string | number;
};

export function ProductEditModal({
  isOpen,
  onClose,
  product,
  onSave,
  categories,
  suggestedProductNo
}: ProductEditModalProps) {
  const isNew = !product;

  const [productId, setProductId] = useState(() => product?.id || (suggestedProductNo ? String(suggestedProductNo) : ""));
  const [title, setTitle] = useState(() => product?.title || "");
  const [slug, setSlug] = useState(() => product?.slug || "");
  const [category, setCategory] = useState(() => product?.category || categories[0] || "General");
  const [price, setPrice] = useState(() => product?.price || 0);
  const [oldPrice, setOldPrice] = useState(() => product?.old_price || 0);
  const [stock, setStock] = useState<StockStatus>(() => product?.stock || "In stock");
  const [badge, setBadge] = useState(() => (product ? product.badge || "" : "New"));
  const [accent, setAccent] = useState(() => product?.accent || "#00E5FF");
  const [short, setShort] = useState(() => product?.short || "");
  const [coverImage, setCoverImage] = useState(() => product?.cover_image || product?.main_image || "");
  const [galleryImages, setGalleryImages] = useState<string[]>(() => product?.gallery_images || []);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [variantsInput, setVariantsInput] = useState(() => (product?.sizes_or_variants || []).join(", "));
  const [featuresInput, setFeaturesInput] = useState(() => (product?.features || []).join("\n"));
  const [tagsInput, setTagsInput] = useState(() => (product?.tags || []).join(", "));
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>(() => {
    if (product?.specifications) {
      return Object.entries(product.specifications).map(([key, value]) => ({ key, value }));
    }
    return [
      { key: "Material", value: "" },
      { key: "Warranty", value: "7 Days Replacement" }
    ];
  });
  const [featured, setFeatured] = useState(() => Boolean(product?.featured));
  const [newArrival, setNewArrival] = useState(() => (product ? Boolean(product.new_arrival) : true));
  const [bestSeller, setBestSeller] = useState(() => Boolean(product?.best_seller));

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug when creating a new product if slug is untouched
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "catalog");

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload file");
      }

      setCoverImage(data.url);
      if (!galleryImages.includes(data.url)) {
        setGalleryImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    if (!galleryImages.includes(newGalleryUrl.trim())) {
      setGalleryImages((prev) => [...prev, newGalleryUrl.trim()]);
    }
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddSpecRow = () => {
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleUpdateSpec = (idx: number, field: "key" | "value", val: string) => {
    setSpecs((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Product title is required.");
      return;
    }
    if (!slug.trim()) {
      setErrorMsg("Product slug is required.");
      return;
    }
    if (price <= 0) {
      setErrorMsg("Product price must be greater than 0.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    const specsRecord: Record<string, string> = {};
    for (const item of specs) {
      if (item.key.trim() && item.value.trim()) {
        specsRecord[item.key.trim()] = item.value.trim();
      }
    }

    const parsedVariants = variantsInput
      .split(/[,|\n]/)
      .map((v) => v.trim())
      .filter(Boolean);

    const parsedFeatures = featuresInput
      .split("\n")
      .map((f) => f.trim().replace(/^[-*•]\s*/, ""))
      .filter(Boolean);

    const parsedTags = tagsInput
      .split(/[,|\n]/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const finalId = productId.trim() || (product ? product.id : slug.trim() ? `prd-${slug.trim()}` : `prd-${Date.now()}`);

    const payload: Partial<Product> = {
      id: finalId,
      title: title.trim(),
      slug: slug.trim(),
      category: category.trim() || "General",
      price: Number(price),
      old_price: Number(oldPrice) || 0,
      stock,
      badge: badge.trim(),
      accent: accent.trim() || "#00E5FF",
      short: short.trim(),
      cover_image: coverImage.trim(),
      main_image: coverImage.trim(),
      gallery_images: galleryImages.length > 0 ? galleryImages : coverImage ? [coverImage] : [],
      sizes_or_variants: parsedVariants,
      features: parsedFeatures,
      specifications: specsRecord,
      tags: parsedTags,
      featured,
      new_arrival: newArrival,
      best_seller: bestSeller
    };

    const success = await onSave(payload, isNew);
    setSaving(false);

    if (success) {
      onClose();
    } else {
      setErrorMsg("Failed to save product. Please verify fields and try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal-container">
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-header-info">
            <h2 className="admin-modal-title">
              {isNew ? "Create New Product" : `Edit Product: ${product?.title}`}
            </h2>
            <p className="admin-modal-subtitle">
              {isNew
                ? "Enter product details to add a new item into the live catalogue."
                : "Modify pricing, inventory stock, media galleries, and specifications."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-modal-close-btn" aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="admin-modal-error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-modal-form-grid">
            {/* Left Column: Core Info & Media */}
            <div className="admin-modal-col">
              <h3 className="admin-section-heading">Basic Information</h3>

              <div className="admin-form-group">
                <label className="admin-label">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7-In-1 Multifunctional Cleaning Brush"
                  className="admin-input"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Product No 📍 (ID) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 28"
                    className="admin-input"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Product Slug 📍 *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. multifunctional-cleaning-brush"
                    className="admin-input"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Category *</label>
                <input
                  type="text"
                  list="category-suggestions"
                  required
                  placeholder="e.g. Computer Accessories"
                  className="admin-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <datalist id="category-suggestions">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Selling Price (BDT ৳) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="255"
                    className="admin-input"
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Original Price (Strikethrough ৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="350"
                    className="admin-input"
                    value={oldPrice || ""}
                    onChange={(e) => setOldPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Stock Status</label>
                  <select
                    className="admin-select"
                    value={stock}
                    onChange={(e) => setStock(e.target.value as StockStatus)}
                  >
                    <option value="In stock">In stock (Available)</option>
                    <option value="Low stock">Low stock (Limited)</option>
                    <option value="Out of stock">Out of stock (Sold Out)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Badge Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Flagship, Trending"
                    className="admin-input"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Concise overview displayed in card previews..."
                  className="admin-textarea"
                  value={short}
                  onChange={(e) => setShort(e.target.value)}
                />
              </div>

              <h3 className="admin-section-heading" style={{ marginTop: "16px" }}>
                Product Imagery
              </h3>

              <div className="admin-form-group">
                <label className="admin-label">Cover / Main Image URL</label>
                <div className="admin-image-input-group">
                  <input
                    type="url"
                    placeholder="https://... or upload below"
                    className="admin-input"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="admin-upload-btn"
                  >
                    <Upload size={15} />
                    <span>{uploading ? "Uploading..." : "Upload File"}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </div>

                {coverImage && (
                  <div className="admin-image-preview-box">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverImage} alt="Cover preview" className="admin-cover-preview-img" />
                    <span className="admin-preview-label">Cover Image Preview</span>
                  </div>
                )}
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Gallery Images</label>
                <div className="admin-image-input-group">
                  <input
                    type="url"
                    placeholder="Add gallery image URL..."
                    className="admin-input"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                  />
                  <button type="button" onClick={handleAddGalleryUrl} className="admin-btn-secondary">
                    <Plus size={15} />
                    <span>Add URL</span>
                  </button>
                </div>

                {galleryImages.length > 0 && (
                  <div className="admin-gallery-preview-grid">
                    {galleryImages.map((img, i) => (
                      <div key={i} className="admin-gallery-thumb-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Gallery ${i}`} className="admin-gallery-thumb-img" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(i)}
                          className="admin-thumb-del-btn"
                          title="Remove image"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Variants, Specifications & Flags */}
            <div className="admin-modal-col">
              <h3 className="admin-section-heading">Variants & Options</h3>

              <div className="admin-form-group">
                <label className="admin-label">
                  Available Variants / Colors (Separated by commas)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blue, Pink, Black, Silver"
                  className="admin-input"
                  value={variantsInput}
                  onChange={(e) => setVariantsInput(e.target.value)}
                />
                <span className="admin-field-hint">
                  Customers will be able to select and specify individual quantities for each variant.
                </span>
              </div>

              <h3 className="admin-section-heading" style={{ marginTop: "16px" }}>
                Specifications
              </h3>

              <div className="admin-specs-builder">
                {specs.map((item, idx) => (
                  <div key={idx} className="admin-spec-row">
                    <input
                      type="text"
                      placeholder="Property (e.g. Material)"
                      className="admin-input"
                      value={item.key}
                      onChange={(e) => handleUpdateSpec(idx, "key", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. Aluminum)"
                      className="admin-input"
                      value={item.value}
                      onChange={(e) => handleUpdateSpec(idx, "value", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="admin-spec-del-btn"
                      title="Remove specification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={handleAddSpecRow} className="admin-add-spec-btn">
                  <Plus size={14} />
                  <span>Add Specification Row</span>
                </button>
              </div>

              <h3 className="admin-section-heading" style={{ marginTop: "16px" }}>
                Features & Highlights
              </h3>

              <div className="admin-form-group">
                <label className="admin-label">Feature Bullet Points (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="• 7-in-1 Multifunctional design&#10;• High density soft brush&#10;• Built-in keycap puller"
                  className="admin-textarea"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Search Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="cleaner, brush, keyboard, gadgets, accessories"
                  className="admin-input"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              <h3 className="admin-section-heading" style={{ marginTop: "16px" }}>
                Promotional Badges & Accent
              </h3>

              <div className="admin-flags-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                  />
                  <span>Featured Product (Highlight on home/catalogue)</span>
                </label>

                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={newArrival}
                    onChange={(e) => setNewArrival(e.target.checked)}
                  />
                  <span>New Arrival Badge</span>
                </label>

                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={bestSeller}
                    onChange={(e) => setBestSeller(e.target.checked)}
                  />
                  <span>Best Seller Badge</span>
                </label>
              </div>

              <div className="admin-form-group" style={{ marginTop: "14px" }}>
                <label className="admin-label">Theme Accent Color</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="color"
                    className="admin-color-picker"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                  />
                  <input
                    type="text"
                    className="admin-input"
                    style={{ width: "120px" }}
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="admin-modal-footer">
            <button type="button" onClick={onClose} className="admin-btn-cancel" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-save" disabled={saving}>
              {saving ? (
                <span>Saving Product...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>{isNew ? "Create Product" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
