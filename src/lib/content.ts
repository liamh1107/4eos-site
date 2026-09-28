/**
 * Verified 4EOS copy. Every claim here is on the live site. Do not add
 * awards, client counts, uptime figures, or partner logos that were not
 * already published.
 */

import { site } from "./site";

export type Related = { href: string; label: string };

export const services = [
  {
    slug: "completecare",
    title: "CompleteCare Managed IT",
    statement: "We run your IT so the team can stay on the work.",
    lede: "Proactive management, continuous monitoring, and live U.S.-based support. Problems are prevented rather than waited for.",
    phase: "ownership" as const,
    points: [
      "Help desk through fully managed infrastructure",
      "Remote-first, faster resolution",
      "Executive-level IT strategy",
    ],
    how: [
      "Continuous monitoring, not a wait for tickets",
      "Live U.S.-based help desk",
      "Eyes On Site when the work needs someone in the room",
    ],
    related: [
      { href: "/services/cybersecurity", label: "Cybersecurity" },
      { href: "/secureai", label: "SecureAI" },
    ],
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity & Compliance",
    statement: "A layered defense your auditor can follow.",
    lede: "We follow the NIST Cybersecurity Framework for a structured, layered defense, and keep you audit-ready.",
    phase: "security" as const,
    points: [
      "Early threat detection and real-time monitoring",
      "HIPAA, PCI, and SEC compliance support",
      "Security awareness training for your team",
    ],
    how: [
      "NIST Cybersecurity Framework as the structure",
      "HIPAA, PCI, and SEC compliance support",
      "Awareness training for the people who click",
    ],
    related: [
      { href: "/secureai", label: "SecureAI" },
      { href: "/services/completecare", label: "CompleteCare" },
    ],
  },
  {
    slug: "cloud",
    title: "Cloud & Infrastructure",
    statement: "The right workload in the right place, without vendor lock-in.",
    lede: "Migration, management, and optimization across Microsoft 365, Azure, and hybrid environments.",
    phase: "discovery" as const,
    points: [
      "Cloud migration planning and execution",
      "Microsoft 365 and Azure management",
      "Hybrid and on-premise infrastructure",
    ],
    how: [
      "Microsoft 365 and Azure, managed as one environment",
      "Hybrid when the work still belongs on-premise",
      "Migration planned before anything is moved",
    ],
    related: [
      { href: "/services/completecare", label: "CompleteCare" },
      { href: "/services/datacenter", label: "Data Center" },
    ],
  },
  {
    slug: "voip",
    title: "Business VoIP",
    statement: "Phones that fit how the team works.",
    lede: "Business-class VoIP from Midwest VoIP, with full installation, porting, and ongoing support.",
    phase: "response" as const,
    points: [
      "PBX install, call routing, queues, ring groups",
      "Number porting and mobile app setup",
      "End-user training included",
    ],
    how: [
      "Midwest VoIP — one family, one number to call",
      "Porting, routing, queues, and ring groups",
      "Training included so the team actually uses it",
    ],
    related: [
      { href: "/services/completecare", label: "CompleteCare" },
    ],
    family: "Midwest VoIP",
  },
  {
    slug: "datacenter",
    title: "Data Center & DR",
    statement: "A Fort Wayne data center you can visit.",
    lede: "Co-location, disaster recovery, and remote backup in SafeHouse DataCenter. Full or partial rack space, or 4EOS-administered hosted systems.",
    phase: "security" as const,
    points: [
      "Co-location for mission-critical equipment",
      "Remote backup and disaster recovery",
      "Scale without building infrastructure",
    ],
    how: [
      "SafeHouse DataCenter in Fort Wayne",
      "Full or partial rack, or 4EOS-administered hosts",
      "Remote backup and disaster recovery",
    ],
    related: [
      { href: "/services/cloud", label: "Cloud" },
      { href: "/services/cybersecurity", label: "Cybersecurity" },
    ],
    family: "SafeHouse DataCenter",
  },
  {
    slug: "hardware",
    title: "Hardware Procurement",
    statement: "Enterprise-grade hardware, sized to the work, not the catalog.",
    lede: "Largest Dell reseller in Northeast Indiana, with Microsoft and Cisco partnerships.",
    phase: "discovery" as const,
    points: [
      "Dell, Microsoft, Cisco partner pricing",
      "Right-sized specs, no overselling",
      "Procurement handled end to end",
    ],
    how: [
      "Largest Dell reseller in Northeast Indiana",
      "Microsoft and Cisco partnerships",
      "Sized to the work, not the catalog",
    ],
    related: [
      { href: "/services/completecare", label: "CompleteCare" },
    ],
  },
] as const;

export const tiers = [
  {
    name: "Base",
    statement: "For teams that need reliable help desk coverage and fast answers.",
    points: [
      "Live U.S.-based help desk",
      "Remote support for endpoints",
      "Continuous system monitoring",
      "Monthly patching and maintenance",
    ],
  },
  {
    name: "Pro",
    statement: "For businesses that want the whole environment run for them.",
    points: [
      "Everything in Base",
      "Fully managed servers and network",
      "Built-in cybersecurity layer",
      "Backup verification and testing",
      "Vendor management",
    ],
  },
  {
    name: "Premium",
    statement: "For leaders who want IT tied to where the business is going.",
    points: [
      "Everything in Pro",
      "Executive-level IT strategy",
      "Quarterly business reviews",
      "Compliance program support",
      "Technology roadmap planning",
    ],
  },
] as const;

export const industries = [
  {
    slug: "legal",
    title: "Legal",
    statement: "Privileged client data stays protected.",
    lede: "Secure document management, reliable systems during trial prep, and protection for privileged client data.",
    how: [
      "Secure document management",
      "Reliable systems during trial prep",
      "Protection for privileged client data",
    ],
    related: [
      { href: "/services/cybersecurity", label: "Cybersecurity" },
      { href: "/services/completecare", label: "CompleteCare" },
    ],
  },
  {
    slug: "insurance",
    title: "Insurance",
    statement: "Agency systems stay up when the office needs them.",
    lede: "Client data protection, PCI-aligned payment handling, and agency management systems that stay available.",
    how: [
      "Client data protection",
      "PCI-aligned payment handling",
      "Agency systems that stay available",
    ],
    related: [
      { href: "/services/cybersecurity", label: "Cybersecurity" },
      { href: "/services/completecare", label: "CompleteCare" },
    ],
  },
  {
    slug: "healthcare",
    title: "Healthcare",
    statement: "Patient records stay up, and stay protected.",
    lede: "HIPAA compliance support, EHR uptime, and safeguards for patient data across every device and connection.",
    how: [
      "HIPAA compliance support",
      "EHR uptime",
      "Safeguards across every device and connection",
    ],
    related: [
      { href: "/services/cybersecurity", label: "Cybersecurity" },
      { href: "/secureai", label: "SecureAI" },
    ],
  },
  {
    slug: "construction",
    title: "Construction",
    statement: "Secure access for crews on the job site.",
    lede: "Job site connectivity, project deadline pressure, and field teams that need secure access from anywhere.",
    how: [
      "Job site connectivity",
      "Secure access for field teams",
      "Systems that hold under deadline pressure",
    ],
    related: [
      { href: "/services/completecare", label: "CompleteCare" },
      { href: "/services/cloud", label: "Cloud" },
    ],
  },
  {
    slug: "manufacturing",
    title: "Manufacturing",
    statement: "Downtime is measured in dollars per minute.",
    lede: "Production systems stay running, and the IT and OT divide is bridged safely.",
    how: [
      "Production systems stay running",
      "The IT and OT divide, bridged safely",
      "Monitoring that treats downtime as the incident",
    ],
    related: [
      { href: "/services/completecare", label: "CompleteCare" },
      { href: "/services/cybersecurity", label: "Cybersecurity" },
    ],
  },
  {
    slug: "private-equity",
    title: "Private Equity",
    statement: "One security standard across every company you own.",
    lede: "Technology due diligence for deals, rapid portfolio onboarding, and consistent security across holdings.",
    how: [
      "Technology due diligence for deals",
      "Rapid portfolio onboarding",
      "Consistent security across holdings",
    ],
    related: [
      { href: "/services/cybersecurity", label: "Cybersecurity" },
      { href: "/services/completecare", label: "CompleteCare" },
    ],
  },
] as const;

export const faqs = [
  {
    q: "How do I choose a managed IT provider?",
    a: "Look for a partner that aligns technology with the business rather than waiting for tickets. Ask about response times and SLAs, cybersecurity, proactive monitoring, industry experience, local and remote support, and whether they do strategic planning or only break-fix.",
  },
  {
    q: "What should a business VoIP system include?",
    a: "More than calls. Reliability, mobile and remote support, auto attendant and call routing, voicemail transcription, CRM integration, recording and analytics, and the ability to grow without a forklift.",
  },
  {
    q: "Why outsource IT for a mid-sized company?",
    a: "Lower cost than staffing the same coverage internally, access to a broader bench, stronger cybersecurity, 24/7 monitoring, and the ability to scale without hiring for every new system.",
  },
  {
    q: "What should I look for in a cybersecurity partner?",
    a: "24/7 threat monitoring, managed detection and response, endpoint protection, security awareness training, incident response planning, compliance expertise, backup and disaster recovery, and someone who can actually show up.",
  },
  {
    q: "Why 4EOS?",
    a: "Founded in 2002. Managed IT, cybersecurity, cloud, and strategic consulting for Indiana organizations. Proactive support, dedicated engineers, and regular onsite engagement through Eyes On Site.",
  },
] as const;

export const values = [
  {
    title: "Technical excellence",
    lede: "Certified engineers, proven tools, and processes that hold up under pressure.",
  },
  {
    title: "Business integrity",
    lede: "Transparent pricing and recommendations sized to the actual need, not the margin.",
  },
  {
    title: "Client success",
    lede: "A relentless commitment to outcomes. We do not just support the IT. We help you lead with it.",
  },
] as const;

export const hours = "Monday to Friday, 8:00 AM to 5:00 PM ET";
export const fax = "(260) 490-7925";
export const salesEmail = "sales@4eos.com";
