"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Instagram, Youtube, Music2, Mail } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { useCampConfig } from "@/hooks/useConfig";

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
  const campConfig = useCampConfig();
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    campConfig.social.instagram
      ? { href: campConfig.social.instagram, label: "Instagram", icon: <Instagram className="h-4 w-4" /> }
      : null,
    campConfig.social.youtube
      ? { href: campConfig.social.youtube, label: "YouTube", icon: <Youtube className="h-4 w-4" /> }
      : null,
    campConfig.social.soundcloud
      ? { href: campConfig.social.soundcloud, label: "SoundCloud", icon: <Music2 className="h-4 w-4" /> }
      : null,
    campConfig.email
      ? { href: `mailto:${campConfig.email}`, label: "Email", icon: <Mail className="h-4 w-4" /> }
      : null,
  ].filter(Boolean) as { href: string; label: string; icon: ReactNode }[];

  return (
    <footer className={`bg-desert-night text-desert-sand/80 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Organization info */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-display font-semibold text-warm-white mb-4">
                {tenant?.name || "Camp Platform"}
              </h3>
              <p className="text-sm text-desert-sand/70 mb-4 font-body">
                Building community through art, culture, and shared experiences.
              </p>
              {socialLinks.length > 0 && (
                <div className="flex items-center space-x-3">
                  {socialLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-warm-white transition-colors"
                      aria-label={link.label}
                    >
                      {link.icon}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer sections */}
            {sections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-ui font-semibold text-warm-white uppercase tracking-wider mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-desert-sand/70 hover:text-antique-gold transition-colors duration-300 font-body"
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
        <div className="border-t border-dust-khaki/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-desert-sand/60 font-body">
              © {currentYear} {tenant?.name || "Camp Platform"}. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-desert-sand/70 hover:text-antique-gold transition-colors duration-300 font-body"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-desert-sand/70 hover:text-antique-gold transition-colors duration-300 font-body"
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