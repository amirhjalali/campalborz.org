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
    title: "Welcome to Camp Alborz",
    subtitle: "Where Persian hospitality meets the spirit of Burning Man",
    description: "For over 15 years, we've created a home on the playa where ancient Persian culture blends with radical self-expression, building community through art, hospitality, and shared experiences.",
    cta: {
      primary: {
        text: "Explore Our World",
        icon: "tent",
        link: "/experience",
      },
      secondary: {
        text: "Join Our Community",
        icon: "heart",
        link: "/join",
      },
    },
  },

  // Navigation - Custom items can be added here
  navigation: {
    enabled: true,
    customItems: [], // Empty array means use default navigation
  },

  // Footer
  footer: {
    tagline: "Building community through art, culture, and radical hospitality",
    copyright: "Camp Alborz",
  },

  // Stats - Customize these numbers for your camp
  stats: [
    {
      label: "Years of Magic",
      value: "15+",
      icon: "flame",
      description: "Creating unforgettable experiences",
      color: "from-persian-purple to-persian-violet",
    },
    {
      label: "Members Worldwide",
      value: "500+",
      icon: "users",
      description: "A global community united",
      color: "from-desert-gold to-saffron",
    },
    {
      label: "Raised for Charity",
      value: "$50K",
      icon: "dollar-sign",
      description: "Supporting arts and education",
      color: "from-persian-violet to-pink-500",
    },
    {
      label: "Events Per Year",
      value: "20+",
      icon: "calendar",
      description: "Year-round gatherings",
      color: "from-saffron to-desert-orange",
    },
    {
      label: "Art Projects Funded",
      value: "5",
      icon: "heart",
      description: "Major installations created",
      color: "from-persian-purple to-desert-gold",
    },
    {
      label: "Countries Reached",
      value: "12",
      icon: "globe",
      description: "International community",
      color: "from-desert-orange to-persian-violet",
    },
  ],

  // Feature Cards - Highlight your camp's unique offerings
  features: [
    {
      title: "Experience Burning Man",
      description: "Join us in Black Rock City for an unforgettable week of art, community, and radical self-expression.",
      icon: "tent",
      link: "/experience/burning-man",
      gradient: "from-burnt-sienna to-antique-gold",
      image: "/images/burning-man-camp.jpg",
    },
    {
      title: "Discover Persian Art",
      description: "Explore our rich cultural heritage through traditional crafts, music, poetry, and contemporary art.",
      icon: "palette",
      link: "/art",
      gradient: "from-desert-gold to-saffron",
      image: "/images/persian-art.jpg",
    },
    {
      title: "Build Community",
      description: "Connect with amazing people from around the world who share our values of hospitality and creativity.",
      icon: "users",
      link: "/community",
      gradient: "from-antique-gold to-sunrise-coral",
      image: "/images/community.jpg",
    },
    {
      title: "Year-Round Events",
      description: "From fundraisers to cultural celebrations, we gather throughout the year to strengthen our bonds.",
      icon: "calendar",
      link: "/events",
      gradient: "from-saffron to-desert-orange",
      image: "/images/events.jpg",
    },
    {
      title: "Support Our Mission",
      description: "Help us create transformative experiences and support arts education in underserved communities.",
      icon: "heart",
      link: "/donate",
      gradient: "from-sunrise-coral to-burnt-sienna",
      image: "/images/support.jpg",
    },
    {
      title: "Global Network",
      description: "Be part of an international community that spans continents and cultures.",
      icon: "globe",
      link: "/about/global",
      gradient: "from-desert-orange to-antique-gold",
      image: "/images/global.jpg",
    },
  ],

  // About Page
  about: {
    title: "About Camp Alborz",
    subtitle: "A celebration of Persian culture, community, and creativity in the heart of Black Rock City",
    mission: {
      title: "Our Mission",
      paragraphs: [
        "Camp Alborz brings together the rich traditions of Persian culture with the transformative spirit of Burning Man. We create a space where ancient wisdom meets radical self-expression, fostering community, creativity, and cultural exchange.",
        "Named after Mount Alborz, the highest peak in Iran, our camp stands as a beacon of Persian heritage while embracing the diversity and inclusivity that makes the Burning Man community so special.",
      ],
    },
    values: [
      {
        icon: "heart",
        title: "Radical Hospitality",
        description: "Persian culture meets playa spirit - everyone is welcome at our tea house.",
        gradient: "from-persian-purple to-persian-violet",
      },
      {
        icon: "users",
        title: "Community First",
        description: "Building lasting bonds that extend far beyond Black Rock City.",
        gradient: "from-desert-gold to-saffron",
      },
      {
        icon: "globe",
        title: "Cultural Bridge",
        description: "Connecting East and West through art, food, and shared experiences.",
        gradient: "from-persian-violet to-pink-500",
      },
    ],
    timeline: [
      { year: "2008", event: "Camp Alborz founded by Persian burners" },
      { year: "2012", event: "First major art installation: Persian Garden" },
      { year: "2016", event: "Became official 501(c)(3) non-profit" },
      { year: "2020", event: "Virtual Burns during pandemic" },
      { year: "2023", event: "HOMA Fire Sculpture debut" },
      { year: "2024", event: "500+ members worldwide" },
    ],
    team: [
      {
        name: "Amir Jalali",
        role: "Founder & Camp Lead",
        bio: "Bringing Persian hospitality to the playa since 2008",
      },
      {
        name: "Maryam Hosseini",
        role: "Art Director",
        bio: "Leading our creative vision and art installations",
      },
      {
        name: "David Chen",
        role: "Operations Lead",
        bio: "Making the impossible possible, year after year",
      },
      {
        name: "Sara Mohammadi",
        role: "Community Manager",
        bio: "Fostering connections that last a lifetime",
      },
    ],
    nonprofit: {
      title: "501(c)(3) Non-Profit",
      description: "Camp Alborz is a registered 501(c)(3) non-profit organization dedicated to promoting cultural exchange, artistic expression, and community building. Your donations are tax-deductible and directly support our mission.",
      cta: {
        donate: "Support Our Mission",
        join: "Join Our Camp",
      },
    },
  },

  // Art Page
  art: {
    title: "Art & Culture",
    subtitle: "Where Persian artistic heritage meets radical self-expression, creating transformative experiences through collaborative art",
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
        icon: "sparkles",
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
        title: "HOMA Fire Sculpture",
        year: "2023",
        artist: "Camp Alborz Collective",
        description: "A 20-foot tall interactive fire sculpture representing the sacred Persian fire altar, featuring programmable LED patterns that respond to music and movement.",
        location: "7:30 & Esplanade",
        participants: "15 artists",
        impact: "Visited by 5,000+ burners",
        gradient: "from-persian-purple to-desert-gold",
      },
      {
        id: 2,
        title: "DAMAVAND Project",
        year: "2022",
        artist: "International Collaboration",
        description: "An immersive installation inspired by Mount Damavand, featuring mirrors and light to create an infinite mountain range experience.",
        location: "Camp Alborz",
        participants: "8 artists",
        impact: "Featured in Burning Man Journal",
        gradient: "from-desert-gold to-saffron",
      },
      {
        id: 3,
        title: "Persian Garden Oasis",
        year: "2024",
        artist: "Community Build",
        description: "A living art piece featuring traditional Persian garden elements with interactive water features and aromatic plants.",
        location: "In Development",
        participants: "12 artists",
        impact: "Coming to BM 2024",
        gradient: "from-persian-violet to-pink-500",
      },
    ],
  },

  // Events Page
  events: {
    title: "Camp Events & Activities",
    subtitle: "Join us throughout the year for art builds, cultural celebrations, workshops, and community gatherings",
    eventTypes: [
      {
        name: "Art Builds",
        description: "Collaborative construction of our installations",
        icon: "wrench",
        count: 8,
        color: "bg-saffron/10 text-saffron",
      },
      {
        name: "Cultural Events",
        description: "Persian celebrations and cultural exchanges",
        icon: "heart",
        count: 6,
        color: "bg-persian-purple/10 text-persian-purple",
      },
      {
        name: "Workshops",
        description: "Educational sessions and skill sharing",
        icon: "graduation-cap",
        count: 12,
        color: "bg-desert-gold/10 text-desert-gold",
      },
      {
        name: "Social Gatherings",
        description: "Community bonding and networking events",
        icon: "users",
        count: 15,
        color: "bg-midnight/10 text-midnight",
      },
    ],
    upcomingEvents: [
      {
        id: 1,
        title: "Pre-Burn Art Build Weekend",
        date: "March 15-17, 2024",
        time: "9:00 AM - 6:00 PM",
        location: "Community Workshop, Oakland",
        type: "Art Build",
        description: "Join us for a intensive weekend of building our 2024 art installation. All skill levels welcome!",
        attendees: 25,
        maxAttendees: 30,
        icon: "wrench",
        color: "bg-orange-100 text-orange-600",
      },
      {
        id: 2,
        title: "Persian New Year Celebration",
        date: "March 20, 2024",
        time: "6:00 PM - 11:00 PM",
        location: "Persian Cultural Center, SF",
        type: "Cultural",
        description: "Celebrate Nowruz with traditional Persian food, music, and poetry. Open to all community members.",
        attendees: 45,
        maxAttendees: 60,
        icon: "heart",
        color: "bg-purple-100 text-purple-600",
      },
      {
        id: 3,
        title: "Fundraising Dinner & Auction",
        date: "April 12, 2024",
        time: "7:00 PM - 10:00 PM",
        location: "Private Residence, Berkeley",
        type: "Fundraising",
        description: "Annual fundraising event with silent auction and Persian cuisine to support our 2024 burn.",
        attendees: 38,
        maxAttendees: 50,
        icon: "heart",
        color: "bg-green-100 text-green-600",
      },
      {
        id: 4,
        title: "Burning Man Prep Workshop",
        date: "July 20, 2024",
        time: "10:00 AM - 4:00 PM",
        location: "Camp Alborz Warehouse",
        type: "Workshop",
        description: "Essential prep for new burners: packing lists, survival tips, and camp expectations.",
        attendees: 12,
        maxAttendees: 20,
        icon: "graduation-cap",
        color: "bg-blue-100 text-blue-600",
      },
    ],
    burningManSchedule: [
      {
        day: "Monday",
        events: [
          { time: "4:00 PM", title: "Arrival & Camp Setup", description: "Welcome new members, set up camp infrastructure" },
          { time: "6:00 PM", title: "Persian Tea Ceremony", description: "Traditional welcome ceremony with tea and sweets" },
          { time: "8:00 PM", title: "Community Dinner", description: "First shared meal to bring everyone together" },
        ],
      },
      {
        day: "Tuesday",
        events: [
          { time: "10:00 AM", title: "Persian Calligraphy Workshop", description: "Learn traditional Persian writing arts" },
          { time: "2:00 PM", title: "Art Installation Tour", description: "Visit and learn about our collaborative installations" },
          { time: "7:00 PM", title: "Poetry & Music Night", description: "Share Persian poetry and traditional music" },
        ],
      },
      {
        day: "Wednesday",
        events: [
          { time: "11:00 AM", title: "Persian Cooking Class", description: "Learn to make traditional Persian dishes" },
          { time: "4:00 PM", title: "Mindfulness & Meditation", description: "Persian-inspired meditation practices" },
          { time: "8:00 PM", title: "Cultural Exchange", description: "Share stories and traditions from different backgrounds" },
        ],
      },
      {
        day: "Thursday",
        events: [
          { time: "9:00 AM", title: "Art Build Continuation", description: "Complete ongoing installation projects" },
          { time: "3:00 PM", title: "Persian Dance Workshop", description: "Learn traditional Persian folk dances" },
          { time: "6:00 PM", title: "Community Potluck", description: "Everyone contributes to a massive shared feast" },
        ],
      },
    ],
    guidelines: {
      beforeAttending: [
        "RSVP in advance to help us plan",
        "Check event requirements and bring necessary items",
        "Arrive on time and ready to participate",
        "Bring a positive attitude and open mind",
      ],
      communityValues: [
        "Respect all participants regardless of background",
        "Practice radical inclusion and consent",
        "Clean up after yourself and help others",
        "Share knowledge and learn from others",
      ],
    },
    cta: {
      title: "Join Our Next Event",
      description: "New to Camp Alborz? Attending an event is the perfect way to meet our community and see if we're a good fit for each other.",
      buttons: {
        primary: { text: "Join as Member", link: "/apply" },
        secondary: { text: "Learn More About Us", link: "/about" },
      },
    },
  },

  // Donate Page
  donate: {
    title: "Support Camp Alborz",
    subtitle: "Help us create transformative experiences, build beautiful art, and share Persian culture with the Burning Man community",
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
        title: "Tea Ceremony Supporter",
        description: "Helps fund our daily Persian tea ceremonies",
        perks: ["Camp sticker", "Thank you email"],
        popular: false,
      },
      {
        amount: 75,
        title: "Art Build Contributor",
        description: "Supports materials for community art projects",
        perks: ["Camp sticker", "Thank you email", "Progress updates"],
        popular: false,
      },
      {
        amount: 150,
        title: "Community Builder",
        description: "Funds workshops and community events",
        perks: ["Camp sticker", "Thank you email", "Progress updates", "Invite to donor meetup"],
        popular: true,
      },
      {
        amount: 300,
        title: "Infrastructure Champion",
        description: "Helps with camp setup and infrastructure",
        perks: ["Camp sticker", "Thank you email", "Progress updates", "Invite to donor meetup", "Camp t-shirt"],
        popular: false,
      },
      {
        amount: 500,
        title: "Cultural Ambassador",
        description: "Sponsors cultural education programs",
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
        description: "Materials and tools for our 2024 art projects",
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
      description: "We're grateful to everyone who made our vision possible",
      tiers: [
        {
          title: "Cultural Ambassadors ($500+)",
          description: "Special thanks to our major donors who enable our largest initiatives",
        },
        {
          title: "Community Builders ($150+)",
          description: "And to all our community builders who support our regular programming",
        },
      ],
    },
    taxInfo: {
      title: "Tax Deductible Donations",
      description: "Camp Alborz is a registered 501(c)(3) non-profit organization. All donations are tax-deductible to the full extent allowed by law.",
      ein: "XX-XXXXXXX",
    },
    donationForm: {
      title: "Make a Difference Today",
      description: "Your support helps us continue sharing Persian culture, building incredible art, and creating transformative experiences for our community.",
      campaigns: [
        "Art & Installations",
        "Camp Infrastructure",
        "Community Events",
        "Transportation",
        "Burning Man 2024",
      ],
    },
    cta: {
      title: "Other Ways to Support",
      description: "Beyond donations, you can support our mission by joining our community and volunteering",
      buttons: {
        primary: { text: "Join Our Community", link: "/apply" },
        secondary: { text: "Volunteer at Events", link: "/events" },
      },
    },
  },

  // Culture Page
  culture: {
    title: "Persian Culture & Heritage",
    subtitle: "Discover the rich traditions, values, and artistic heritage of Persian culture through immersive experiences and community learning",
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
        icon: "sparkles",
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
      missionTitle: "Our Mission",
      mission: [
        "We believe in the power of cultural exchange to build understanding, break down barriers, and create meaningful connections between people from all backgrounds.",
        "Through our cultural programs, we share the beauty of Persian heritage while learning from and celebrating the diversity of the Burning Man community.",
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
      title: "Explore Persian Culture With Us",
      description: "Whether you have Persian heritage or are simply curious about the culture, you're welcome to join our learning community and cultural celebrations.",
      buttons: {
        primary: { text: "Attend Cultural Events", link: "/events" },
        secondary: { text: "Join Our Community", link: "/apply" },
      },
    },
  },

  // Members Page
  members: {
    title: "Member Portal",
    subtitle: "Join our global community of artists, builders, and dreamers creating magic in the desert and beyond",
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
    cta: {
      title: "Ready to Join Our Family?",
      description: "Become part of a community that celebrates creativity, culture, and connection",
      buttons: {
        primary: { text: "Apply Now", link: "/apply" },
        secondary: { text: "Learn More", link: "/about" },
      },
    },
  },

  // Apply Page
  apply: {
    title: "Join Camp Alborz",
    subtitle: "We're excited to learn about you and how you'd like to contribute to our community",
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
        title: "Before You Apply",
        items: [
          "Membership includes camp dues to cover shared expenses",
          "All members are expected to participate in camp setup and teardown",
          "We operate on the principles of radical inclusion and respect",
          "Camp participation requires commitment to our community values",
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
          title: "Application Review",
          description: "Our camp leads will review your application",
        },
        {
          stepNumber: 2,
          title: "Meet & Greet",
          description: "We'll invite you to a virtual or in-person meetup",
        },
        {
          stepNumber: 3,
          title: "Welcome to the Family",
          description: "Join our planning activities and camp community",
        },
      ],
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
          title: "Burning Man 2024 Camp Setup",
          type: "Event",
          excerpt: "Join us for the annual camp setup at Black Rock City. We'll be arriving early to establish our Persian oasis in the desert.",
          date: "August 2024",
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
        "burning man 2024",
        "persian poetry",
        "art installations",
        "cultural events",
        "tea ceremony",
        "membership application",
      ],
    },
  },
};
