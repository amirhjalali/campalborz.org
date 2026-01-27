import { ContentConfig } from './types';

/**
 * Camp Alborz Content Configuration
 *
 * This file contains all text content and copy for the website.
 * Customize these values to change the messaging for your camp.
 */
export const contentConfig: ContentConfig = {
  // Hero Section
  hero: {
    title: "Camp Alborz",
    subtitle: "Persian Hospitality in Black Rock City Since 2008",
    description:
      "We throw parties, build art cars, serve endless tea, and bring people together—from Brooklyn warehouses to the Nevada desert.",
    cta: {
      primary: {
        text: "See What We're About",
        icon: "arrow-right",
        link: "/about",
      },
      secondary: {
        text: "Support the Art",
        icon: "flame",
        link: "/donate",
      },
    },
  },

  home: {
    rumiQuote: {
      text:
        "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there.",
      attribution: "Rumi · translated by Coleman Barks",
      context:
        "800-year-old Persian poetry, still relevant at 4am on the playa.",
    },
    mediaSpotlight: {
      title: "THE CLIMB — [ALBORZ FILM 2022]",
      description:
        "A short film capturing our art cars, tea house, and the people behind it all.",
      videoUrl: "https://player.vimeo.com/video/752805495",
      cta: {
        text: "Watch on Vimeo",
        link: "https://vimeo.com/752805495",
      },
    },
    gallery: {
      title: "Moments from the Playa",
      description: "Scenes from our tea house, art cars, and the community members who make Alborz home.",
      images: [
        {
          src: "/images/migrated/alborz/025df5a3f099c8c74d1529f817f5d5f5.jpg",
          caption: "The Alborz mountain range — inspiration for our camp's name and spirit.",
        },
        {
          src: "/images/migrated/alborz/741b0955e065164bc12eadd8b26f0af4.jpg",
          caption: "Night riders gathering at our camp for a playa adventure.",
        },
        {
          src: "/images/migrated/alborz/bc5ba4c0e8a110e8e110b58c81189ff8.jpg",
          caption: "Persian calligraphy and poetry — the heart of our cultural expression.",
        },
      ],
    },
  },

  // Navigation - Custom items can be added here
  navigation: {
    enabled: true,
    customItems: [], // Empty array means use default navigation
  },

  // Footer
  footer: {
    tagline: "Tea, sound systems, and good company since 2008",
    copyright: "Camp Alborz",
  },

  // Stats - Customize these numbers for your camp
  stats: [
    {
      label: "Years Running",
      value: "15+",
      icon: "flame",
      description: "Still going strong since 2008",
      color: "from-persian-purple to-persian-violet",
    },
    {
      label: "Members Worldwide",
      value: "500+",
      icon: "users",
      description: "From LA to Tehran to Brooklyn",
      color: "from-desert-gold to-saffron",
    },
    {
      label: "Raised for Art",
      value: "$50K+",
      icon: "dollar-sign",
      description: "Poured directly into projects",
      color: "from-persian-violet to-pink-500",
    },
    {
      label: "Events Per Year",
      value: "20+",
      icon: "calendar",
      description: "Fundraisers, cleanups, parties",
      color: "from-saffron to-desert-orange",
    },
    {
      label: "Art Cars Built",
      value: "2",
      icon: "truck",
      description: "HOMA and DAMAVAND",
      color: "from-persian-purple to-desert-gold",
    },
    {
      label: "Countries Represented",
      value: "12",
      icon: "globe",
      description: "It's a global crew",
      color: "from-desert-orange to-persian-violet",
    },
  ],

  // Feature Cards - Highlight your camp's unique offerings
  features: [
    {
      title: "Tea House & Hookah Lounge",
      description: "Daily Persian chai, saffron sweets, and open hospitality in our shaded majlis.",
      icon: "coffee",
      link: "/culture",
      gradient: "from-burnt-sienna to-antique-gold",
      image: "/images/migrated/alborz/e4956d45216d473ca35c279237d61592.jpg",
    },
    {
      title: "HOMA & DAMAVAND Art Cars",
      description: "Two mobile sound stages featuring Lantern Sound Design systems and room for the whole community.",
      icon: "truck",
      link: "/art",
      gradient: "from-persian-purple to-desert-gold",
      image: "/images/migrated/homa/149889f001e2f7945fa917258838a272.jpg",
    },
    {
      title: "Fundraisers & Events",
      description: "Year-round gatherings in Los Angeles, Washington DC, New York, and beyond.",
      icon: "calendar",
      link: "/events",
      gradient: "from-saffron to-desert-orange",
      image: "/images/migrated/events/6300ec6946cc0241c54b7982d2f32e89.jpg",
    },
    {
      title: "Community Service",
      description: "Beyond the K Bridge cleanups and stewardship projects in the cities where we live.",
      icon: "check-circle",
      link: "/events",
      gradient: "from-desert-gold to-saffron",
      image: "/images/migrated/events/8778bd1886dd14180e8bcb3823e2886a.jpg",
    },
    {
      title: "Immersive Storytelling",
      description: "Postal Tales of Forgotten Souls and other narrative experiences blending Persian heritage with contemporary art.",
      icon: "book-open",
      link: "/art",
      gradient: "from-persian-violet to-pink-500",
      image: "/images/migrated/art/193f4a3f0015480546bb78faa7650751.jpg",
    },
    {
      title: "Sound Archives",
      description: "DJ sets, radio shows, and sonic experiments from our global community.",
      icon: "music",
      link: "https://soundcloud.com/camp_alborz",
      gradient: "from-antique-gold to-sunrise-coral",
      image: "/images/migrated/members/6975d80c8b032f4c5b95a1dbbea8920d.jpg",
    },
  ],

  // About Page
  about: {
    title: "About Camp Alborz",
    subtitle: "A crew of Persian-Americans, friends, and fellow travelers building stuff together since 2008",
    mission: {
      title: "What We Do",
      paragraphs: [
        "Camp Alborz is a 501(c)(3) that builds art cars, throws fundraisers, and runs a hospitality camp at Burning Man. We're a crew of builders, DJs, engineers, artists, and people who just really like making tea for strangers.",
        "We started as a group of Persian burners who wanted to bring some of our culture's hospitality traditions to the playa. Fifteen years later, we've built two art cars, hosted thousands of guests, and become a year-round community.",
        "Throughout the year, we organize fundraisers in LA and NYC, run community cleanup projects, and generally look for excuses to get together. The playa is the centerpiece, but the friendships extend far beyond it.",
        "Our camp is home base—shaded, air-conditioned, and stocked with endless tea. We feed anyone who walks in, no questions asked.",
      ],
    },
    values: [
      {
        icon: "coffee",
        title: "Open Hospitality",
        description: "Come in, sit down, have some tea. It's a Persian thing—we can't help it.",
        gradient: "from-persian-purple to-persian-violet",
      },
      {
        icon: "users",
        title: "Year-Round Crew",
        description: "The burn is one week. The friendships last the rest of the year.",
        gradient: "from-desert-gold to-saffron",
      },
      {
        icon: "wrench",
        title: "Build Together",
        description: "We make stuff with our hands—art cars, shade structures, sound systems, feasts.",
        gradient: "from-persian-violet to-pink-500",
      },
    ],
    timeline: [
      { year: "2008", event: "Camp Alborz founded by a group of Persian burners" },
      { year: "2012", event: "First major art installation unveiled on the playa" },
      { year: "2016", event: "Established as an official 501(c)(3) non-profit" },
      { year: "2022", event: "DAMAVAND art car makes its debut" },
      { year: "2023", event: "HOMA art car joins the fleet" },
      { year: "2025", event: "Community grows to 500+ members worldwide" },
    ],
    team: [
      {
        name: "Amir Jalali",
        role: "Founder & Camp Lead",
        bio: "Building Persian community at Burning Man since 2008",
      },
      {
        name: "Art Collective",
        role: "Art Direction",
        bio: "A rotating team of artists leading our installations",
      },
      {
        name: "Operations Team",
        role: "Logistics & Infrastructure",
        bio: "Coordinating camp build, transport, and playa operations",
      },
      {
        name: "Community Leads",
        role: "Membership & Events",
        bio: "Connecting members and organizing year-round gatherings",
      },
    ],
    nonprofit: {
      title: "501(c)(3) Non-Profit",
      description: "We're a registered 501(c)(3). That means your donations are tax-deductible and go straight into art cars, sound systems, and the infrastructure that keeps our camp running.",
      cta: {
        donate: "Chip In",
        join: "Join the Camp",
      },
    },
  },

  // Art Page
  art: {
    title: "Art & Installations",
    subtitle: "Persian artistic heritage meets collaborative playa art through our installations, art cars, and sponsored projects",
    categories: [
      {
        name: "Fire Art",
        count: 8,
        icon: "flame",
        gradient: "from-orange-500 to-red-600",
      },
      {
        name: "Interactive",
        count: 12,
        icon: "layers",
        gradient: "from-purple-500 to-pink-600",
      },
      {
        name: "Cultural Heritage",
        count: 15,
        icon: "palette",
        gradient: "from-blue-500 to-cyan-600",
      },
      {
        name: "Community",
        count: 20,
        icon: "users",
        gradient: "from-green-500 to-emerald-600",
      },
    ],
    installations: [
      {
        id: 1,
        title: "HOMA Art Car",
        year: "2023",
        artist: "Camp Alborz Collective",
        description: "Homa is the latest Art Car at Camp Alborz. Taking cue from the spirit of the mythological Homa Bird, it is a beautiful beast, that has risen from the ashes of its previous life as a competitive racing mud truck. As fate would have it, 2023 was the right year to show up to the playa with a mud truck! For 2024 the team is cooking up some special vocal chords, worthy of this beast.",
        location: "Black Rock City",
        participants: "Camp Alborz Team",
        impact: "Art car roaming the playa",
        gradient: "from-persian-purple to-desert-gold",
        slug: "homa",
      },
      {
        id: 2,
        title: "DAMAVAND Art Car",
        year: "2022",
        artist: "Camp Alborz Collective",
        description: "Damavand is the name of the largest peak in the Alborz mountain range. For us, Damavand is our first Art Car. It is our home away from home and our way to take the Alborz spirit on the move. In 2022 Damavand made its debut appearance on the playa. In 2023 we built resiliency into Damavand, continuing our tradition on Saturday night despite rough conditions. In 2024 we had V3 of Damavand with a top made out of more mountainous materials.",
        location: "Black Rock City",
        participants: "Camp Alborz Team",
        impact: "Art car roaming the playa",
        gradient: "from-desert-gold to-saffron",
        slug: "damavand",
      },
      {
        id: 3,
        title: "Persian Garden Concept",
        year: "TBD",
        artist: "Community Build",
        description: "A proposed installation featuring traditional Persian garden elements with interactive features. Currently in the concept phase seeking artists and funding.",
        location: "In Development",
        participants: "Open for collaboration",
        impact: "Future project",
        gradient: "from-persian-violet to-pink-500",
      },
    ],
    collaborations: [
      {
        title: "Bad Hatter — julia!",
        partners: "Winslow Porter, Neil Mendoza, Berkay Daver, Will Patrick, Asli Sevinc, Chelsea",
        description:
          "Burning Man 2024 Honoraria recipient exploring A.I. whimsy through a towering interactive hat—Alborz helped bring the installation and crew to the playa.",
        link: "https://juliamargaretlu.com/Bad-Hatter",
        year: "2024",
      },
      {
        title: "The Face Project",
        partners: "NAE Design Studio",
        description:
          "A kinetic light sculpture meditating on memory and identity; we provided fundraising support and playa logistics for the Brooklyn-based collective.",
        link: "https://www.naedesignstudio.com/burning-man",
      },
      {
        title: "Tree VR",
        partners: "New Reality Co.",
        description:
          "An award-winning mixed-reality experience that lets participants live the lifecycle of a tree—our community backed the Burning Man presentation.",
        link: "https://www.treeofficial.com/",
      },
    ],
  },

  // Events Page
  events: {
    title: "Events & Gatherings",
    subtitle: "Fundraisers, community service, and cultural events throughout the year",
    eventTypes: [
      {
        name: "Fundraisers & Club Nights",
        description: "Dance floors and DJ lineups that power our art cars and infrastructure.",
        icon: "music",
        count: 4,
        color: "bg-orange-100 text-orange-600",
      },
      {
        name: "Community Stewardship",
        description: "Hands-on cleanups and service projects like Beyond the K Bridge.",
        icon: "check-circle",
        count: 2,
        color: "bg-green-100 text-green-700",
      },
      {
        name: "Immersive Storytelling",
        description: "Postal Tales and other narrative art pieces rooted in Persian myth.",
        icon: "book-open",
        count: 3,
        color: "bg-purple-100 text-purple-600",
      },
      {
        name: "Camp Builds & Prep",
        description: "Member meetups, logistics calls, and build parties before we hit the dust.",
        icon: "wrench",
        count: 6,
        color: "bg-saffron/10 text-saffron",
      },
    ],
    upcomingEvents: [
      {
        id: 1,
        title: "Beyond The K Bridge Community Cleanup",
        date: "Ongoing • Multiple dates",
        time: "RSVP for shift details",
        location: "Kosciuszko Bridge, Brooklyn NY",
        type: "Community Service",
        description: "Join our NYC crew for neighborhood beautification and community connection beneath the K Bridge.",
        icon: "check-circle",
        color: "bg-green-100 text-green-700",
      },
      {
        id: 2,
        title: "Postal Tales of Forgotten Souls",
        date: "TBA 2026",
        time: "Immersive evening experience",
        location: "TBA • Brooklyn, NY",
        type: "Immersive Art",
        description:
          "A narrative installation exploring untold stories through the lens of undelivered letters and forgotten voices.",
        icon: "book-open",
        color: "bg-purple-100 text-purple-600",
        linkText: "View on Resident Advisor",
        linkUrl: "https://ra.co/events/2010533",
      },
      {
        id: 3,
        title: "Los Angeles Fundraiser",
        date: "June 14, 2025",
        time: "Evening event",
        location: "Los Angeles, CA",
        type: "Fundraiser",
        description:
          "An evening fundraiser supporting HOMA and DAMAVAND upgrades for the 2026 playa season.",
        icon: "music",
        color: "bg-orange-100 text-orange-600",
        linkText: "Get tickets",
        linkUrl: "https://www.eventbrite.com/e/2025-alborz-fundraiser-tickets-1364970556679",
      },
      {
        id: 4,
        title: "New York Fundraiser",
        date: "July 2025",
        time: "TBA",
        location: "New York, NY",
        type: "Fundraiser",
        description:
          "Annual NYC gathering with music, hospitality, and community. Details announced via our mailing list.",
        icon: "heart",
        color: "bg-rose-100 text-rose-600",
      },
    ],
    burningManSchedule: [
      {
        day: "Daily Schedule",
        events: [
          { time: "Morning", title: "Tea House Opens", description: "Persian chai and light refreshments available" },
          { time: "Afternoon", title: "Open Hospitality", description: "Hookah lounge and shade for visitors" },
          { time: "Evening", title: "Community Dinner", description: "Shared meals for camp members" },
        ],
      },
      {
        day: "Special Events",
        events: [
          { time: "Varies", title: "Art Car Rides", description: "HOMA and DAMAVAND tours when available" },
          { time: "Varies", title: "Cultural Workshops", description: "Calligraphy, cooking, and music sessions" },
          { time: "Saturday", title: "Saturday Night Celebration", description: "Annual signature camp event" },
        ],
      },
    ],
    guidelines: {
      beforeAttending: [
        "RSVP using official links so we can plan resources appropriately",
        "Dress for the occasion—work clothes for service, event attire for gatherings",
        "Bring ID, water, and anything you'd like to contribute",
        "Respect capacity limits and ticketing processes",
      ],
      communityValues: [
        "Practice consent and inclusion in all interactions",
        "Leave no trace at all venues and events",
        "Share resources, knowledge, and transportation when possible",
        "Acknowledge contributions to strengthen community bonds",
      ],
    },
    cta: {
      title: "Come to an Event",
      description: "New around here? Show up to something—that's the best way to meet people and see what we're about.",
      buttons: {
        primary: { text: "Upcoming Events", link: "/events" },
        secondary: { text: "About Us", link: "/about" },
      },
    },
  },

  // Donate Page
  donate: {
    title: "Support Camp Alborz",
    subtitle: "Help us build art cars, throw parties, and keep the tea flowing",
    impactStats: [
      {
        number: "$45,000",
        label: "Raised in 2023",
        icon: "dollar-sign",
      },
      {
        number: "125",
        label: "Individual Donors",
        icon: "users",
      },
      {
        number: "8",
        label: "Art Projects Funded",
        icon: "wrench",
      },
      {
        number: "500+",
        label: "Community Members Served",
        icon: "heart",
      },
    ],
    donationTiers: [
      {
        amount: 25,
        title: "Tea Fund",
        description: "Keeps the chai pot full all week",
        perks: ["Camp sticker", "Thank you email"],
        popular: false,
      },
      {
        amount: 75,
        title: "Build Crew",
        description: "Buys materials for our art projects",
        perks: ["Camp sticker", "Thank you email", "Progress updates"],
        popular: false,
      },
      {
        amount: 150,
        title: "Sound System Sponsor",
        description: "Helps keep the music going",
        perks: ["Camp sticker", "Thank you email", "Progress updates", "Invite to donor meetup"],
        popular: true,
      },
      {
        amount: 300,
        title: "Shade Structure Hero",
        description: "Funds the infrastructure that keeps us cool",
        perks: ["Camp sticker", "Thank you email", "Progress updates", "Invite to donor meetup", "Camp t-shirt"],
        popular: false,
      },
      {
        amount: 500,
        title: "Art Car Patron",
        description: "Directly funds HOMA and DAMAVAND",
        perks: ["All previous perks", "Recognition on camp website", "Camp hoodie"],
        popular: false,
      },
    ],
    fundingPriorities: [
      {
        title: "Art Installations",
        percentage: 35,
        amount: 12250,
        goal: 35000,
        description: "Materials and tools for our 2026 art projects",
        icon: "wrench",
        color: "bg-orange-500",
      },
      {
        title: "Infrastructure",
        percentage: 28,
        amount: 9800,
        goal: 35000,
        description: "Shade structures, lighting, and camp facilities",
        icon: "truck",
        color: "bg-blue-500",
      },
      {
        title: "Community Programs",
        percentage: 20,
        amount: 7000,
        goal: 35000,
        description: "Workshops, cultural events, and education",
        icon: "users",
        color: "bg-green-500",
      },
      {
        title: "Emergency Fund",
        percentage: 17,
        amount: 5950,
        goal: 35000,
        description: "Unexpected costs and contingency planning",
        icon: "heart",
        color: "bg-purple-500",
      },
    ],
    transparencyItems: [
      {
        category: "Art & Installations",
        percentage: 40,
        amount: "$18,000",
        description: "Materials, tools, transportation for art projects",
      },
      {
        category: "Camp Infrastructure",
        percentage: 30,
        amount: "$13,500",
        description: "Shade structures, lighting, kitchen, utilities",
      },
      {
        category: "Community Events",
        percentage: 15,
        amount: "$6,750",
        description: "Workshops, cultural events, food for gatherings",
      },
      {
        category: "Transportation",
        percentage: 10,
        amount: "$4,500",
        description: "Truck rental, fuel, logistics",
      },
      {
        category: "Administrative",
        percentage: 5,
        amount: "$2,250",
        description: "Registration fees, permits, insurance",
      },
    ],
    otherWaysToHelp: [
      {
        title: "Sponsor a Workshop",
        description: "Fund specific cultural or artistic workshops",
        icon: "gift",
        amount: "$200-500",
      },
      {
        title: "Adopt an Art Project",
        description: "Fully sponsor a community art installation",
        icon: "wrench",
        amount: "$1,000-3,000",
      },
      {
        title: "Corporate Sponsorship",
        description: "Partner with us for larger initiatives",
        icon: "bar-chart-3",
        amount: "$2,500+",
      },
      {
        title: "In-Kind Donations",
        description: "Donate materials, tools, or services",
        icon: "truck",
        amount: "Various",
      },
    ],
    donorRecognition: {
      title: "Thank You to Our 2023 Supporters",
      description: "Shoutout to everyone who helped make this happen",
      tiers: [
        {
          title: "Art Car Patrons ($500+)",
          description: "Major contributors who fund the big stuff",
        },
        {
          title: "Sound System Sponsors ($150+)",
          description: "Everyone else who chips in to keep things running",
        },
      ],
    },
    taxInfo: {
      title: "Tax Deductible Donations",
      description: "Camp Alborz is a registered 501(c)(3) non-profit organization. All donations are tax-deductible to the full extent allowed by law.",
      ein: "XX-XXXXXXX",
    },
    donationForm: {
      title: "Pitch In",
      description: "Every dollar goes directly into the camp—art cars, sound systems, shade structures, and endless tea.",
      campaigns: [
        "Art & Installations",
        "Camp Infrastructure",
        "Community Events",
        "Transportation",
        "Burning Man 2026",
      ],
    },
    paymentOptions: [
      {
        method: "Zelle · payments@campalborz.org",
        description: "Preferred method — zero fees so every dollar reaches the camp.",
        details: [
          "Add the camper names you’re covering in the memo.",
          "Need paperwork for reimbursements or matching? Email support@campalborz.org.",
        ],
        icon: "check-circle",
        badge: "Preferred",
      },
      {
        method: "PayPal · payments@campalborz.org",
        description: "Great when you need to pay with a credit card.",
        details: [
          "Please add the 3% processing fee (~$35 per membership).",
          "Include a note stating which welcomed Alborzian(s) you’re paying for.",
        ],
        icon: "dollar-sign",
      },
      {
        method: "Camp Alborz 2025 Fundraiser",
        description: "Givebutter campaign powering HOMA, DAMAVAND, and hospitality upgrades.",
        details: [
          "Tax-deductible receipt delivered instantly.",
          "Share the link with friends who want to support the art cars.",
        ],
        icon: "heart",
        linkText: "Open Givebutter",
        linkUrl: "https://givebutter.com/Alborz2025Fundraiser",
      },
      {
        method: "Givebutter · General Donations",
        description: "Perfect for contributions beyond dues or employer matching programs.",
        details: [
          "Receipts available for your records or company match.",
          "Every contribution funds art, service projects, and Persian hospitality.",
        ],
        icon: "gift",
        linkText: "Donate on Givebutter",
        linkUrl: "https://givebutter.com/Alborz2025",
      },
    ],
    gratitude: {
      title: "Thanks for chipping in!",
      message:
        "Every dollar goes into the art cars, sound systems, and infrastructure that make the camp run. We'll keep you posted on what we build.",
    },
    cta: {
      title: "Other Ways to Support",
      description: "Beyond donations, you can support our mission by joining our community and volunteering",
      buttons: {
        primary: { text: "About Camp Alborz", link: "/about" },
        secondary: { text: "Volunteer at Events", link: "/events" },
      },
    },
  },

  // Culture Page
  culture: {
    title: "Persian Culture & Heritage",
    subtitle: "The traditions, food, music, and poetry that inspire what we do",
    culturalElements: [
      {
        title: "Persian Poetry",
        description: "Explore the works of Rumi, Hafez, and contemporary Persian poets",
        icon: "book-open",
        activities: ["Poetry readings", "Calligraphy workshops", "Translation circles"],
        color: "bg-purple-100 text-purple-600",
      },
      {
        title: "Traditional Music",
        description: "Experience the rich musical heritage of Iran",
        icon: "music",
        activities: ["Tar and setar performances", "Folk singing", "Music appreciation"],
        color: "bg-blue-100 text-blue-600",
      },
      {
        title: "Persian Cuisine",
        description: "Learn about traditional cooking and food culture",
        icon: "flame",
        activities: ["Cooking classes", "Tea ceremonies", "Spice workshops"],
        color: "bg-green-100 text-green-600",
      },
      {
        title: "Art & Crafts",
        description: "Traditional Persian arts and contemporary interpretations",
        icon: "palette",
        activities: ["Miniature painting", "Carpet weaving", "Metalwork"],
        color: "bg-orange-100 text-orange-600",
      },
    ],
    culturalValues: [
      {
        title: "Hospitality (Mehmān-navāzī)",
        description: "The Persian tradition of welcoming guests with warmth and generosity",
        example: "Our camp opens its doors to all, offering tea and conversation to any visitor",
        icon: "heart",
      },
      {
        title: "Respect for Elders",
        description: "Honoring the wisdom and experience of our community elders",
        example: "We seek guidance from experienced burners and Persian cultural experts",
        icon: "users",
      },
      {
        title: "Education & Learning",
        description: "The high value placed on knowledge, wisdom, and intellectual growth",
        example: "Our workshops and discussions encourage continuous learning and curiosity",
        icon: "graduation-cap",
      },
      {
        title: "Artistic Expression",
        description: "The celebration of beauty in all its forms through art and creativity",
        example: "We integrate traditional Persian aesthetics into our Burning Man installations",
        icon: "palette",
      },
    ],
    workshops: [
      {
        title: "Persian Calligraphy",
        instructor: "Maryam Hosseini",
        level: "Beginner Friendly",
        duration: "2 hours",
        description: "Learn the beautiful art of Persian script writing using traditional techniques and modern tools.",
        materials: "Provided",
        frequency: "Monthly",
      },
      {
        title: "Traditional Cooking",
        instructor: "Community Chefs",
        level: "All Levels",
        duration: "3 hours",
        description: "Master classic Persian dishes like fesenjan, tahdig, and baklava in our communal kitchen.",
        materials: "Included",
        frequency: "Bi-weekly",
      },
      {
        title: "Poetry & Storytelling",
        instructor: "Various Members",
        level: "All Levels",
        duration: "90 minutes",
        description: "Share and discuss Persian poetry, both classical and contemporary, in English and Farsi.",
        materials: "Books provided",
        frequency: "Weekly",
      },
      {
        title: "Traditional Dance",
        instructor: "Sara Mohammadi",
        level: "Beginner",
        duration: "1.5 hours",
        description: "Learn folk dances from different regions of Iran in a welcoming, inclusive environment.",
        materials: "Comfortable clothing",
        frequency: "Monthly",
      },
    ],
    celebrations: [
      {
        name: "Nowruz (Persian New Year)",
        date: "March 20",
        description: "Celebrating the spring equinox with traditional ceremonies, foods, and renewal rituals",
        traditions: ["Haft-sin table", "Spring cleaning", "Family gatherings", "Gift giving"],
      },
      {
        name: "Yalda Night",
        date: "December 21",
        description: "The longest night of the year celebrated with poetry, pomegranates, and community",
        traditions: ["Poetry reading", "Pomegranate sharing", "Staying up all night", "Storytelling"],
      },
      {
        name: "Chaharshanbe Suri",
        date: "Last Wednesday before Nowruz",
        description: "Fire jumping festival to cleanse the past year and welcome the new",
        traditions: ["Jumping over fires", "Cleansing rituals", "Community bonfires", "Wish making"],
      },
    ],
    learningResources: [
      {
        category: "Language",
        resources: [
          "Basic Farsi phrases for camp",
          "Poetry reading in original Farsi",
          "Cultural context for language use",
        ],
      },
      {
        category: "History",
        resources: [
          "Ancient Persian empires",
          "Modern Iranian culture",
          "Persian contributions to world civilization",
        ],
      },
      {
        category: "Arts",
        resources: [
          "Traditional Persian music instruments",
          "Calligraphy and miniature painting",
          "Carpet patterns and their meanings",
        ],
      },
      {
        category: "Literature",
        resources: [
          "Classical poets: Rumi, Hafez, Ferdowsi",
          "Contemporary Persian writers",
          "Translation and interpretation techniques",
        ],
      },
    ],
    culturalBridge: {
      missionTitle: "Why We Do This",
      mission: [
        "Persian culture has a long tradition of welcoming strangers with food, tea, and conversation. We bring that to the playa.",
        "You don't need to be Persian to hang out with us. Come for the tea, stay for the music, leave with some new friends.",
      ],
      howWeDoItTitle: "How We Do It",
      howWeDoIt: [
        { icon: "globe", text: "Welcoming people of all backgrounds to explore Persian culture" },
        { icon: "users", text: "Creating inclusive spaces for cultural dialogue and learning" },
        { icon: "book-open", text: "Sharing stories, traditions, and values through interactive experiences" },
        { icon: "heart", text: "Building lasting friendships across cultural boundaries" },
      ],
    },
    cta: {
      title: "Come Hang Out",
      description: "Persian or not, curious or just hungry—everyone's welcome. Swing by an event and see what we're about.",
      buttons: {
        primary: { text: "See Events", link: "/events" },
        secondary: { text: "About Us", link: "/about" },
      },
    },
  },

  // Members Page
  members: {
    title: "Member Portal",
    subtitle: "Info for camp members, payment details, and resources",
    loginSection: {
      title: "Member Login",
      emailLabel: "Email",
      passwordLabel: "Password",
      submitButton: "Sign In",
      notMemberText: "Not a member yet?",
      applyLinkText: "Apply to join",
    },
    benefits: {
      title: "Member Benefits",
      subtitle: "Exclusive perks for our camp family",
      items: [
        {
          icon: "shield",
          title: "Priority Placement",
          description: "Guaranteed spot at our camp during Burning Man",
          gradient: "from-persian-purple to-persian-violet",
        },
        {
          icon: "heart",
          title: "Year-Round Events",
          description: "Access to exclusive gatherings and workshops",
          gradient: "from-desert-gold to-saffron",
        },
        {
          icon: "award",
          title: "Art Grants",
          description: "Funding support for your creative projects",
          gradient: "from-persian-violet to-pink-500",
        },
        {
          icon: "users",
          title: "Global Network",
          description: "Connect with members worldwide",
          gradient: "from-saffron to-desert-orange",
        },
      ],
    },
    spotlight: {
      title: "Member Spotlight",
      subtitle: "Meet some of our amazing contributors",
      members: [
        {
          name: "Sarah Martinez",
          role: "Art Lead",
          years: "5 years",
          contribution: "Led the HOMA Fire Sculpture project",
          gradient: "from-persian-purple to-desert-gold",
        },
        {
          name: "Ali Rezaei",
          role: "Kitchen Coordinator",
          years: "8 years",
          contribution: "Feeds 100+ people daily at Burning Man",
          gradient: "from-desert-gold to-saffron",
        },
        {
          name: "Emma Chen",
          role: "Build Lead",
          years: "3 years",
          contribution: "Designed our iconic shade structure",
          gradient: "from-persian-violet to-pink-500",
        },
      ],
    },
    communityStats: [
      { value: "500+", label: "Active Members", icon: "users" },
      { value: "15", label: "Countries", icon: "star" },
      { value: "100+", label: "Events Annually", icon: "calendar" },
      { value: "$50K", label: "Art Grants Given", icon: "award" },
    ],
    portalInfo: {
      welcomeTitle: "Welcome to Camp Alborz",
      highlights: [
        {
          title: "Complete the membership form",
          description: "Share your arrival plans, vehicles, and camp needs within one week of receiving your welcome email.",
          linkText: "2025 Membership Form",
          linkUrl: "https://forms.gle/6YCQonYgfx8vo9oY8",
        },
        {
          title: "Submit dues promptly",
          description: "Dues are $1,200 per person. Only pay for welcomed Alborzians and include everyone’s names in the memo.",
        },
      ],
      dues: {
        amountLabel: "$1,200 per person",
        description: "Covers shade, kitchen, sound, ice, water, fuel, meals, and the infrastructure that keeps our Persian oasis running.",
        breakdown: [
          "Send payment within one week of submitting your membership form to secure your spot.",
          "Let us know who you are sharing a tent, RV, or grid line with—especially if you’re splitting fees.",
        ],
        gridFees: [
          { label: "Tent AC grid fee", amount: "$500", description: "Optional power drop for personal AC units in tents." },
          { label: "30 AMP RV grid fee", amount: "$1,000", description: "Per RV connection; split it with your rig mates." },
          { label: "50 AMP add-on", amount: "$500", description: "Limited availability—email us so we can coordinate with the vendor." },
        ],
      },
      paymentOptions: [
        {
          method: "Zelle · payments@campalborz.org",
          description: "Preferred for dues and grid fees—no platform fees, instant confirmation.",
          details: [
            "Only pay for people who have been officially welcomed.",
            "List every camper covered in the memo so we can track your payment.",
          ],
          icon: "check-circle",
          badge: "Preferred",
        },
        {
          method: "PayPal · payments@campalborz.org",
          description: "Use when you need to pay with a credit card.",
          details: [
            "Add the 3% processing fee (~$35) per membership.",
            "Select “Friends & Family” when possible to reduce fees.",
          ],
          icon: "dollar-sign",
        },
        {
          method: "Givebutter · tax-deductible donations",
          description: "Contribute beyond dues or help sponsor another camper.",
          details: [
            "Receipts available instantly—perfect for employer matching.",
            "Link donations to “Camp Alborz 2025” so we apply them correctly.",
          ],
          icon: "gift",
          linkText: "Open Givebutter",
          linkUrl: "https://givebutter.com/Alborz2025",
        },
      ],
      resources: [
        {
          title: "Member Welcome Document",
          description: "Timelines, packing lists, roles, and everything you need before arriving on playa.",
          linkText: "Read the guide",
          linkUrl: "https://docs.google.com/document/d/1J-XqS524V3FqX5Rjl1_cP99QWQ_--UXudIs6Eeq-7oI/edit?usp=sharing",
        },
        {
          title: "Feeling generous?",
          description: "Alborz is now a 501c3—donations above dues keep the art cars roaring.",
          linkText: "Donate on Givebutter",
          linkUrl: "https://givebutter.com/Alborz2025",
        },
      ],
      fundraisers: [
        {
          title: "Los Angeles Fundraiser",
          date: "June 14, 2025",
          description: "Dance with us in LA while raising funds for HOMA and DAMAVAND upgrades.",
          linkText: "Buy tickets",
          linkUrl: "https://www.eventbrite.com/e/2025-alborz-fundraiser-tickets-1364970556679",
        },
        {
          title: "New York Fundraiser",
          date: "July 2025",
          description: "Details TBA—watch the WhatsApp group for lineup and location.",
        },
      ],
    },
    cta: {
      title: "Want to Help Out?",
      description: "We're always looking for people who want to build stuff, throw parties, or just help out",
      buttons: {
        primary: { text: "Donate", link: "/donate" },
        secondary: { text: "About Us", link: "/about" },
      },
    },
  },

  // Apply Page
  apply: {
    title: "Join the Camp",
    subtitle: "Fill out the form, tell us about yourself, and we'll be in touch",
    form: {
      title: "Membership Application",
      fields: {
        personalInfo: {
          title: "Personal Information",
          nameLabel: "Full Name *",
          emailLabel: "Email Address *",
          phoneLabel: "Phone Number *",
          emergencyContactLabel: "Emergency Contact *",
          emergencyContactPlaceholder: "Name and phone number",
        },
        experienceLabel: "Burning Man Experience",
        experienceOptions: [
          { value: "", label: "Select your experience level" },
          { value: "first-time", label: "First-time Burner" },
          { value: "1-3-years", label: "1-3 years" },
          { value: "4-7-years", label: "4-7 years" },
          { value: "8-plus-years", label: "8+ years" },
          { value: "veteran", label: "Veteran (15+ years)" },
        ],
        interestsLabel: "What interests you about Camp Alborz? *",
        interestsPlaceholder: "Tell us what draws you to our camp...",
        contributionLabel: "How would you like to contribute? *",
        contributionPlaceholder: "Skills, time, resources, ideas...",
        dietaryLabel: "Dietary Requirements/Allergies",
        dietaryPlaceholder: "Any dietary restrictions or allergies we should know about?",
      },
      beforeYouApply: {
        title: "Good to Know",
        items: [
          "Dues are $1,200 and cover shade, food, infrastructure, and camp operations",
          "Everyone helps with setup and teardown—no exceptions",
          "We welcome everyone, but you have to actually participate",
          "Show up ready to pitch in and hang out",
        ],
      },
      submitButton: "Submit Application",
      successMessage: "Application submitted! We'll be in touch soon.",
      reviewMessage: "We'll review your application and get back to you within a week",
    },
    process: {
      title: "What Happens Next?",
      steps: [
        {
          stepNumber: 1,
          title: "We Read It",
          description: "Someone on the team reviews your application",
        },
        {
          stepNumber: 2,
          title: "We Chat",
          description: "Quick call or meetup to say hi",
        },
        {
          stepNumber: 3,
          title: "You're In",
          description: "Welcome to the camp—time to start planning",
        },
      ],
    },
    externalApplication: {
      description: "Prefer the classic Google Form? Submit the official interest form directly on Google.",
      linkText: "Open the Alborz Application Form",
      linkUrl: "https://forms.gle/EbuR1omywjH62yYX8",
      note: "This links out to the same intake form referenced on the legacy site.",
    },
  },

  // Search Page
  search: {
    title: "Search Camp Alborz",
    subtitle: "Find events, members, content, and everything about our Persian community",
    searchPlaceholder: "Search for anything...",
    categories: {
      title: "Search Categories",
      subtitle: "Browse content by category",
      items: [
        { id: "all", label: "All Content", icon: "search", count: "240+" },
        { id: "events", label: "Events", icon: "calendar", count: "12" },
        { id: "members", label: "Members", icon: "users", count: "45" },
        { id: "posts", label: "Posts", icon: "file-text", count: "89" },
        { id: "art", label: "Art & Culture", icon: "palette", count: "94" },
      ],
    },
    results: {
      title: "Search Results",
      mockResults: [
        {
          title: "Annual Camp Setup",
          type: "Event",
          excerpt: "Join us for the annual camp setup at Black Rock City. We arrive early to establish our Persian oasis in the desert.",
          date: "August",
        },
        {
          title: "Persian Poetry Night",
          type: "Culture",
          excerpt: "An evening of Rumi and Hafez poetry readings under the stars, accompanied by traditional Persian tea.",
          date: "Monthly",
        },
        {
          title: "HOMA Fire Sculpture",
          type: "Art",
          excerpt: "Our signature art installation representing the eternal flame of Persian culture and community.",
          date: "Ongoing Project",
        },
      ],
    },
    popularSearches: {
      title: "Popular Searches",
      terms: [
        "burning man",
        "art cars",
        "HOMA",
        "DAMAVAND",
        "fundraiser",
        "join the camp",
      ],
    },
  },
};
