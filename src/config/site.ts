export const siteConfig = {
  name: "Xtream UTD",
  description:
    "Trending gadgets and accessories for your desk, home and everyday life.",
  trustLine:
    "Quality products - Affordable prices - Delivery across Bangladesh",
  url: "https://example.com",
  order: {
    primaryLabel: "Order Now",
    messengerUrl: "https://m.me/xtreamutd",
    whatsappUrl: "https://wa.me/8801622001879",
    phone: "01622001879",
    email: "xtreamutd@gmail.com"
  },
  socials: {
    facebook: "https://www.facebook.com/xtreamutd",
    instagram: "https://www.instagram.com/xtream_utd",
    youtube: "https://www.youtube.com/channel/UCE17s5QKd7QbuRE2dezkxxQ"
  },
  business: {
    facebookPageUrl: "https://www.facebook.com/xtreamutd",
    location: "Mirpur-10, Dhaka, Bangladesh",
    hours: "Everyday: 9:00 AM – 10:00 PM (BST)",
    deliveryDhaka: "Inside Dhaka: ৳70 (24–48 hours)",
    deliveryOutside: "Outside Dhaka: ৳130 (48–72 hours)",
    delivery: "Inside Dhaka (24–48h, ৳70) & nationwide delivery across all 64 districts in Bangladesh (48–72h, ৳130) with Cash on Delivery.",
    returns: "Home delivery available nationwide within 2–3 days. Order will be confirmed after the order processing message from seller."
  },
  categories: [
    "All Products",
    "New Arrivals",
    "Best Sellers",
    "Mobile Accessories",
    "Computer Accessories",
    "Desk Accessories",
    "Home and Lifestyle",
    "Decorative Lights",
    "Audio Products",
    "Smart Gadgets",
    "Travel Accessories",
    "Gift Items"
  ]
} as const;

export type SiteConfig = typeof siteConfig;
