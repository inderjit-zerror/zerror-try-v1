export const CONTACT = {
  email: "hello@zerrorstudios.com",
  phone: "+91 773 880 2437",
  phoneHref: "tel:+917738802437",
  address: ["B/32, Elco Arcade, Hill Road", "Bandra West, Mumbai 400050", "Maharashtra, India"],
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/wearezerrorians/" },
    { label: "LinkedIn", href: "https://in.linkedin.com/company/zerror-studios-mumbai" },
  ],
};

export const NAV = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Studio", href: "#studio" },
  { label: "Zcom", href: "#zcom" },
  { label: "Contact", href: "#contact" },
];

// Copy follows zerrorstudios.com (home, about, work and the four expertise pages).

export const STUDIO = {
  lead: "A design-led tech studio in Mumbai. Since 2022 we have built brands, websites, stores and software for publishers, film houses, fashion labels and founders on day one.",
};

// The intro statement. Strings are words; { chip } marks an inline shader pill.
export const STATEMENT = [
  "We", "design", { chip: 0 }, "and", "engineer", { chip: 1 }, "brands", "as", "one", "system.",
  "Clarity", "over", "excess,", "structure", "over", "noise", { chip: 2 }, "and", "precision", "in", "every", "pixel.",
];

// From the brand book: vision, mission, philosophy.
export const PRINCIPLES = [
  {
    title: "Systems",
    text: "Design and technology as one unified system. Every interaction purposeful, scalable and built to last.",
  },
  {
    title: "Structure",
    text: "Design treated as a system: structured, intentional and built to scale. Every element exists with reason.",
  },
  {
    title: "Precision",
    text: "Solutions that are precise and performance-driven. Every output functional, adaptable and built to perform.",
  },
];

export const SERVICES_INTRO = {
  title: "Everything a brand needs. One studio.",
  text: "The brand, the website, the store and the tools behind them, made by one team in Mumbai. The people who design it are the people who build it.",
};

export const SERVICES = [
  {
    no: "01",
    title: "Websites",
    kicker: "Websites worth stopping for",
    tagline: "Moves like a story. Loads like nothing.",
    text: "Designed and built as one, by the same team. Scroll-led motion in GSAP and Next.js, planned with the page from the start, and every site set up for Google and AI search before go-live.",
    tags: ["Design", "Development", "Scroll and motion", "SEO and AI search", "Testing", "Hosting and care"],
    metrics: [
      { value: "< 1.6s", label: "Load time" },
      { value: "94", label: "PageSpeed Insights" },
    ],
    type: "Website",
  },
  {
    no: "02",
    title: "eCommerce",
    kicker: "Commerce that earns the cart",
    tagline: "Stores built to sell. And to look like you.",
    text: "Stores that sell like the brand, not like a theme. Custom Shopify builds or Zcom, our own commerce platform, with every template designed, payments connected and test orders placed before go-live.",
    tags: ["Shopify", "Zcom", "Checkout", "Indian payments", "AI coach"],
    metrics: [
      { value: "80+", label: "Online stores launched" },
      { value: "+350%", label: "Revenue growth, YoY" },
    ],
    type: "eCommerce",
  },
  {
    no: "03",
    title: "Software and tools",
    kicker: "Software shaped to the business",
    tagline: "Built around how you work.",
    text: "Built around how your team already works. A custom CMS, dashboard or internal tool, mapped screen by screen with you, then built in stages you can try as we go.",
    tags: ["Custom CMS", "Dashboards", "Internal tools", "Headless", "Access by role"],
    metrics: [
      { value: "< 220ms", label: "API response time" },
      { value: "100%", label: "Role-based access coverage" },
    ],
    type: "Software",
  },
  {
    no: "04",
    title: "Branding, marketing and SEO",
    kicker: "Found first. Remembered longer.",
    tagline: "Be found. Be remembered.",
    text: "Seen, found, remembered. A full identity with logo, colour, type and voice, then social, campaigns and SEO, run every month by the team that made it.",
    tags: ["Identity", "Social and content", "Campaigns", "SEO and AI search", "Growth"],
    metrics: [
      { value: "+58%", label: "Brand recall lift" },
      { value: "+72%", label: "Organic visibility" },
    ],
    type: "Branding, marketing & SEO",
  },
];

export const WORK_INTRO = {
  title: "Thoughtful design. Technology that holds.",
  text: "Brands, websites and online stores, designed and built by one team. The people who sketch your idea are the people who launch it, so nothing gets lost along the way. A few we're proud of.",
};

export const CASES = [
  {
    id: "rpsg",
    client: "RPSG Lifestyle Media",
    year: "2025",
    sector: "Publishing group, magazine",
    title: "Three titles, one custom platform.",
    text: "The Hollywood Reporter India, Esquire India and Robb Report India on one platform we built. Editors publish news, reviews, galleries and video from one dashboard, and it stays fast on box-office Fridays.",
    metrics: [
      { value: "3M+", label: "Readers a month" },
      { value: "500+", label: "Editors on the platform" },
      { value: "+45%", label: "Reader retention" },
    ],
    cover: "/images/work/rpsg-1.jpg",
    hover: "/images/work/rpsg-2.jpg",
  },
  {
    id: "manifest",
    client: "Manifest",
    year: "2025",
    sector: "Luxury wedding magazine",
    title: "Five years of content, zero downtime.",
    text: "Moved off WordPress onto a custom CMS. Every article, image and URL carried over, so no search ranking was lost, and issues, black books and guides go up without a developer.",
    metrics: [
      { value: "200%", label: "More traffic after launch" },
      { value: "0", label: "Minutes of downtime" },
      { value: "+38%", label: "Returning readers" },
    ],
    cover: "/images/work/manifest-1.jpg",
    hover: "/images/work/manifest-2.jpg",
  },
  {
    id: "skf",
    client: "Salman Khan Films",
    year: "2026",
    sector: "Film production house",
    title: "Cinematic, and built to outlast the trend.",
    text: "A premium showcase for one of Bollywood's most recognised production houses. Restrained, cinematic, and ready for the traffic of a film launch.",
    metrics: [
      { value: "100%", label: "Custom, no templates" },
      { value: "1", label: "Timeless digital stage" },
    ],
    cover: "/images/work/skf-1.jpg",
    hover: "/images/work/skf-2.jpg",
  },
  {
    id: "deveshe",
    client: "Deveshe Dreams",
    year: "2025",
    sector: "Handcrafted fashion label",
    title: "Commerce shaped around scarcity.",
    text: "A proprietary store for limited, handcrafted collections, with drops, pre-orders and real-time inventory in one backend.",
    metrics: [
      { value: "+350%", label: "Revenue growth, YoY" },
      { value: "+165%", label: "Traffic growth" },
      { value: "↑", label: "Order value and repeat buyers" },
    ],
    cover: "/images/work/deveshe-1.jpg",
    hover: "/images/work/deveshe-2.jpg",
  },
];

export const MORE_WORK = [
  { name: "Disrptve", year: "2025", type: "Marketing agency" },
  { name: "Studio Akto", year: "2025", type: "Interior design studio" },
  { name: "Bro's Moving", year: "2026", type: "Moving and logistics" },
  { name: "I White Korea", year: "2024", type: "Korean beauty essentials" },
  { name: "Point Of", year: "2025", type: "Brand consultancy" },
  { name: "Nahara", year: "2026", type: "Fine jewellery" },
  { name: "25 Rupiya Production", year: "2026", type: "AI film production house" },
  { name: "Shivdutt Das Art Foundation", year: "2025", type: "Art foundation" },
];

// level = how full the column sits in the liquid chart.
export const STATS = [
  { kicker: "Since", value: 2022, from: 1990, suffix: "", label: "Founded in Mumbai", level: 0.4 },
  { kicker: "Clients", value: 100, suffix: "+", label: "Brands built since 2022", level: 0.62 },
  { kicker: "Shipped", value: 200, suffix: "+", label: "Websites and products", level: 0.86 },
  { kicker: "Commerce", value: 80, suffix: "+", label: "Online stores", level: 0.52 },
  { kicker: "Under one roof", text: "One", suffix: "", label: "Team for design, build and marketing", level: 0.97 },
];

export const PROCESS = [
  {
    no: "01",
    title: "Discover",
    line: "Where ideas become usable.",
    text: "We map the business before the screens: goals, users, content and the systems it has to plug into. Clarity first, pixels second.",
  },
  {
    no: "02",
    title: "Prototype",
    line: "Prototypes that bring ideas to life.",
    text: "Moodboards turn into clickable flows and motion studies, so decisions are made on something real, not on a deck.",
  },
  {
    no: "03",
    title: "Build",
    line: "Design. Development. Marketing.",
    text: "One team carries it from Figma to production code, CMS, payments and launch, with performance and SEO built in rather than bolted on.",
  },
  {
    no: "04",
    title: "Evolve",
    line: "Refine through feedback.",
    text: "Great products are shaped continuously. We test, measure and iterate so the system keeps getting sharper after launch.",
  },
];

export const ZCOM = {
  bills: ["Platform", "Theme", "Apps", "Developer", "Agency"],
  pillars: [
    { title: "Designed for the brand", text: "Layout, motion and detail planned around what the brand sells and how it wants to be seen." },
    { title: "Built on a modern stack", text: "Fast on any phone, structured for search engines and AI search, every app connected." },
    { title: "Run from one dashboard", text: "Products, orders, inventory and content in one admin anyone on the team can use." },
  ],
  ai: [
    { title: "AI analytics coach", text: "Ask why sales dipped on Tuesday or which product to push this week. It answers in plain words, with the next step.", status: "Live" },
    { title: "AI automation", text: "A Claude and ChatGPT connector, preloaded with skills. Add products, update stock or launch a sale without opening the dashboard.", status: "Live" },
    { title: "AI marketing copilot", text: "A marketer that already knows the store: strategy, creative, ads and reporting, all inside Zcom.", status: "Soon" },
  ],
};

export const CLIENTS_INTRO = {
  title: "The company we keep.",
  text: "Publishers, film houses, fashion labels and founders on their first launch. More than 100 brands since 2022.",
};

// ratio = logo width / height, used to size logos to a similar visual weight.
export const CLIENTS = [
  { name: "The Hollywood Reporter India", file: "hollywood-reporter", ratio: 3.56 },
  { name: "Esquire India", file: "esquire", ratio: 6.75 },
  { name: "Manifest", file: "manifest", ratio: 3.36 },
  { name: "Robb Report India", file: "robb-report", ratio: 5.26 },
  { name: "Salman Khan Films", file: "skf", ratio: 1.94 },
  { name: "Point Of", file: "point-of", ratio: 0.78 },
  { name: "Disrptve", file: "disrptve", ratio: 6.49 },
  { name: "Just Nosh", file: "just-nosh", ratio: 3.84 },
  { name: "RP-Sanjiv Goenka Group", file: "rpsg-group", ratio: 3.48 },
  { name: "Mad Earth", file: "mad-earth", ratio: 1.24 },
  { name: "RPSG Media", file: "rpsg-media", ratio: 2.09 },
  { name: "Studio Akto", file: "studio-akto", ratio: 1.65 },
  { name: "Hefty Art", file: "hefty-art", ratio: 7.55 },
  { name: "Nahara", file: "nahara", ratio: 6.0 },
  { name: "Shivdutt Das Art Foundation", file: "sdaf", ratio: 2.35 },
  { name: "Reside in Being", file: "reside-being", ratio: 11.1 },
];

export const PROJECT_TYPES = ["Website", "eCommerce", "Software", "Branding, marketing & SEO", "Zcom store", "Not sure yet"];
