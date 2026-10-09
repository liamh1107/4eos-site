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
    lede: "Proactive management, continuous monitoring, and live U.S.-based support. We catch problems before someone has to open a ticket.",
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
    faqs: [
      {
        q: "What does CompleteCare include?",
        a: "Proactive management, continuous monitoring, and live U.S.-based support. It runs from the help desk through fully managed infrastructure, with executive-level IT strategy.",
      },
      {
        q: "How does CompleteCare handle problems?",
        a: "Continuous monitoring, so problems surface before a ticket. Eyes On Site covers the work that needs someone in the room, and support is remote-first for faster resolution.",
      },
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
    faqs: [
      {
        q: "What cybersecurity structure does 4EOS follow?",
        a: "The NIST Cybersecurity Framework, for a structured, layered defense, and to keep you audit-ready.",
      },
      {
        q: "What does cybersecurity support cover?",
        a: "Early threat detection and real-time monitoring, HIPAA, PCI, and SEC compliance support, and security awareness training for the people who click.",
      },
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
    faqs: [
      {
        q: "Which cloud platforms does 4EOS manage?",
        a: "Microsoft 365 and Azure, managed as one environment, including hybrid and on-premise infrastructure.",
      },
      {
        q: "How does a cloud migration work?",
        a: "Migration is planned before anything is moved. Planning and execution cover Microsoft 365, Azure, and hybrid environments, including work that still belongs on-premise.",
      },
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
      "Midwest VoIP, one family and one number to call",
      "Porting, routing, queues, and ring groups",
      "Training included so the team actually uses it",
    ],
    related: [
      { href: "/services/completecare", label: "CompleteCare" },
    ],
    family: "Midwest VoIP",
    faqs: [
      {
        q: "What does business VoIP from 4EOS include?",
        a: "Business-class VoIP from Midwest VoIP, with full installation, porting, and ongoing support. That covers PBX install, call routing, queues, ring groups, number porting, and mobile app setup.",
      },
      {
        q: "Is training included?",
        a: "End-user training is included so the team actually uses it.",
      },
    ],
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
    faqs: [
      {
        q: "Where is the data center?",
        a: "SafeHouse DataCenter in Fort Wayne. It offers co-location, disaster recovery, and remote backup.",
      },
      {
        q: "What space can a company take?",
        a: "Full or partial rack space, or 4EOS-administered hosted systems, including co-location for mission-critical equipment.",
      },
    ],
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
    faqs: [
      {
        q: "What hardware does 4EOS procure?",
        a: "Enterprise-grade hardware through Dell, Microsoft, and Cisco partnerships. 4EOS is the largest Dell reseller in Northeast Indiana.",
      },
      {
        q: "How is hardware sized?",
        a: "Specs are right-sized to the work, not the catalog, and procurement is handled end to end.",
      },
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
    offer: "Document systems, trial prep, and privileged client data.",
    lede: "We run the systems a firm works in: the document store, email, and the machines attorneys use. Privilege holds on an ordinary day and through trial prep.",
    note: "We keep matter files, email, and attorney machines available, and limited to the people allowed to see them, including through trial prep.",
    how: [
      "Secure document management, so a matter file stays with the people who should see it",
      "Systems that stay up through trial prep",
      "Privileged client data protected in email, on endpoints, and in the file store",
      "A help desk that treats a locked-out attorney as urgent",
      "Backup and recovery for the document system the practice runs on",
    ],
    related: [
      { href: "/services/cybersecurity", label: "Cybersecurity" },
      { href: "/services/completecare", label: "CompleteCare" },
    ],
    faqs: [
      {
        q: "What does 4EOS do for a law firm?",
        a: "Secure document management, systems that stay up through trial prep, and protection for privileged client data in email, on endpoints, and in the file store. A locked-out attorney is treated as urgent.",
      },
      {
        q: "Why does that matter in a practice?",
        a: "A firm runs on documents and on who is allowed to see them. Privilege has to hold in ordinary work and through trial prep.",
      },
    ],
  },
  {
    slug: "insurance",
    title: "Insurance",
    statement: "Agency systems stay up when the office needs them.",
    offer: "Agency systems, client data, and payments in line with PCI.",
    lede: "We keep the agency management system available for producers, protect the client data in it, and handle payments in line with PCI.",
    note: "We keep the agency system up for producers, protect the client data in it, and handle payments in line with PCI.",
    how: [
      "Agency management systems kept available for producers",
      "Client data protected in the systems the office runs on",
      "Payment handling in line with PCI",
      "Secure access for producers working out of the office",
      "Monitoring and a help desk that treat the agency system as the business",
    ],
    related: [
      { href: "/services/cybersecurity", label: "Cybersecurity" },
      { href: "/services/completecare", label: "CompleteCare" },
    ],
    faqs: [
      {
        q: "What does 4EOS do for an insurance agency?",
        a: "We keep the agency management system available, protect client data, handle payments in line with PCI, and give producers secure access when they are out of the office.",
      },
      {
        q: "Why does the agency system matter?",
        a: "The agency management system is how the producers work. It has to stay available, and the payments that move through it have to be handled in line with PCI.",
      },
    ],
  },
  {
    slug: "healthcare",
    title: "Healthcare",
    statement: "Patient records stay up, and stay protected.",
    offer: "EHR uptime and HIPAA safeguards for patient data.",
    lede: "We keep the EHR up and patient data protected. HIPAA safeguards cover the record and every device and connection that can reach it.",
    note: "We keep the EHR up, and HIPAA safeguards cover every device and connection that can reach patient data.",
    how: [
      "HIPAA compliance support, kept audit-ready",
      "EHR uptime, because a down record stops the day",
      "Safeguards for patient data on every device and connection",
      "Monitoring that treats a clinical system outage as the incident",
      "Backup and recovery for the systems that hold the record",
    ],
    related: [
      { href: "/services/cybersecurity", label: "Cybersecurity" },
      { href: "/secureai", label: "SecureAI" },
    ],
    faqs: [
      {
        q: "What does 4EOS do for a healthcare organization?",
        a: "HIPAA compliance support, EHR uptime, and safeguards for patient data across every device and connection, with backup for the systems that hold the record.",
      },
      {
        q: "What do those safeguards cover?",
        a: "The day runs on the record. EHR uptime and HIPAA safeguards cover every device and connection that can reach patient data.",
      },
    ],
  },
  {
    slug: "construction",
    title: "Construction",
    statement: "Secure access for crews on the job site.",
    offer: "Job site connectivity and secure access for field crews.",
    lede: "We give field crews a connection and secure access to plans and project files from the job site, and we keep that access up under a deadline.",
    note: "We give crews a secure connection to plans and project files from the job site, and keep it up under a deadline.",
    how: [
      "Connectivity for trailers, job sites, and crews in the field",
      "Secure access to plans and project files from anywhere",
      "Systems that hold while the deadline does not move",
      "A help desk that can reach a superintendent who is not at a desk",
      "Backup for the project files the job runs on",
    ],
    related: [
      { href: "/services/completecare", label: "CompleteCare" },
      { href: "/services/cloud", label: "Cloud" },
    ],
    faqs: [
      {
        q: "What does 4EOS do for a construction firm?",
        a: "Job site connectivity, secure access to plans and project files for field crews, and backup for the files the job runs on.",
      },
      {
        q: "How does that hold up on a job?",
        a: "The workplace is the job site. Field teams need a connection and secure access that hold while the deadline does not move.",
      },
    ],
  },
  {
    slug: "manufacturing",
    title: "Manufacturing",
    statement: "Downtime is measured in dollars per minute.",
    offer: "Production uptime, and a safe line between IT and the plant.",
    lede: "We keep production systems running, and we keep office IT off the plant floor except where that meeting is safe.",
    note: "We keep production systems running, and keep office IT off the plant floor except where that meeting is safe.",
    how: [
      "Production systems kept running",
      "Office IT and the plant floor kept separate",
      "The IT and OT divide bridged only where that bridge is safe",
      "Monitoring that treats downtime as the incident",
      "Backup and recovery for the systems the line depends on",
    ],
    related: [
      { href: "/services/completecare", label: "CompleteCare" },
      { href: "/services/cybersecurity", label: "Cybersecurity" },
    ],
    faqs: [
      {
        q: "What does 4EOS do for a manufacturer?",
        a: "Production systems stay running, office IT and the plant floor stay separated, and they meet only where that meeting is safe. Downtime is treated as the incident.",
      },
      {
        q: "Why is that split treated carefully?",
        a: "The line measures an outage in lost production. Office IT and the plant floor stay separated, and they meet only where that meeting is safe.",
      },
    ],
  },
  {
    slug: "private-equity",
    title: "Private Equity",
    statement: "One security standard across every company you own.",
    offer: "Diligence before the close, then one standard across holdings.",
    lede: "We read the technology before a close, bring a new holding onto one baseline, and hold the same security standard across the companies you own.",
    note: "We read the technology before a close, then hold one security standard across every company you own.",
    how: [
      "Technology due diligence before a deal closes",
      "Rapid onboarding once a company is a holding",
      "One security standard across the portfolio",
      "A baseline the next acquisition can be measured against",
      "CompleteCare and cybersecurity applied the same way at each company",
    ],
    related: [
      { href: "/services/cybersecurity", label: "Cybersecurity" },
      { href: "/services/completecare", label: "CompleteCare" },
    ],
    faqs: [
      {
        q: "What does 4EOS do for private equity?",
        a: "Technology due diligence before a close, rapid onboarding onto one baseline, and the same security standard across every holding.",
      },
      {
        q: "Why does a portfolio need that?",
        a: "Each company in a portfolio arrives with its own stack. Diligence reads that before the close, and the security posture is made consistent once the company is a holding.",
      },
    ],
  },
] as const;

export const faqs = [
  {
    q: "How do I choose a managed IT provider?",
    a: "Ask how they connect the technology to the work, and how fast they close tickets. Ask about response times and SLAs, cybersecurity, monitoring, industry experience, local and remote support, and whether they plan ahead or only fix what is already broken.",
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
    lede: "We support the IT, and we sit in on the decisions that depend on it.",
  },
] as const;

export const hours = "Monday to Friday, 8:00 AM to 5:00 PM ET";
export const fax = "(260) 490-7925";
export const salesEmail = "sales@4eos.com";
