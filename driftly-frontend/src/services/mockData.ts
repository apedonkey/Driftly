// Mock data for frontend preview

// Mock users
export const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: '2023-01-02T00:00:00.000Z',
  },
];

// Mock flows
export const flows = [
  {
    id: '1',
    name: 'Customer Onboarding',
    description: 'Welcome new customers and guide them through setup',
    status: 'active',
    createdAt: '2023-01-10T00:00:00.000Z',
    contactCount: 125,
    messagesSent: 450,
    openRate: 68,
    clickRate: 34,
  },
  {
    id: '2',
    name: 'Re-engagement Campaign',
    description: 'Reconnect with customers who haven\'t been active',
    status: 'inactive',
    createdAt: '2023-01-15T00:00:00.000Z',
    contactCount: 348,
    messagesSent: 870,
    openRate: 42,
    clickRate: 18,
  },
  {
    id: '3',
    name: 'Product Feedback',
    description: 'Collect feedback on new product features',
    status: 'active',
    createdAt: '2023-01-20T00:00:00.000Z',
    contactCount: 215,
    messagesSent: 645,
    openRate: 75,
    clickRate: 38,
  },
];

// Mock contacts
export const contacts = {
  '1': [
    {
      id: '101',
      email: 'customer1@example.com',
      name: 'Customer One',
      phone: '+1234567890',
      tags: ['new', 'premium'],
      lastActive: '2023-02-01T10:30:00.000Z',
      stage: 'Welcome Email',
    },
    {
      id: '102',
      email: 'customer2@example.com',
      name: 'Customer Two',
      phone: '+1987654321',
      tags: ['new'],
      lastActive: '2023-02-02T11:20:00.000Z',
      stage: 'Product Tour',
    },
  ],
  '2': [
    {
      id: '201',
      email: 'inactive1@example.com',
      name: 'Inactive User One',
      phone: '+1122334455',
      tags: ['inactive', 'trial'],
      lastActive: '2022-11-15T08:45:00.000Z',
      stage: 'Initial Outreach',
    },
  ],
  '3': [
    {
      id: '301',
      email: 'feedback1@example.com',
      name: 'Feedback User One',
      phone: '+1555666777',
      tags: ['active', 'beta-tester'],
      lastActive: '2023-02-10T14:50:00.000Z',
      stage: 'Feature Survey',
    },
    {
      id: '302',
      email: 'feedback2@example.com',
      name: 'Feedback User Two',
      phone: '+1888999000',
      tags: ['active'],
      lastActive: '2023-02-09T16:20:00.000Z',
      stage: 'Feature Survey',
    },
  ],
};

// Mock templates
export const templates = [
  {
    id: '1',
    name: 'Welcome Series',
    description: 'A 3-part welcome series for new subscribers',
    category: 'welcome',
    createdAt: '2023-01-05T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'Welcome to Driftly!',
        body: 'Hi {{name}},\n\nWelcome to Driftly! We\'re excited to have you on board.\n\nBest,\nThe Driftly Team',
        delayDays: 0,
        delayHours: 0
      },
      {
        order: 1,
        subject: 'Getting Started Guide',
        body: 'Hi {{name}},\n\nHere are some tips to get started with Driftly.\n\nBest,\nThe Driftly Team',
        delayDays: 2,
        delayHours: 0
      },
      {
        order: 2,
        subject: 'How\'s it going?',
        body: 'Hi {{name}},\n\nJust checking in to see how you\'re enjoying Driftly so far.\n\nBest,\nThe Driftly Team',
        delayDays: 5,
        delayHours: 0
      }
    ]
  },
  {
    id: '2',
    name: 'Re-engagement Campaign',
    description: 'A 3-part sequence to re-engage inactive users',
    category: 're-engagement',
    createdAt: '2023-01-06T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'We miss you!',
        body: 'Hi {{name}},\n\nIt\'s been a while since we\'ve seen you. Come back and check out what\'s new!\n\nBest,\nThe Driftly Team',
        delayDays: 0,
        delayHours: 0
      },
      {
        order: 1,
        subject: 'Special offer inside',
        body: 'Hi {{name}},\n\nWe\'d like to offer you a special discount to come back.\n\nBest,\nThe Driftly Team',
        delayDays: 3,
        delayHours: 0
      },
      {
        order: 2,
        subject: 'Last chance!',
        body: 'Hi {{name}},\n\nYour special offer expires soon. Don\'t miss out!\n\nBest,\nThe Driftly Team',
        delayDays: 5,
        delayHours: 0
      }
    ]
  },
  {
    id: '3',
    name: 'Feedback Request',
    description: 'A short sequence to gather customer feedback',
    category: 'feedback',
    createdAt: '2023-01-07T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'Your feedback matters',
        body: 'Hi {{name}},\n\nWe value your opinion. Please take a moment to complete our survey.\n\nBest,\nThe Driftly Team',
        delayDays: 0,
        delayHours: 0
      },
      {
        order: 1,
        subject: 'Reminder: We need your feedback',
        body: 'Hi {{name}},\n\nJust a friendly reminder to share your feedback with us.\n\nBest,\nThe Driftly Team',
        delayDays: 3,
        delayHours: 0
      }
    ]
  },
  {
    id: '4',
    name: 'SaaS Product Onboarding',
    description: 'Help new users get started with your software product',
    category: 'onboarding',
    createdAt: '2023-02-01T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'Welcome to Our Platform + Quick Start Guide',
        body: 'Hi {{name}},\n\nWelcome to our platform! We\'re thrilled to have you on board.\n\nHere\'s a quick guide to get you started:\n\n1. Set up your profile\n2. Import your data\n3. Configure your dashboard\n\nIf you need any help, reply to this email or check out our knowledge base.\n\nBest regards,\nThe Product Team',
        delayDays: 0,
        delayHours: 0
      },
      {
        order: 1,
        subject: 'Discover Our Key Feature: Analytics Dashboard',
        body: 'Hi {{name}},\n\nNow that you\'ve had some time to explore our platform, we wanted to highlight one of our most powerful features: The Analytics Dashboard.\n\nWith our analytics, you can:\n\n• Track performance in real-time\n• Generate custom reports\n• Set up automated alerts\n\nCheck it out by clicking the "Analytics" tab in your account.\n\nNeed help? Our support team is just an email away.\n\nBest regards,\nThe Product Team',
        delayDays: 2,
        delayHours: 0
      },
      {
        order: 2,
        subject: 'Unlock Advanced Capabilities: Automation Tools',
        body: 'Hi {{name}},\n\nReady to take your experience to the next level? Let\'s explore our powerful automation tools.\n\nWith automation, you can:\n\n• Schedule recurring tasks\n• Create workflows between tools\n• Set up triggers and conditions\n\nSave hours each week by setting up your first automation today!\n\nBest regards,\nThe Product Team',
        delayDays: 4,
        delayHours: 0
      },
      {
        order: 3,
        subject: 'Pro Tips & Tricks You Might Have Missed',
        body: 'Hi {{name}},\n\nNow that you\'re familiar with our platform, here are some advanced tips and tricks that even our power users sometimes miss:\n\n1. Keyboard shortcuts: Press "?" to see all available shortcuts\n2. Bulk operations: Select multiple items to edit them at once\n3. Advanced filters: Use our search syntax for complex queries\n\nTry these out to dramatically improve your workflow efficiency!\n\nBest regards,\nThe Product Team',
        delayDays: 7,
        delayHours: 0
      },
      {
        order: 4,
        subject: 'We\'d Love Your Feedback',
        body: 'Hi {{name}},\n\nYou\'ve been using our platform for a little while now, and we\'d love to hear your thoughts!\n\nWhat\'s working well? What could be improved? Any features you wish we had?\n\nSimply reply to this email with your feedback, or click here to fill out a short survey: [Survey Link]\n\nYour input directly shapes our product roadmap.\n\nThank you for your time!\n\nBest regards,\nThe Product Team',
        delayDays: 10,
        delayHours: 0
      }
    ]
  },
  {
    id: '5',
    name: 'E-commerce Welcome Series',
    description: 'Welcome new customers and encourage first purchase',
    category: 'e-commerce',
    createdAt: '2023-02-05T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'Welcome to Our Shop - Your Journey With Us Begins',
        body: 'Hi {{name}},\n\nThank you for joining our community of passionate shoppers! We\'re thrilled to welcome you to our family.\n\nOur story began five years ago when we set out to create products that combine quality, sustainability, and style. Today, we\'re proud to offer a curated collection that our customers love.\n\nOver the next few days, we\'ll be sharing more about our collections, values, and exclusive offers just for you.\n\nIn the meantime, feel free to explore our shop and discover what makes us unique.\n\nWarmly,\nThe Shop Team',
        delayDays: 0,
        delayHours: 0
      },
      {
        order: 1,
        subject: 'Discover Our Collections',
        body: 'Hi {{name}},\n\nWe wanted to give you a quick tour of our product categories to help you find exactly what you\'re looking for:\n\n• [Category 1]: Perfect for [benefit]\n• [Category 2]: Designed for [occasion/use case]\n• [Category 3]: Our customers\' favorites\n• [Category 4]: Limited edition items\n\nEach product is carefully crafted with attention to detail and quality materials.\n\nHave any questions about our collections? Simply reply to this email!\n\nHappy shopping,\nThe Shop Team',
        delayDays: 2,
        delayHours: 0
      },
      {
        order: 2,
        subject: 'A Special Gift: 10% Off Your First Order',
        body: 'Hi {{name}},\n\nWe\'re excited to see you explore our shop, and we\'d like to make your first purchase extra special.\n\nHere\'s 10% off your first order: WELCOME10\n\nSimply enter this code at checkout. Valid for the next 7 days!\n\nBrowse our new arrivals: [Link]\n\nWe can\'t wait to hear what you think of your first purchase.\n\nBest wishes,\nThe Shop Team',
        delayDays: 3,
        delayHours: 0
      },
      {
        order: 3,
        subject: 'What Our Customers Are Saying',
        body: 'Hi {{name}},\n\nWe believe our products speak for themselves, but don\'t just take our word for it! Here\'s what our customers have to say:\n\n"The quality exceeded my expectations. This has become my go-to!" - Sarah M.\n\n"Excellent customer service and fast shipping. Will definitely order again." - James T.\n\n"I\'ve tried many brands, but this one stands out for its attention to detail." - Maria L.\n\nWe\'re committed to creating experiences worth talking about.\n\nStill considering your first purchase? Feel free to check out more reviews on our website.\n\nBest regards,\nThe Shop Team',
        delayDays: 5,
        delayHours: 0
      },
      {
        order: 4,
        subject: 'Tell Us About Your Experience',
        body: 'Hi {{name}},\n\nWe hope you\'ve had a chance to explore our shop and hopefully make your first purchase!\n\nWe\'re constantly improving and would love to hear about your experience with us so far.\n\nWhat do you think of our:\n• Website navigation\n• Product selection\n• Overall shopping experience\n\nSimply reply to this email with your thoughts, or click here to leave a review if you\'ve made a purchase.\n\nYour feedback helps us serve you better!\n\nThank you,\nThe Shop Team',
        delayDays: 7,
        delayHours: 0
      }
    ]
  },
  {
    id: '6',
    name: 'B2B Sales Sequence',
    description: 'Professional outreach sequence for B2B sales',
    category: 'sales',
    createdAt: '2023-02-10T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'Helping [Company Name] improve [specific outcome]',
        body: 'Hello {{name}},\n\nI hope this email finds you well. I\'ve been following [Company Name]\'s recent developments in [relevant area] and wanted to reach out.\n\nWe help [target industry] companies like yours improve [specific metric] by [value proposition]. Our clients typically see [specific result] within [timeframe].\n\nWould you be interested in learning how we might be able to achieve similar results for [Company Name]?\n\nBest regards,\n[Your Name]\n[Your Company]',
        delayDays: 0,
        delayHours: 0
      },
      {
        order: 1,
        subject: 'How we helped [Similar Company] achieve [specific result]',
        body: 'Hello {{name}},\n\nI wanted to follow up on my previous email with a concrete example of how we\'ve helped a company similar to yours.\n\n[Similar Company] in the [industry] space was struggling with [pain point]. After implementing our solution:\n\n• They reduced [negative metric] by X%\n• They increased [positive metric] by Y%\n• They achieved ROI within [timeframe]\n\nYou can read the full case study here: [Link]\n\nWould you be interested in discussing how we might achieve similar results for [Company Name]?\n\nBest regards,\n[Your Name]\n[Your Company]',
        delayDays: 3,
        delayHours: 0
      },
      {
        order: 2,
        subject: '[Industry] trends and how they affect your business',
        body: 'Hello {{name}},\n\nI came across this recent report on [industry] trends and thought you might find it valuable, especially the insights about [specific trend relevant to prospect].\n\nOne key finding that stood out: companies that invest in [solution area] are seeing [specific benefit] compared to their competitors.\n\nGiven [Company Name]\'s position in the market, I believe you could gain significant advantages by addressing [specific challenge].\n\nOur platform specializes in helping companies navigate this exact challenge. Would you be open to a brief conversation about how this might apply to your specific situation?\n\nBest regards,\n[Your Name]\n[Your Company]',
        delayDays: 5,
        delayHours: 0
      },
      {
        order: 3,
        subject: 'Addressing common questions about [solution]',
        body: 'Hello {{name}},\n\nIn my conversations with [target role] professionals like yourself, several questions consistently come up about implementing [solution type]:\n\n1. How long does implementation typically take?\n2. What kind of ROI can we expect, and how soon?\n3. How disruptive is the transition process?\n\nI\'ve prepared a brief document addressing these questions based on our experience working with companies similar to [Company Name].\n\nWould you find this useful? I\'d be happy to share it and discuss your specific concerns.\n\nBest regards,\n[Your Name]\n[Your Company]',
        delayDays: 7,
        delayHours: 0
      },
      {
        order: 4,
        subject: 'Request to connect',
        body: 'Hello {{name}},\n\nOver the past couple of weeks, I\'ve shared some information about how we help companies like [Company Name] achieve [specific outcomes].\n\nI understand you\'re busy, so I wanted to make one last attempt to connect. Would you be open to a 15-minute call to discuss your current challenges with [relevant area] and explore whether our solution might be a good fit?\n\nIf yes, you can book a time that works for you here: [Calendar link]\n\nIf timing isn\'t right or this isn\'t relevant to your current priorities, please let me know, and I won\'t follow up further.\n\nThank you for your consideration.\n\nBest regards,\n[Your Name]\n[Your Company]',
        delayDays: 10,
        delayHours: 0
      }
    ]
  },
  {
    id: '7',
    name: 'Product Launch',
    description: 'Build excitement for a new product launch',
    category: 'marketing',
    createdAt: '2023-02-15T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'Something exciting is coming...',
        body: 'Hi {{name}},\n\nWe\'ve been working on something special behind the scenes, and we can\'t wait to share it with you!\n\nIn just a few days, we\'ll be unveiling a brand new [product/service] that will [key benefit].\n\nStay tuned for more details – this is something you won\'t want to miss.\n\nExcited to share more soon,\nThe [Company] Team',
        delayDays: 0,
        delayHours: 0
      },
      {
        order: 1,
        subject: 'The problem we set out to solve',
        body: 'Hi {{name}},\n\nBefore we reveal our new [product/service], we wanted to share the story behind it.\n\nWe noticed that many of our customers were struggling with [specific problem]. Existing solutions were [limitation of current options].\n\nWe asked ourselves: What if we could create something that [key innovation]?\n\nAfter months of development and testing, we\'ve created a solution that we believe will transform how you [relevant activity].\n\nExcited to reveal more in our next email!\n\nBest regards,\nThe [Company] Team',
        delayDays: 2,
        delayHours: 0
      },
      {
        order: 2,
        subject: 'Introducing [Product Name] + Early Bird Special',
        body: 'Hi {{name}},\n\nToday\'s the day! We\'re thrilled to introduce [Product Name].\n\n[Product Name] helps you [primary benefit] while also [secondary benefit]. Key features include:\n\n• [Feature 1] that [benefit]\n• [Feature 2] that [benefit]\n• [Feature 3] that [benefit]\n\nAs one of our valued customers, we\'re offering you exclusive early access at a special price:\n\nSave 20% with code EARLYBIRD\n\nThis offer is available for the next 48 hours only.\n\nBe among the first to experience [Product Name]: [Link]\n\nExcited to hear what you think!\n\nBest regards,\nThe [Company] Team',
        delayDays: 4,
        delayHours: 0
      },
      {
        order: 3,
        subject: '[Product Name] is officially here!',
        body: 'Hi {{name}},\n\nThe wait is over! [Product Name] is now officially available to everyone.\n\nSince our early access launch, we\'ve received incredible feedback like:\n\n"This has completely changed how I approach [relevant task]!" - [Customer Name]\n\n"I\'ve been waiting for a solution like this for years." - [Customer Name]\n\nReady to transform your [relevant area]?\n\nExplore [Product Name]: [Link]\n\nIf you have any questions, our team is standing by to help.\n\nBest regards,\nThe [Company] Team',
        delayDays: 6,
        delayHours: 0
      },
      {
        order: 4,
        subject: 'Last chance: [Product Name] launch offer ends today',
        body: 'Hi {{name}},\n\nJust a friendly reminder that our special launch pricing for [Product Name] ends today.\n\nThis is your last chance to get [Product Name] at [discount/special offer details].\n\nDon\'t miss out on the opportunity to [key benefit] and [secondary benefit].\n\nGet [Product Name] before the offer expires: [Link]\n\nThank you for your continued support!\n\nBest regards,\nThe [Company] Team',
        delayDays: 8,
        delayHours: 0
      }
    ]
  },
  {
    id: '8',
    name: 'Weekly Newsletter',
    description: 'Consistent weekly content delivery template',
    category: 'content',
    createdAt: '2023-02-20T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'Welcome to Our Weekly Newsletter',
        body: 'Hi {{name}},\n\nThank you for subscribing to our weekly newsletter! We\'re excited to have you join our community.\n\nEach week, you\'ll receive:\n\n• Curated industry news and insights\n• Practical tips and how-to guides\n• Exclusive content and offers\n\nOur newsletter goes out every Wednesday, so keep an eye on your inbox.\n\nIn the meantime, you might enjoy browsing some of our most popular content: [Link]\n\nIf you have any topics you\'d like us to cover, just reply to this email!\n\nBest regards,\nThe [Company] Team',
        delayDays: 0,
        delayHours: 0
      },
      {
        order: 1,
        subject: '[Company] Weekly: Top Stories for [Date]',
        body: 'Hi {{name}},\n\nHere\'s your roundup of essential news and insights for this week:\n\n📰 INDUSTRY NEWS\n• [News Headline 1]: [Brief summary] [Link]\n• [News Headline 2]: [Brief summary] [Link]\n\n📝 FROM OUR BLOG\n• [Blog Post Title]: [Brief summary] [Link]\n\n💡 QUICK TIP OF THE WEEK\n[Actionable tip related to your industry]\n\n🔍 WHAT WE\'RE READING\n• [Article/Book Title]: [Brief takeaway] [Link]\n\nUntil next week,\nThe [Company] Team\n\nP.S. Did someone forward this to you? Subscribe here: [Link]',
        delayDays: 7,
        delayHours: 0
      },
      {
        order: 2,
        subject: '[Company] Weekly: Insights for [Date]',
        body: 'Hi {{name}},\n\nHere\'s what you need to know this week:\n\n📊 MARKET TRENDS\n• [Trend 1]: [Brief explanation] [Link]\n• [Trend 2]: [Brief explanation] [Link]\n\n✏️ NEW CONTENT\n• [Content Title]: [Brief summary] [Link]\n\n🎓 LEARN SOMETHING NEW\n[Brief tutorial or explanation]\n\n🛠️ TOOL OF THE WEEK\n[Tool name]: [What it does and why it\'s useful] [Link]\n\nSee you next Wednesday!\nThe [Company] Team\n\nP.S. Have questions or feedback? Just hit reply!',
        delayDays: 14,
        delayHours: 0
      },
      {
        order: 3,
        subject: '[Company] Weekly: Your [Date] Briefing',
        body: 'Hi {{name}},\n\nYour weekly dose of insights and inspiration:\n\n🔍 SPOTLIGHT\n[Deep dive into a relevant topic]\n\n📝 FRESH FROM OUR BLOG\n• [Blog Post Title]: [Brief summary] [Link]\n• [Blog Post Title]: [Brief summary] [Link]\n\n🔗 WORTH SHARING\n• [Article Title]: [Brief takeaway] [Link]\n• [Article Title]: [Brief takeaway] [Link]\n\n⚡ PRODUCTIVITY HACK\n[Simple tip to improve efficiency or effectiveness]\n\nUntil next week,\nThe [Company] Team\n\nP.S. Forward this to a colleague who might find it valuable!',
        delayDays: 21,
        delayHours: 0
      },
      {
        order: 4,
        subject: 'A special offer for our newsletter subscribers',
        body: 'Hi {{name}},\n\nWe\'re grateful to have you as a loyal reader of our weekly newsletter. As a token of our appreciation, we\'ve prepared something special just for you.\n\nFor the next 72 hours, newsletter subscribers get exclusive access to:\n\n[Special offer details]\n\nThis is our way of saying thank you for being part of our community and engaging with our content week after week.\n\nAccess your exclusive offer here: [Link]\n\nThank you for your continued support!\n\nBest regards,\nThe [Company] Team',
        delayDays: 28,
        delayHours: 0
      }
    ]
  },
  {
    id: '9',
    name: 'Course Delivery',
    description: 'Deliver educational content over time',
    category: 'education',
    createdAt: '2023-02-25T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'Welcome to [Course Name]: Your Learning Journey Begins',
        body: 'Hi {{name}},\n\nWelcome to [Course Name]! I\'m thrilled that you\'ve decided to join us on this learning journey.\n\nOver the next few weeks, you\'ll receive a series of lessons designed to help you master [course topic]. Here\'s what you can expect:\n\n• Lesson 1: Fundamentals of [Topic] (arriving in 2 days)\n• Lesson 2: Intermediate Concepts (1 week later)\n• Lesson 3: Advanced Techniques (1 week after Lesson 2)\n• Final Steps and Certification (1 week after Lesson 3)\n\nTo get the most out of this course:\n- Set aside [time recommendation] for each lesson\n- Complete the practice exercises\n- Join our community forum: [Link]\n\nLet\'s get started! Below you\'ll find a brief overview of what we\'ll cover and why it matters.\n\n[Course Overview Paragraph]\n\nIf you have any questions, simply reply to this email.\n\nExcited to learn together,\n[Instructor Name]',
        delayDays: 0,
        delayHours: 0
      },
      {
        order: 1,
        subject: '[Course Name] - Lesson 1: Fundamentals',
        body: 'Hi {{name}},\n\nWelcome to your first lesson in the [Course Name] series! Today we\'re covering the essential fundamentals that will form the foundation of everything else we\'ll learn.\n\n📚 LESSON 1: FUNDAMENTALS OF [TOPIC]\n\n[Content Section 1]\n\n[Content Section 2]\n\n[Content Section 3]\n\n✅ PRACTICE EXERCISE\nNow it\'s your turn to apply what you\'ve learned:\n\n[Exercise Instructions]\n\n📌 KEY TAKEAWAYS\n• [Key Point 1]\n• [Key Point 2]\n• [Key Point 3]\n\n📚 ADDITIONAL RESOURCES\n• [Resource 1]: [Link]\n• [Resource 2]: [Link]\n\nYour next lesson on Intermediate Concepts will arrive in one week. In the meantime, focus on completing the practice exercise and exploring the additional resources.\n\nAny questions? Hit reply!\n\nHappy learning,\n[Instructor Name]',
        delayDays: 2,
        delayHours: 0
      },
      {
        order: 2,
        subject: '[Course Name] - Lesson 2: Intermediate Concepts',
        body: 'Hi {{name}},\n\nI hope you\'ve had a chance to practice the fundamentals from Lesson 1. Today, we\'re taking things up a notch with intermediate concepts.\n\n📚 LESSON 2: INTERMEDIATE CONCEPTS\n\n[Content Section 1]\n\n[Content Section 2]\n\n[Content Section 3]\n\n✅ PRACTICE EXERCISE\nLet\'s apply these more advanced concepts:\n\n[Exercise Instructions]\n\n📌 KEY TAKEAWAYS\n• [Key Point 1]\n• [Key Point 2]\n• [Key Point 3]\n\n🤔 COMMON QUESTIONS\n[Q&A format addressing typical questions at this stage]\n\n📚 ADDITIONAL RESOURCES\n• [Resource 1]: [Link]\n• [Resource 2]: [Link]\n\nYour final lesson on Advanced Techniques will arrive in one week. Keep practicing and don\'t hesitate to ask questions in our community forum.\n\nProud of your progress so far!\n[Instructor Name]',
        delayDays: 9,
        delayHours: 0
      },
      {
        order: 3,
        subject: '[Course Name] - Lesson 3: Advanced Techniques',
        body: 'Hi {{name}},\n\nYou\'ve made it to the advanced lesson! By now, you have a solid understanding of the fundamentals and intermediate concepts. It\'s time to master the advanced techniques that will set you apart.\n\n📚 LESSON 3: ADVANCED TECHNIQUES\n\n[Content Section 1]\n\n[Content Section 2]\n\n[Content Section 3]\n\n✅ PRACTICE EXERCISE\nThis advanced exercise will help solidify your skills:\n\n[Exercise Instructions]\n\n📌 KEY TAKEAWAYS\n• [Key Point 1]\n• [Key Point 2]\n• [Key Point 3]\n\n🔍 CASE STUDY\n[Brief case study showing advanced concepts in action]\n\n📚 ADDITIONAL RESOURCES\n• [Resource 1]: [Link]\n• [Resource 2]: [Link]\n\nYour final email with certification details will arrive next week. Until then, focus on mastering these advanced techniques.\n\nYou\'re doing amazing work!\n[Instructor Name]',
        delayDays: 16,
        delayHours: 0
      },
      {
        order: 4,
        subject: '[Course Name] Complete: Your Certificate & Next Steps',
        body: 'Hi {{name}},\n\nCongratulations! You\'ve completed all the lessons in [Course Name]. This is a significant achievement that demonstrates your dedication to mastering [course topic].\n\n🏆 YOUR CERTIFICATE\nYour course completion certificate is ready! Download it here: [Certificate Link]\n\n📋 COURSE SUMMARY\nHere\'s a recap of what you\'ve learned:\n• Lesson 1: Fundamentals of [Topic]\n• Lesson 2: Intermediate Concepts\n• Lesson 3: Advanced Techniques\n\n🚀 NEXT STEPS\nTo continue your learning journey:\n\n1. Join our advanced workshop: [Link]\n2. Explore our other courses: [Link]\n3. Connect with fellow students in our community: [Link]\n\n📝 SHARE YOUR FEEDBACK\nI\'d love to hear about your experience with this course: [Feedback Link]\n\nThank you for learning with us. Remember, this isn\'t the end of your journey—it\'s just the beginning!\n\nBest wishes for your continued success,\n[Instructor Name]\n\nP.S. Have questions about applying what you\'ve learned? I\'m always here to help!',
        delayDays: 23,
        delayHours: 0
      }
    ]
  },
  {
    id: '10',
    name: 'Abandoned Cart Recovery',
    description: 'Recover potential sales from abandoned shopping carts',
    category: 'e-commerce',
    createdAt: '2023-03-01T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'Your cart is waiting for you',
        body: 'Hi {{name}},\n\nWe noticed you left some items in your shopping cart. No worries—we\'ve saved them for you!\n\nYour cart includes:\n• [Product 1]\n• [Product 2]\n\nReady to complete your purchase? Your cart is just a click away: [Cart Link]\n\nIf you have any questions about these products or need assistance with your order, our team is here to help. Simply reply to this email!\n\nBest regards,\nThe [Company] Team',
        delayDays: 0,
        delayHours: 3
      },
      {
        order: 1,
        subject: 'Why customers love [Product Name]',
        body: 'Hi {{name}},\n\nStill thinking about the items in your cart? We wanted to share why our customers love [Product Name]:\n\n✅ [Key Benefit 1]\n✅ [Key Benefit 2]\n✅ [Key Benefit 3]\n\n"[Customer testimonial about the product]" - [Customer Name]\n\nWe\'re confident you\'ll love it too! Your saved items are still waiting for you: [Cart Link]\n\nStill have questions? We\'re here to help!\n\nBest regards,\nThe [Company] Team',
        delayDays: 1,
        delayHours: 0
      },
      {
        order: 2,
        subject: 'A special discount to complete your purchase',
        body: 'Hi {{name}},\n\nWe know decisions can be tough, so we wanted to make yours a little easier.\n\nWe\'re offering you a 10% discount on your cart items. Just use code COMEBACK10 at checkout.\n\nThis offer is valid for 48 hours only!\n\nComplete your purchase: [Cart Link]\n\nWe\'re looking forward to delivering a great experience.\n\nBest regards,\nThe [Company] Team',
        delayDays: 2,
        delayHours: 0
      },
      {
        order: 3,
        subject: 'Final reminder: Your cart is about to expire',
        body: 'Hi {{name}},\n\nJust a friendly reminder that the items in your cart (and your special discount) will expire soon.\n\nYour cart includes:\n• [Product 1]\n• [Product 2]\n\nUse code COMEBACK10 for 10% off your order. This offer expires today!\n\nComplete your purchase: [Cart Link]\n\nIf you\'re no longer interested or have any concerns, we\'d love to hear your feedback to improve our service.\n\nBest regards,\nThe [Company] Team',
        delayDays: 3,
        delayHours: 0
      }
    ]
  },
  {
    id: '11',
    name: 'Win-Back Campaign',
    description: 'Re-engage inactive subscribers or customers',
    category: 're-engagement',
    createdAt: '2023-03-05T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'We miss you, {{name}}',
        body: 'Hi {{name}},\n\nIt\'s been a while since we\'ve seen you, and we wanted to let you know that we miss you!\n\nA lot has happened since you last engaged with us:\n\n• [New feature/product 1]\n• [New feature/product 2]\n• [Improvement to service]\n\nWe\'d love to welcome you back and hear how you\'ve been.\n\nVisit your account here: [Link]\n\nIs there anything specific that caused you to step away? We\'d genuinely appreciate your feedback so we can serve you better.\n\nHope to see you again soon,\nThe [Company] Team',
        delayDays: 0,
        delayHours: 0
      },
      {
        order: 1,
        subject: 'See what\'s new since you\'ve been gone',
        body: 'Hi {{name}},\n\nWe\'ve been busy making improvements based on customer feedback since you last visited us.\n\nHere\'s what\'s new that you might find interesting:\n\n🆕 [Major update or feature]: [Brief description of benefit]\n\n🔄 [Improvement to existing feature]: [Brief description of enhancement]\n\n💯 [New content/products]: [Brief description]\n\nMany customers who returned have told us they especially love [specific feature/improvement]. We think you will too!\n\nCheck out these changes: [Link]\n\nWe\'d love to hear what you think!\n\nBest regards,\nThe [Company] Team',
        delayDays: 3,
        delayHours: 0
      },
      {
        order: 2,
        subject: 'A special offer just for you',
        body: 'Hi {{name}},\n\nWe really want to welcome you back, so we\'ve prepared something special just for you.\n\n[Description of special offer - discount, free upgrade, bonus feature, etc.]\n\nThis exclusive offer is valid for the next 7 days.\n\nRedeem your offer here: [Link]\n\nWe hope this gives you a great reason to give us another try. We\'ve made many improvements based on customer feedback and would love for you to experience them.\n\nLooking forward to welcoming you back!\n\nBest regards,\nThe [Company] Team',
        delayDays: 7,
        delayHours: 0
      },
      {
        order: 3,
        subject: 'Help us understand your preferences',
        body: 'Hi {{name}},\n\nWe want to make sure we\'re sending you content that matters to you.\n\nCould you take a moment to update your preferences? This will help us ensure that you only receive information about topics you care about, at a frequency that works for you.\n\nUpdate your preferences here: [Link]\n\nYou can choose:\n• Which topics interest you most\n• How often you\'d like to hear from us\n• Your preferred communication channels\n\nThank you for helping us serve you better!\n\nBest regards,\nThe [Company] Team',
        delayDays: 10,
        delayHours: 0
      },
      {
        order: 4,
        subject: 'Before we say goodbye...',
        body: 'Hi {{name}},\n\nWe\'ve noticed you haven\'t engaged with our emails for some time, and we want to respect your inbox.\n\nWe\'ll be updating our active subscriber list soon, and we wanted to check if you\'d like to:\n\n1️⃣ Stay subscribed: Click here to confirm [Link]\n\n2️⃣ Update your preferences: Adjust what you receive [Link]\n\n3️⃣ Unsubscribe: If our content isn\'t valuable to you, no action is needed and we\'ll stop sending emails after this one\n\nIf we don\'t hear from you within the next 7 days, we\'ll assume our content isn\'t relevant to you right now, and we\'ll stop sending messages.\n\nYou can always resubscribe in the future if circumstances change.\n\nThank you for your time with us!\n\nBest regards,\nThe [Company] Team',
        delayDays: 14,
        delayHours: 0
      }
    ]
  },
  {
    id: '12',
    name: 'Event Promotion Sequence',
    description: 'Promote an upcoming event to drive registrations',
    category: 'events',
    createdAt: '2023-03-10T00:00:00.000Z',
    steps: [
      {
        order: 0,
        subject: 'Save the Date: [Event Name] on [Date]',
        body: 'Hi {{name}},\n\nWe\'re excited to announce [Event Name], taking place on [Date] at [Time] [Timezone] at [Location/Virtual Platform].\n\n[Event Name] is [brief description of what the event is and its purpose].\n\nWhy attend?\n• [Key benefit 1]\n• [Key benefit 2]\n• [Key benefit 3]\n\nMark your calendar now, and keep an eye on your inbox for registration details coming soon.\n\nFeel free to forward this to colleagues who might be interested!\n\nBest regards,\nThe [Company] Team',
        delayDays: 0,
        delayHours: 0
      },
      {
        order: 1,
        subject: 'Early Bird Registration Now Open for [Event Name]',
        body: 'Hi {{name}},\n\nGreat news! Registration is now open for [Event Name] on [Date].\n\nFor a limited time, we\'re offering special early bird pricing:\n\n[Early Bird Price] (Regular price: [Regular Price])\n\nEarly bird registration ends on [End Date], so secure your spot today!\n\nWhat to expect at [Event Name]:\n• [Agenda highlight 1]\n• [Agenda highlight 2]\n• [Agenda highlight 3]\n\nSpaces are limited and filling up quickly.\n\nRegister now: [Registration Link]\n\nWe look forward to seeing you there!\n\nBest regards,\nThe [Company] Team',
        delayDays: 3,
        delayHours: 0
      },
      {
        order: 2,
        subject: 'Meet the Speakers at [Event Name]',
        body: 'Hi {{name}},\n\nWe\'re thrilled to introduce our exceptional lineup of speakers for [Event Name]:\n\n[Speaker 1 Name] - [Title, Company]\n[Brief bio and topic they will present]\n\n[Speaker 2 Name] - [Title, Company]\n[Brief bio and topic they will present]\n\n[Speaker 3 Name] - [Title, Company]\n[Brief bio and topic they will present]\n\nThese industry leaders will share valuable insights on [main topics], helping you [key benefit].\n\nDon\'t miss this opportunity to learn from the best in the industry!\n\nRegister here: [Registration Link]\n\nReminder: Early bird pricing ends on [End Date].\n\nBest regards,\nThe [Company] Team',
        delayDays: 7,
        delayHours: 0
      },
      {
        order: 3,
        subject: 'Last Chance for [Event Name] Registration',
        body: 'Hi {{name}},\n\nThis is your final reminder that registration for [Event Name] closes soon!\n\nThe event is now [X]% full, and we expect the remaining spots to fill quickly.\n\nKey event details:\n• Date: [Date]\n• Time: [Time] [Timezone]\n• Location: [Location/Virtual Platform]\n• Price: [Current Price]\n\nWhat you\'ll gain:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\nDon\'t miss out on this valuable opportunity to [key benefit of attending].\n\nSecure your spot now: [Registration Link]\n\nWe hope to see you there!\n\nBest regards,\nThe [Company] Team',
        delayDays: 10,
        delayHours: 0
      },
      {
        order: 4,
        subject: 'Your [Event Name] Starts Tomorrow - Important Details',
        body: 'Hi {{name}},\n\nWe\'re excited that you\'ll be joining us for [Event Name] on [Date].\n\nHere are the important details you need to know:\n\n• Date: [Date]\n• Time: [Time] [Timezone]\n• Location: [Location/Virtual Platform]\n• Agenda: [Agenda]\n\nWe look forward to seeing you there!\n\nBest regards,\nThe [Company] Team',
        delayDays: 1,
        delayHours: 0
      }
    ]
  }
];

// Mock analytics data
export const analyticsData = {
  '1': {
    daily: [
      { date: '2023-02-01', sent: 15, opened: 12, clicked: 8 },
      { date: '2023-02-02', sent: 18, opened: 14, clicked: 9 },
      { date: '2023-02-03', sent: 12, opened: 10, clicked: 7 },
      { date: '2023-02-04', sent: 20, opened: 16, clicked: 11 },
      { date: '2023-02-05', sent: 17, opened: 13, clicked: 8 },
      { date: '2023-02-06', sent: 16, opened: 12, clicked: 7 },
      { date: '2023-02-07', sent: 19, opened: 15, clicked: 10 },
    ],
    weekly: [
      { date: '2023-W05', sent: 110, opened: 85, clicked: 52 },
      { date: '2023-W06', sent: 125, opened: 90, clicked: 58 },
      { date: '2023-W07', sent: 118, opened: 82, clicked: 49 },
      { date: '2023-W08', sent: 130, opened: 95, clicked: 60 },
    ],
    monthly: [
      { date: '2023-01', sent: 425, opened: 320, clicked: 190 },
      { date: '2023-02', sent: 450, opened: 330, clicked: 210 },
    ],
  },
  '2': {
    daily: [
      { date: '2023-02-01', sent: 25, opened: 10, clicked: 3 },
      { date: '2023-02-02', sent: 30, opened: 12, clicked: 4 },
      { date: '2023-02-03', sent: 28, opened: 11, clicked: 3 },
      { date: '2023-02-04', sent: 35, opened: 14, clicked: 4 },
      { date: '2023-02-05', sent: 32, opened: 13, clicked: 4 },
      { date: '2023-02-06', sent: 30, opened: 12, clicked: 3 },
      { date: '2023-02-07', sent: 33, opened: 13, clicked: 4 },
    ],
    weekly: [
      { date: '2023-W05', sent: 210, opened: 84, clicked: 25 },
      { date: '2023-W06', sent: 220, opened: 88, clicked: 26 },
      { date: '2023-W07', sent: 215, opened: 86, clicked: 26 },
      { date: '2023-W08', sent: 225, opened: 90, clicked: 27 },
    ],
    monthly: [
      { date: '2023-01', sent: 850, opened: 340, clicked: 102 },
      { date: '2023-02', sent: 870, opened: 348, clicked: 104 },
    ],
  },
  '3': {
    daily: [
      { date: '2023-02-01', sent: 20, opened: 15, clicked: 8 },
      { date: '2023-02-02', sent: 22, opened: 17, clicked: 9 },
      { date: '2023-02-03', sent: 18, opened: 14, clicked: 7 },
      { date: '2023-02-04', sent: 25, opened: 19, clicked: 10 },
      { date: '2023-02-05', sent: 23, opened: 17, clicked: 9 },
      { date: '2023-02-06', sent: 21, opened: 16, clicked: 8 },
      { date: '2023-02-07', sent: 24, opened: 18, clicked: 9 },
    ],
    weekly: [
      { date: '2023-W05', sent: 150, opened: 113, clicked: 60 },
      { date: '2023-W06', sent: 160, opened: 120, clicked: 64 },
      { date: '2023-W07', sent: 155, opened: 116, clicked: 62 },
      { date: '2023-W08', sent: 165, opened: 124, clicked: 66 },
    ],
    monthly: [
      { date: '2023-01', sent: 600, opened: 450, clicked: 240 },
      { date: '2023-02', sent: 645, opened: 484, clicked: 258 },
    ],
  },
};

// Mock settings
export const settings = {
  companyName: 'Demo Company',
  emailSettings: {
    fromEmail: 'no-reply@demoompany.com',
    fromName: 'Demo Company',
    replyTo: 'support@democompany.com',
  },
  apiKey: 'mock-api-key-12345',
  webhook: {
    url: 'https://webhook.democompany.com/driftly',
    events: ['message_sent', 'message_opened', 'message_clicked'],
    active: true,
  },
}; 