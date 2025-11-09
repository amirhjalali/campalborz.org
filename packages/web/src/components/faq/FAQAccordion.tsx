'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ChevronDownIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  /**
   * Allow multiple items to be open at once
   */
  allowMultiple?: boolean;
  /**
   * Show search/filter
   */
  showSearch?: boolean;
  /**
   * Group by category
   */
  showCategories?: boolean;
}

/**
 * FAQ Accordion Component
 *
 * Collapsible FAQ list with search and categories
 */
export function FAQAccordion({
  items,
  allowMultiple = false,
  showSearch = false,
  showCategories = false,
}: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(id)
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    } else {
      setOpenItems(prev =>
        prev.includes(id) ? [] : [id]
      );
    }
  };

  // Filter items by search query
  const filteredItems = searchQuery
    ? items.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  // Group by category if enabled
  const groupedItems = showCategories
    ? filteredItems.reduce((acc, item) => {
        const category = item.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {} as Record<string, FAQItem[]>)
    : { All: filteredItems };

  return (
    <div className="space-y-6">
      {/* Search */}
      {showSearch && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full px-4 py-3 pl-10 border-2 border-dust-khaki/30 rounded-lg bg-warm-white text-desert-night focus:outline-none focus:ring-2 focus:ring-antique-gold/50 focus:border-antique-gold/70 hover:border-dust-khaki/50 transition-all duration-300 font-body"
          />
          <QuestionMarkCircleIcon className="absolute left-3 top-3.5 h-5 w-5 text-desert-night/40" />
        </div>
      )}

      {/* Categories */}
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category}>
          {showCategories && (
            <h3 className="text-lg font-display font-semibold text-desert-night mb-3">
              {category}
            </h3>
          )}

          <div className="space-y-2">
            {categoryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full text-left p-4 hover:bg-desert-sand/20 transition-colors duration-300 flex items-center justify-between group"
                >
                  <span className="font-ui font-medium text-desert-night pr-4">
                    {item.question}
                  </span>
                  <ChevronDownIcon
                    className={`h-5 w-5 text-burnt-sienna flex-shrink-0 transition-transform duration-200 ${
                      openItems.includes(item.id) ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {openItems.includes(item.id) && (
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="prose prose-sm max-w-none text-desert-night/70 border-t border-dust-khaki/20 pt-4 font-body">
                      {item.answer}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* No Results */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <QuestionMarkCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No FAQs match your search.</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary-600 hover:text-primary-700 text-sm mt-2"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Predefined FAQ data for common questions
 */
export const campAlborzFAQs: FAQItem[] = [
  {
    id: 'what-is-camp-alborz',
    question: 'What is Camp Alborz?',
    answer: 'Camp Alborz is a vibrant Burning Man theme camp that celebrates Persian culture, art, and radical self-expression. We create a welcoming space where tradition meets innovation on the playa.',
    category: 'About Us',
  },
  {
    id: 'how-to-join',
    question: 'How can I join Camp Alborz?',
    answer: 'Fill out our membership application form with information about your interests and what you\'d like to contribute. We review applications on a rolling basis and welcome passionate individuals who share our values.',
    category: 'Membership',
  },
  {
    id: 'membership-fee',
    question: 'Is there a membership fee?',
    answer: 'We operate on a gift economy model. While there\'s no required membership fee, we do ask members to contribute through volunteering, donations, or providing skills and resources to support the camp.',
    category: 'Membership',
  },
  {
    id: 'first-time-burners',
    question: 'Do you accept first-time Burners?',
    answer: 'Absolutely! We welcome both experienced Burners and first-timers. We provide mentorship and support to help new members prepare for their first Burn.',
    category: 'Membership',
  },
  {
    id: 'camp-location',
    question: 'Where is Camp Alborz located?',
    answer: 'During Burning Man, we\'re located in Black Rock City. Our exact camp placement varies each year. Outside of Burning Man, we host events and gatherings throughout the year - check our events calendar for details.',
    category: 'Logistics',
  },
  {
    id: 'what-to-bring',
    question: 'What should I bring to camp?',
    answer: 'Bring your Burning Man essentials (tent, water, food, costumes), plus any items you\'d like to share as gifts. We provide communal shade structures, some meals, and workshop materials. A full packing list is sent to confirmed members.',
    category: 'Logistics',
  },
  {
    id: 'volunteer-opportunities',
    question: 'How can I volunteer?',
    answer: 'We have many volunteer opportunities including setup/teardown, art installation, workshop facilitation, cooking, and event coordination. Fill out our volunteer form to express your interests and availability.',
    category: 'Getting Involved',
  },
  {
    id: 'donations',
    question: 'Are donations tax-deductible?',
    answer: 'Yes! Camp Alborz is a 501(c)(3) non-profit organization, so your donations are tax-deductible to the extent allowed by law. You\'ll receive a receipt for your records.',
    category: 'Donations',
  },
  {
    id: 'events-year-round',
    question: 'Do you host events outside of Burning Man?',
    answer: 'Yes! We host workshops, cultural celebrations, art events, and community gatherings throughout the year. Check our events calendar for upcoming activities.',
    category: 'Events',
  },
  {
    id: 'workshops',
    question: 'What kind of workshops do you offer?',
    answer: 'We offer workshops on Persian art, music, dance, language, cooking, and crafts. We also host skill-sharing sessions on topics like sustainability, community building, and creative expression.',
    category: 'Events',
  },
  {
    id: 'cultural-background',
    question: 'Do I need to have Persian heritage to join?',
    answer: 'Not at all! While we celebrate Persian culture, we welcome people of all backgrounds who are interested in learning, sharing, and contributing to our vibrant community.',
    category: 'About Us',
  },
  {
    id: 'contact',
    question: 'How can I contact Camp Alborz?',
    answer: 'Email us at info@campalborz.org or use our contact form. We typically respond within 24-48 hours. Follow us on Instagram and Facebook for updates.',
    category: 'Contact',
  },
];

/**
 * Simple FAQ component without accordion (all items visible)
 */
export function SimpleFAQ({ items }: { items: FAQItem[] }) {
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.id} className="border-b border-dust-khaki/20 pb-6 last:border-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-2">
            <QuestionMarkCircleIcon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
            {item.question}
          </h3>
          <p className="text-gray-600 ml-8">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * FAQ with two-column layout
 */
export function TwoColumnFAQ({ items }: { items: FAQItem[] }) {
  const midpoint = Math.ceil(items.length / 2);
  const leftColumn = items.slice(0, midpoint);
  const rightColumn = items.slice(midpoint);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <SimpleFAQ items={leftColumn} />
      </div>
      <div className="space-y-6">
        <SimpleFAQ items={rightColumn} />
      </div>
    </div>
  );
}
