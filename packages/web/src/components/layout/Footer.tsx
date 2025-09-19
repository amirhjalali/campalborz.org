"use client";

import Link from "next/link";
import { useTenant } from "@/hooks/useTenant";

interface FooterLink {
  name: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  sections?: FooterSection[];
  className?: string;
}

const defaultSections: FooterSection[] = [
  {
    title: "About",
    links: [
      { name: "Our Mission", href: "/about" },
      { name: "Members", href: "/members" },
      { name: "Events", href: "/events" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { name: "Join Us", href: "/apply" },
      { name: "Volunteer", href: "/volunteer" },
      { name: "Donate", href: "/donate" },
      { name: "Sponsor", href: "/sponsor" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Art Gallery", href: "/art" },
      { name: "Blog", href: "/blog" },
      { name: "FAQ", href: "/faq" },
      { name: "Guidelines", href: "/guidelines" },
    ],
  },
];

export function Footer({ sections = defaultSections, className }: FooterProps) {
  const { tenant } = useTenant();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-secondary-900 text-secondary-300 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Organization info */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-white mb-4">
                {tenant?.name || "Camp Platform"}
              </h3>
              <p className="text-sm text-secondary-400 mb-4">
                Building community through art, culture, and shared experiences.
              </p>
              {/* Social media links would go here */}
            </div>

            {/* Footer sections */}
            {sections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-secondary-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-secondary-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-secondary-400">
              © {currentYear} {tenant?.name || "Camp Platform"}. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-secondary-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-secondary-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}