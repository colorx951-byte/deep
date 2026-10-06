/* =====================================================================
   DEEP ENTERPRISES — SITE CONTENT
   ---------------------------------------------------------------------
   Edit this file to change everything on the website.
   Image paths are relative to the /assets/images folder.
   ===================================================================== */

window.SITE = {
  company: {
    name: "Deep Enterprises",
    tagline: "Fire Safety Solution & Store",
    slogan: "Complete fire & safety solutions, ready when you need them.",
    logo: "brand/logo.svg",
    favicon: "brand/favicon.svg",
    topStrip: "Fire & Safety Products  •  Serving Customers Across India",
  },

  theme: {
    primary: "#d32f2f",    // fire red
    secondary: "#1a1a2e",  // deep navy
    accent: "#ff8f00",     // amber
    font: "'Poppins', system-ui, sans-serif",
  },

  contactBar: {
    phone: "+91 74590 25437",
    whatsapp: "917459025437",
  },

  nav: [
    { label: "Home", target: "hero" },
    { label: "About Us", target: "about" },
    { label: "Products", target: "products" },
    { label: "Services", target: "services" },
    { label: "Contact", target: "contact" },
  ],

  /* ---------- Hero (single animated full-screen section) ---------- */
  hero: {
    // Optional faint background image behind the animation. Leave "" for pure animation.
    image: "hero/hero1.svg",
    title: "Complete Fire & Safety Solutions, Ready When You Need Them.",
    subtitle: "Deep Enterprises supplies a wide range of fire fighting and safety products for commercial, industrial, institutional and other safety requirements, with supply support for customers across India.",
    buttons: [
      { label: "View Products", target: "products", style: "primary" },
      { label: "Get a Quote", target: "contact", style: "outline" },
    ],
    categoriesStrip: "Fire Extinguishers • Fire Fighting Equipment • Hydrant & Hose Products • Fire Alarm & Detection • Suppression Solutions • Safety Equipment & More",
  },

  /* ---------- About ---------- */
  about: {
    heading: "Protecting What Matters with the Right Fire & Safety Products.",
    text: [
      "Deep Enterprises is a fire and safety products company based in Jhansi, Uttar Pradesh, serving customers across India. We provide a broad range of fire fighting equipment, fire safety products and related solutions for varied commercial, industrial, institutional and other requirements.",
      "Our approach is simple: understand the requirement, help identify suitable products, coordinate the supply and keep the buying process straightforward.",
    ],
    image: "about/about.svg",
    stats: [
      { value: "10+", label: "Product categories" },
      { value: "Pan-India", label: "Supply reach" },
      { value: "100%", label: "Requirement-focused" },
    ],
    glance: {
      heading: "Deep Enterprises at a Glance",
      items: [
        { k: "Business", v: "Fire Safety Solution & Store" },
        { k: "Proprietor", v: "Deepak Singh" },
        { k: "Base", v: "Jhansi, Uttar Pradesh" },
        { k: "Reach", v: "Serving customers across India" },
        { k: "Focus", v: "Fire fighting equipment, fire safety products & related requirements" },
        { k: "Model", v: "Requirement → quotation → order coordination → supply" },
      ],
    },
  },

  /* ---------- Products (category cards) ---------- */
  products: {
    heading: "Explore Our Product Range",
    subheading: "A broad, organised catalogue of fire fighting, fire protection and safety products. Share a product, quantity or BOQ and our team will respond with availability and quotation.",
    note: "Product availability, brands, specifications, sizes and quantities may vary based on the requirement. For a complete list, contact our sales team.",
    items: [
      { title: "Fire Extinguishers", description: "Portable and specialized extinguishers for different fire risks and applications.", image: "products/extinguishers.jpg" },
      { title: "Fire Fighting Equipment", description: "Essential equipment used for fire response and firefighting operations.", image: "products/equipment.jpg" },
      { title: "Fire Hose, Reels & Fittings", description: "Hoses, couplings, reels, cabinets, adaptors, nozzles and related accessories.", image: "products/hose.jpg" },
      { title: "Hydrant & Water-Based Systems", description: "Hydrant components, valves and associated fire water system equipment.", image: "products/hydrant.jpg" },
      { title: "Sprinkler & Foam Equipment", description: "Sprinklers, foam equipment and related fire protection components.", image: "products/sprinkler.jpg" },
      { title: "Fire Pumps & Accessories", description: "Pumps and accessories used as part of fire-fighting water systems.", image: "products/pumps.jpg" },
      { title: "Fire Alarm & Detection", description: "Alarm, detection and related fire safety products, subject to requirement.", image: "products/alarm.jpg" },
      { title: "Fire Suppression Solutions", description: "Specialized suppression products and systems for specific applications.", image: "products/suppression.jpg" },
      { title: "Safety PPE & Rescue Equipment", description: "Personal protective equipment, emergency and rescue-related safety products.", image: "products/ppe.jpg" },
      { title: "Signage & Fire Safety Accessories", description: "Safety signs, stands, cabinets and other supporting accessories.", image: "products/signage.jpg" },
    ],
  },

  /* ---------- Services (process steps) ---------- */
  services: {
    heading: "More Than Products. Support That Makes Procurement Easier.",
    subheading: "Deep Enterprises combines a broad fire and safety product range with practical support throughout the requirement and supply process.",
    items: [
      { title: "Fire & Safety Product Supply", description: "Supply of a broad range of fire fighting, fire protection and safety products for different requirements." },
      { title: "Requirement-Based Assistance", description: "Share your application, product list, image, specification or quantity and our team can help identify the relevant product category." },
      { title: "Bulk & Project Requirements", description: "Support for larger-quantity, recurring, institutional and project-based product requirements." },
      { title: "Quotation & Order Coordination", description: "Clear communication on requirement details, pricing, availability and order coordination." },
      { title: "Sourcing Support", description: "For products with specific specifications, share your requirement for availability and sourcing discussion." },
      { title: "Delivery Coordination", description: "Support in coordinating dispatch and delivery requirements based on order and location." },
    ],
    steps: {
      heading: "A Simple Requirement-to-Supply Process",
      items: [
        { n: "01", title: "Share Requirement", text: "Tell us the products, quantity, specification, image or BOQ you need." },
        { n: "02", title: "Review & Discuss", text: "Our team reviews the requirement and connects with you for any necessary details." },
        { n: "03", title: "Quotation", text: "We share pricing and availability based on the discussed requirement." },
        { n: "04", title: "Order Coordination", text: "Once confirmed, we coordinate the order and dispatch process." },
        { n: "05", title: "Supply", text: "Products are supplied as per the finalized order and delivery details." },
      ],
    },
  },

  /* ---------- Contact ---------- */
  contact: {
    heading: "Let's Talk About Your Fire & Safety Requirement.",
    subheading: "Looking for fire extinguishers, fire fighting equipment, hydrant products, safety equipment or a larger product requirement? Share the details and our team will get back to you.",
    phone: "+91 74590 25437",
    whatsapp: "917459025437",
    email: "",
    gstin: "09FYUPS2140Q1ZB",
    address: "C30 R.S. Residence, Raksha, Jhansi (U.P.) – 284419",
    formHeading: "Send Your Requirement",
    formNote: "The more details you share, the faster our team can understand your requirement and prepare the right response.",
    successMessage: "Thank you for sharing your requirement. Our team will review the details and contact you shortly.",
    whatsappTemplate: "Hello Deep Enterprises, I would like to enquire about fire and safety products. My requirement is: {req}. Delivery location: {city}. Please share availability and quotation details.",
  },

  footer: {
    line: "Deep Enterprises | Fire Safety Solution & Store | Jhansi, Uttar Pradesh | Serving customers across India | +91 74590 25437",
    legal: ["Privacy Policy", "Terms & Conditions", "Disclaimer"],
  },
};
