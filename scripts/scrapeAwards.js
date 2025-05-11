const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { spawn } = require('child_process')
const { marked } = require('marked')
const OpenAI = require('openai')

// Determine if OpenAI API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// URLs to scrape for different years - expanded to include more historical data
const urls = [
  { year: 2024, url: 'https://webawards.com.au/winners/' },
  { year: 2023, url: 'https://webawards.com.au/winners/2023/' },
  { year: 2022, url: 'https://webawards.com.au/winners/2022/' },
  { year: 2021, url: 'https://webawards.com.au/winners/2021/' },
  { year: 2020, url: 'https://webawards.com.au/winners/2020/' },
  { year: 2019, url: 'https://webawards.com.au/winners/2019/' },
  { year: 2018, url: 'https://webawards.com.au/winners/2018/' },
  { year: 2017, url: 'https://webawards.com.au/winners/2017/' },
  { year: 2016, url: 'https://webawards.com.au/winners/2016/' },
  { year: 2015, url: 'https://webawards.com.au/winners/2015/' },
  { year: 2014, url: 'https://webawards.com.au/winners/2014/' },
  { year: 2013, url: 'https://webawards.com.au/winners/2013/' },
  { year: 2012, url: 'https://webawards.com.au/winners/2012/' },
  { year: 2011, url: 'https://webawards.com.au/winners/2011/' },
  { year: 2010, url: 'https://webawards.com.au/winners/2010/' },
  { year: 2009, url: 'https://webawards.com.au/winners/2009/' },
  // Archive.org URLs for older years that might be missing
  { year: 2018, url: 'https://web.archive.org/web/20181201000000*/https://webawards.com.au/winners/2018/' },
  { year: 2014, url: 'https://web.archive.org/web/20141201000000*/https://webawards.com.au/winners/2014/' },
  { year: 2013, url: 'https://web.archive.org/web/20131201000000*/https://webawards.com.au/winners/2013/' },
  { year: 2012, url: 'https://web.archive.org/web/20121201000000*/https://webawards.com.au/winners/2012/' },
  { year: 2011, url: 'https://web.archive.org/web/20111201000000*/https://webawards.com.au/winners/2011/' },
  { year: 2010, url: 'https://web.archive.org/web/20101201000000*/https://webawards.com.au/winners/2010/' },
  { year: 2009, url: 'https://web.archive.org/web/20091201000000*/https://webawards.com.au/winners/2009/' },
  // Additional specific archive.org captures
  { year: 2018, url: 'https://web.archive.org/web/20181015152124/https://webawards.com.au/winners/' },
  { year: 2014, url: 'https://web.archive.org/web/20141015152124/https://webawards.com.au/winners/' },
  // Try to get categories pages specifically
  { year: 0, url: 'https://webawards.com.au/categories/' },
  { year: 0, url: 'https://webawards.com.au/awards/' },
  { year: 0, url: 'https://webawards.com.au/about/' },
  { year: 0, url: 'https://webawards.com.au/hall-of-fame/' },
  // Add judges and criteria pages
  { year: 0, url: 'https://webawards.com.au/judges/' },
  { year: 0, url: 'https://webawards.com.au/criteria/' },
]

// Known categories from research (comprehensive list)
const knownCategories = [
  'Site of the Year',
  'McFarlane Prize',
  'Agency',
  'Agency of the Year',
  'Community & Culture',
  'Construction & Manufacturing',
  'Education',
  'Enterprise Business',
  'Entertainment & Events',
  'Financial Services',
  'Government',
  'Health & Wellness',
  'Hospitality',
  'Innovation',
  'Not for Profit',
  'Professional Services',
  'Retail & eCommerce',
  'E-Commerce',
  'Science & Sustainability',
  'Sport & Recreation',
  'Start-up',
  'Startup',
  'Travel & Tourism',
  'Technology',
  'Technology (IT / Software)',
  'Mobile App',
  'Web App',
  'Drupal',
  'Headless',
  'Shopify',
  'WordPress',
  'Small Business',
  'Medium Business',
  'Large Business',
  'SEO Effectiveness',
  'Accessibility Award',
  'Content Award',
  'Design Award',
  'Development Award',
  'User Experience Award',
  'Social Media',
  'Digital Marketing',
  'Personal',
  'Commercial',
  'Winner',
  'Finalists',
  'Shoestring Website',
  'Medium-to-Large Business',
]

// Create the AwardWinner interface structure with expanded fields
const createAwardWinnersInterface = `export interface AwardWinner {
  year: number;
  company: string;
  agency: string;
  category: string;
  project: string;
  rank: number;
  url?: string;
  description?: string;
  imageUrl?: string;

  // Enhanced fields
  technologies?: string[];
  team_members?: string[];
  social_media?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  judge_comments?: string;
  award_criteria?: string[];
  innovative_features?: string[];
  seo_score?: number;
  accessibility_score?: number;
  performance_metrics?: {
    lcp?: number;
    fid?: number;
    cls?: number;
    lighthouse_score?: number;
  };
  case_study_url?: string;
  client_testimonial?: string;
  technical_details?: string;
  design_highlights?: string;
  content_quality?: string;
  user_experience_notes?: string;
  ai_analysis?: string;
}

// Data scraped from the Australian Web Awards website (https://webawards.com.au/)
export const awardWinners: AwardWinner[] = `

// Historical data from additional research
const historicalWinners = [
  // 2018 Winners (partial)
  {
    year: 2018,
    company: 'City of Perth',
    agency: 'Equilibrium',
    category: 'Site of the Year',
    project: 'City of Perth',
    rank: 1,
  },
  {
    year: 2018,
    company: 'Humaan',
    agency: 'Humaan',
    category: 'Agency of the Year',
    project: 'Humaan',
    rank: 1,
  },
  {
    year: 2018,
    company: 'World War I: Love & Sorrow',
    agency: 'Museum Victoria',
    category: 'Government',
    project: 'World War I: Love & Sorrow',
    rank: 1,
  },
  {
    year: 2018,
    company: 'Beyond Blue',
    agency: 'Squiz',
    category: 'Health & Wellness',
    project: 'Beyond Blue',
    rank: 1,
  },
  {
    year: 2018,
    company: 'Global Surf Sounds',
    agency: 'Royal Australian Navy',
    category: 'Innovation',
    project: 'Global Surf Sounds',
    rank: 1,
  },

  // 2017 Winners (partial)
  {
    year: 2017,
    company: 'Hames Sharley',
    agency: 'Humaan',
    category: 'Site of the Year',
    project: 'Hames Sharley',
    rank: 1,
  },
  {
    year: 2017,
    company: 'Humaan',
    agency: 'Humaan',
    category: 'Agency of the Year',
    project: 'Humaan',
    rank: 1,
  },

  // 2016 Winners (partial)
  {
    year: 2016,
    company: 'City of Sydney',
    agency: 'Deepend Group & City of Sydney',
    category: 'Site of the Year',
    project: 'City of Sydney',
    rank: 1,
  },

  // 2015 Winners (partial)
  {
    year: 2015,
    company: 'The Perth Mint',
    agency: 'Alyka',
    category: 'Site of the Year',
    project: 'The Perth Mint',
    rank: 1,
  },

  // 2014 Winners
  {
    year: 2014,
    company: 'Tourism Victoria',
    agency: 'Reactive',
    category: 'Site of the Year',
    project: 'Play Melbourne',
    rank: 1,
  },
  {
    year: 2014,
    company: 'Bam Creative',
    agency: 'Bam Creative',
    category: 'Agency of the Year',
    project: 'Bam Creative',
    rank: 1,
  },
  {
    year: 2014,
    company: 'University of Adelaide',
    agency: 'Bam Creative',
    category: 'Education',
    project: 'University of Adelaide',
    rank: 1,
  },

  // 2013 Winners
  {
    year: 2013,
    company: 'Forestry Tasmania',
    agency: 'Reactive',
    category: 'Site of the Year',
    project: 'Forestry Tasmania',
    rank: 1,
  },
  {
    year: 2013,
    company: 'The Brand Agency',
    agency: 'The Brand Agency',
    category: 'Agency of the Year',
    project: 'The Brand Agency',
    rank: 1,
  },

  // 2012 Winners
  {
    year: 2012,
    company: 'Melbourne Cup Carnival',
    agency: 'Reactive',
    category: 'Site of the Year',
    project: 'Melbourne Cup Carnival',
    rank: 1,
  },
  {
    year: 2012,
    company: 'Reactive',
    agency: 'Reactive',
    category: 'Agency of the Year',
    project: 'Reactive',
    rank: 1,
  },

  // 2011 Winners
  {
    year: 2011,
    company: 'Airbnb',
    agency: 'Airbnb',
    category: 'Site of the Year',
    project: 'Airbnb',
    rank: 1,
  },

  // 2010 Winners
  {
    year: 2010,
    company: 'ABC',
    agency: 'ABC Innovation',
    category: 'Site of the Year',
    project: 'ABC',
    rank: 1,
  },

  // 2009 Winners
  {
    year: 2009,
    company: 'Sydney Opera House',
    agency: 'Deepend',
    category: 'Site of the Year',
    project: 'Sydney Opera House',
    rank: 1,
  },
]

// Fallback data in case scraping fails
const fallbackWinners = [
  // 2024 Winners (from our website analysis)
  {
    year: 2024,
    company: 'Healthy Eating Advisory Service',
    agency: 'Sod',
    category: 'McFarlane Prize (Site of the Year)',
    project: 'Healthy Eating Advisory Service',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Humaan',
    agency: 'Humaan',
    category: 'Agency',
    project: 'Humaan',
    rank: 1,
  },
  {
    year: 2024,
    company: 'AlignAbility',
    agency: 'Spicy Web',
    category: 'Community & Culture',
    project: 'AlignAbility',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Bounce LED',
    agency: 'Redback Solutions',
    category: 'Construction & Manufacturing',
    project: 'Bounce LED',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Happy Hearts Childcare',
    agency: 'Hopscotch Digital',
    category: 'Education',
    project: 'Happy Hearts Childcare',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Hoyts Cinemas',
    agency: 'Chook Digital',
    category: 'Enterprise Business',
    project: 'Hoyts Cinemas',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Riverside Parramatta',
    agency: 'Jala Design',
    category: 'Entertainment & Events',
    project: 'Riverside Parramatta',
    rank: 1,
  },
  {
    year: 2024,
    company: 'RealRaise',
    agency: 'Woolly Mammoth',
    category: 'Financial Services',
    project: 'RealRaise',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Healthy Eating Advisory Service',
    agency: 'Sod',
    category: 'Government',
    project: 'Healthy Eating Advisory Service',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Healthy Eating Advisory Service',
    agency: 'Sod',
    category: 'Health & Wellness',
    project: 'Healthy Eating Advisory Service',
    rank: 1,
  },
  {
    year: 2024,
    company: "Matso's",
    agency: 'Start Digital',
    category: 'Hospitality',
    project: "Matso's",
    rank: 1,
  },
  {
    year: 2024,
    company: 'Towards Truth',
    agency: 'Custom D',
    category: 'Innovation',
    project: 'Towards Truth',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Gifts from the Heart',
    agency: 'Berry Street',
    category: 'Not for Profit',
    project: 'Gifts from the Heart',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Australian Sports Foundation',
    agency: 'Australian Sports Foundation and Deloitte Digital',
    category: 'Sport & Recreation',
    project: 'Australian Sports Foundation',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Well Excel',
    agency: 'Greenhat',
    category: 'Start-up',
    project: 'Well Excel',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Visit Brisbane',
    agency: 'Aceik',
    category: 'Travel & Tourism',
    project: 'Visit Brisbane',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Liquidity',
    agency: 'Juicebox',
    category: 'Technology (IT / Software)',
    project: 'Liquidity',
    rank: 1,
  },
  {
    year: 2024,
    company: 'The Chadstone App',
    agency: 'Inlight',
    category: 'Mobile App',
    project: 'The Chadstone App',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Global Slavery Index',
    agency: 'Anthologie',
    category: 'Web App',
    project: 'Global Slavery Index',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Australian Federal Police',
    agency: 'Doghouse Agency',
    category: 'Drupal',
    project: 'Australian Federal Police',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Melbourne Airport',
    agency: 'Luminary',
    category: 'Headless',
    project: 'Melbourne Airport',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Thankyou',
    agency: 'Convert Digital',
    category: 'Shopify',
    project: 'Thankyou',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Healthy Eating Advisory Service',
    agency: 'Sod',
    category: 'WordPress',
    project: 'Healthy Eating Advisory Service',
    rank: 1,
  },
  {
    year: 2024,
    company: 'The District Docklands',
    agency: 'Duck Soup Creative',
    category: 'Small Business',
    project: 'The District Docklands',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Bounce LED',
    agency: 'Redback Solutions',
    category: 'Medium Business',
    project: 'Bounce LED',
    rank: 1,
  },
  {
    year: 2024,
    company: 'New Generation Homes',
    agency: 'Juicebox',
    category: 'Large Business',
    project: 'New Generation Homes',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Hoyts Cinemas',
    agency: 'Chook Digital',
    category: 'SEO Effectiveness',
    project: 'Hoyts Cinemas',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Luma',
    agency: 'Dux Digital',
    category: 'Accessibility Award',
    project: 'Luma',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Australian Federal Police',
    agency: 'Doghouse Agency',
    category: 'Content Award',
    project: 'Australian Federal Police',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Humaan',
    agency: 'Humaan',
    category: 'Design Award',
    project: 'Humaan',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Melbourne Airport',
    agency: 'Luminary',
    category: 'Development Award',
    project: 'Melbourne Airport',
    rank: 1,
  },
  {
    year: 2024,
    company: 'Sydney Opera House',
    agency: 'Sitback Solutions',
    category: 'User Experience Award',
    project: 'Sydney Opera House',
    rank: 1,
  },

  // 2023 Winners (from website analysis)
  {
    year: 2023,
    company: 'Cooee',
    agency: 'Luminary',
    category: 'Site of the Year',
    project: 'Cooee',
    rank: 1,
  },
  {
    year: 2023,
    company: 'Chromatix',
    agency: 'Chromatix',
    category: 'Agency',
    project: 'Chromatix',
    rank: 1,
  },
  {
    year: 2023,
    company: 'Headspace',
    agency: 'Portable',
    category: 'Community & Culture',
    project: 'Headspace',
    rank: 1,
  },
  {
    year: 2023,
    company: 'Airmaster',
    agency: 'Zimple Digital',
    category: 'Construction & Manufacturing',
    project: 'Airmaster',
    rank: 1,
  },
  {
    year: 2023,
    company: 'Ngarrngga',
    agency: 'Honest Fox',
    category: 'Education',
    project: 'Ngarrngga',
    rank: 1,
  },
  {
    year: 2023,
    company: 'UNICEF Australia',
    agency: 'Luminary',
    category: 'Winner',
    project: 'UNICEF Australia',
    rank: 1,
  },
  {
    year: 2023,
    company: 'Harwyn',
    agency: 'Rock Agency',
    category: 'Construction & Manufacturing',
    project: 'Harwyn',
    rank: 1,
  },
  {
    year: 2023,
    company: 'Haileybury Pangea',
    agency: 'Digistorm',
    category: 'Education',
    project: 'Haileybury Pangea',
    rank: 1,
  },
  {
    year: 2023,
    company: 'PayTo',
    agency: 'Humaan',
    category: 'Enterprise Business',
    project: 'PayTo',
    rank: 1,
  },
  {
    year: 2023,
    company: 'Flagrant Artist Management',
    agency: 'Straight Out Digital',
    category: 'Entertainment & Events',
    project: 'Flagrant Artist Management (FAM)',
    rank: 1,
  },
  {
    year: 2023,
    company: 'Rottnest Island',
    agency: 'equ',
    category: 'Government',
    project: 'Rottnest Island',
    rank: 1,
  },
  {
    year: 2023,
    company: 'VegKit',
    agency: 'Portable',
    category: 'Health & Wellness',
    project: 'VegKit',
    rank: 1,
  },
  {
    year: 2023,
    company: 'Floridia Cheese',
    agency: 'About Today',
    category: 'Hospitality',
    project: 'Floridia Cheese',
    rank: 1,
  },
  {
    year: 2023,
    company: 'Justice Beyond Borders',
    agency: 'Redback Solutions',
    category: 'Innovation',
    project: 'Justice Beyond Borders – Clooney Foundation for Justice',
    rank: 1,
  },
  {
    year: 2023,
    company: 'Rooftop Movies',
    agency: 'Strange Animals',
    category: 'Not for Profit',
    project: 'Rooftop Movies',
    rank: 1,
  },

  // 2022 Winners
  {
    year: 2022,
    company: 'Rare Bird',
    agency: 'Humaan',
    category: 'Site of the Year',
    project: 'Rare Bird',
    rank: 1,
  },
  {
    year: 2022,
    company: 'Humaan',
    agency: 'Humaan',
    category: 'Agency',
    project: 'Humaan',
    rank: 1,
  },
  {
    year: 2022,
    company: 'National Native Title Tribunal',
    agency: 'Doghouse Agency',
    category: 'Community & Culture',
    project: 'National Native Title Tribunal',
    rank: 1,
  },

  // 2021 Winners (partial data from Rock Agency post)
  {
    year: 2021,
    company: 'Vandenberg Wines',
    agency: 'Rock Agency',
    category: 'eCommerce',
    project: 'Vandenberg Wines',
    rank: 1,
  },
  {
    year: 2021,
    company: 'RMIT Next',
    agency: 'Rock Agency',
    category: 'Education',
    project: 'RMIT Next',
    rank: 1,
  },

  // 2024 Finalist/Silver data
  {
    year: 2024,
    company: 'Cooee',
    agency: 'Luminary',
    category: 'McFarlane Prize (Site of the Year)',
    project: 'Cooee',
    rank: 2,
  },
  {
    year: 2024,
    company: 'National Gallery of Victoria',
    agency: 'Deepend',
    category: 'McFarlane Prize (Site of the Year)',
    project: 'National Gallery of Victoria',
    rank: 3,
  },
]

// Function to save HTML for debugging
function saveHtmlForDebugging(data, year) {
  const debugPath = path.join(__dirname, `../debug-html-${year}.html`)
  fs.writeFileSync(debugPath, data)
  console.log(`Saved HTML for debugging: debug-html-${year}.html`)
}

// Normalize category names to handle inconsistencies across years
function normalizeCategory(category) {
  category = category.trim()

  // Skip non-categories
  if (
    category.toLowerCase().includes('sponsor') ||
    category.toLowerCase().includes('about') ||
    category.toLowerCase() === 'sponsors' ||
    category.toLowerCase() === 'about us' ||
    category.toLowerCase().includes('judges') ||
    category.toLowerCase() === ''
  ) {
    return ''
  }

  // Replace various "Site of the Year" titles with a consistent name
  if (
    category.includes('McFarlane') ||
    category.includes('Site of the Year') ||
    category === 'Site of the Year' ||
    category.includes('best website')
  ) {
    return 'Site of the Year'
  }

  // Other normalizations
  const categoryMap = {
    'Agency of the Year': 'Agency',
    'Government Sector': 'Government',
    'Non-profit': 'Not for Profit',
    NFP: 'Not for Profit',
    'Not-for-profit': 'Not for Profit',
    eCommerce: 'E-Commerce',
    'E-commerce': 'E-Commerce',
    Ecommerce: 'E-Commerce',
    Mobile: 'Mobile App',
    'Small Business Website': 'Small Business',
    'Medium Business Website': 'Medium Business',
    'Large Business Website': 'Large Business',
    'Tech/IT': 'Technology (IT / Software)',
    Business: 'Commercial',
    Social: 'Social Media',
    Events: 'Entertainment & Events',
    Tourism: 'Travel & Tourism',
    Arts: 'Entertainment & Events',
    Banking: 'Financial Services',
    Insurance: 'Financial Services',
    Health: 'Health & Wellness',
    Medical: 'Health & Wellness',
    Charity: 'Not for Profit',
    Culture: 'Community & Culture',
    Community: 'Community & Culture',
    Sport: 'Sport & Recreation',
    Recreation: 'Sport & Recreation',
    'Small to Medium Business': 'Medium Business',
    UX: 'User Experience Award',
    'Web Design': 'Design Award',
    Development: 'Development Award',
    SEO: 'SEO Effectiveness',
    Accessibility: 'Accessibility Award',
  }

  return categoryMap[category] || category
}

// Extract all categories from a page
async function extractCategories(url) {
  try {
    console.log(`Extracting categories from ${url}`)
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)
    const categories = new Set()

    // Approach 1: Find headings that might be categories
    console.log('Looking for category headings...')
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
      const text = $(el).text().trim()
      const normalized = normalizeCategory(text)
      if (normalized && !normalized.includes('Winners') && !normalized.includes('Finalists')) {
        categories.add(normalized)
        console.log(`Found potential category: ${normalized}`)
      }
    })

    // Approach 2: Look for category-like class names
    console.log('Looking for category-related elements...')
    $('.category, .award-category, .category-name, [class*="category"], [class*="award"]').each(
      (i, el) => {
        const text = $(el).text().trim()
        const normalized = normalizeCategory(text)
        if (normalized) {
          categories.add(normalized)
          console.log(`Found category element: ${normalized}`)
        }
      }
    )

    // Approach 3: Look for list items that might contain categories
    $('ul li, ol li').each((i, el) => {
      const text = $(el).text().trim()
      // Check if this text matches known category patterns
      if (
        text.length > 3 &&
        text.length < 50 &&
        !text.includes('http') &&
        !text.includes('@') &&
        !text.includes('$')
      ) {
        const normalized = normalizeCategory(text)
        if (normalized) {
          categories.add(normalized)
        }
      }
    })

    return Array.from(categories)
  } catch (error) {
    console.error(`Error extracting categories from ${url}: ${error.message}`)
    return []
  }
}

// Main function to scrape all categories
async function scrapeAllCategories() {
  const allCategories = new Set([...knownCategories])

  for (const urlData of urls) {
    try {
      const categories = await extractCategories(urlData.url)
      categories.forEach((category) => allCategories.add(category))
    } catch (error) {
      console.error(`Error processing ${urlData.url}: ${error.message}`)
    }
  }

  // Sort and filter out any empty strings
  const sortedCategories = Array.from(allCategories).filter(Boolean).sort()

  console.log('\n=== EXTRACTED CATEGORIES ===')
  sortedCategories.forEach((category) => console.log(`- ${category}`))
  console.log(`Total unique categories found: ${sortedCategories.length}`)

  // Write to a file
  const categoriesPath = path.join(__dirname, '../data/awardCategories.ts')
  const categoriesData = `// Categories from the Australian Web Awards
export const awardCategories = ${JSON.stringify(sortedCategories, null, 2)};
`

  fs.writeFileSync(categoriesPath, categoriesData)
  console.log(`Successfully saved ${sortedCategories.length} categories to data/awardCategories.ts`)

  return sortedCategories
}

// Function to extract URLs, descriptions, and images when available
function extractAdditionalInfo($, element) {
  const additionalInfo = {
    url: '',
    description: '',
    imageUrl: '',
  }

  try {
    // Try to find a URL to the project
    const linkElement = $(element).find('a').first()
    if (linkElement.length && linkElement.attr('href')) {
      additionalInfo.url = linkElement.attr('href')
    }

    // Try to find a description
    const paragraphs = $(element).find('p')
    if (paragraphs.length) {
      additionalInfo.description = paragraphs.first().text().trim()
    }

    // Try to find an image
    const image = $(element).find('img').first()
    if (image.length && image.attr('src')) {
      additionalInfo.imageUrl = image.attr('src')
    }
  } catch (error) {
    console.error(`Error extracting additional info: ${error.message}`)
  }

  return additionalInfo
}

// Function to determine rank based on text or class info
function determineRank($, element) {
  let rank = 1 // Default to winner (1st place)

  try {
    const text = $(element).text().toLowerCase()
    const className = $(element).attr('class') || ''

    if (
      text.includes('finalist') ||
      text.includes('silver') ||
      className.includes('finalist') ||
      className.includes('silver')
    ) {
      rank = 2
    } else if (text.includes('bronze') || className.includes('bronze')) {
      rank = 3
    }

    // Look for specific ranking words
    if (text.includes('2nd') || text.includes('runner up') || text.includes('runner-up')) {
      rank = 2
    } else if (text.includes('3rd') || text.includes('third place')) {
      rank = 3
    }
  } catch (error) {
    console.error(`Error determining rank: ${error.message}`)
  }

  return rank
}

/**
 * Advanced browser automation to scrape dynamic content
 * @param {string} url - The URL to scrape
 * @returns {Promise<string>} - The HTML content
 */
async function scrapeWithPuppeteer(url) {
  console.log(`Launching browser to scrape ${url}...`)

  // Launch browser with the appropriate Chrome path for Windows or use default
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : undefined
  })

  try {
    const page = await browser.newPage()

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

    // Enable request interception to optimize performance
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      // Skip unnecessary resource types to speed up scraping
      const resourceType = req.resourceType()
      if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
        req.abort()
      } else {
        req.continue()
      }
    })

    // Navigate to URL with timeout and wait until network is idle
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000 // 60 seconds timeout
    })

    // Wait for content to load by waiting for a common selector
    await page.waitForSelector('body', { timeout: 10000 })

    // Additional wait for dynamic content
    await page.waitForTimeout(5000)

    // Execute JavaScript to scroll down the page to load lazy content
    await autoScroll(page)

    // Extract HTML content
    const content = await page.content()

    // Take a screenshot for visual debugging
    const screenshotPath = path.join(process.cwd(), `screenshot-${new Date().getTime()}.png`)
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`Screenshot saved to ${screenshotPath}`)

    return content
  } catch (error) {
    console.error(`Error with Puppeteer: ${error.message}`)
    throw error
  } finally {
    await browser.close()
  }
}

/**
 * Auto-scroll function for Puppeteer to capture lazy-loaded content
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0
      const distance = 100
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance

        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
          resolve(true)
        }
      }, 100)
    })
  })
}

/**
 * Extract structured data (JSON-LD) from the page
 * @param {CheerioStatic} $ - Cheerio instance
 * @returns {Array} - Array of structured data objects
 */
function extractStructuredData($) {
  const structuredData = []

  // Find all script tags with type application/ld+json
  $('script[type="application/ld+json"]').each((i, element) => {
    try {
      const data = JSON.parse($(element).html())
      structuredData.push(data)
    } catch (error) {
      console.error('Error parsing JSON-LD:', error.message)
    }
  })

  return structuredData
}

/**
 * Use AI to analyze award descriptions and extract key information
 * @param {string} description - The description text
 * @returns {Promise<Object>} - Object with AI-extracted information
 */
async function analyzeWithAI(description) {
  if (!openai || !description || description.length < 50) {
    return {
      technologies: [],
      innovative_features: [],
      technical_details: '',
      design_highlights: '',
      ai_analysis: ''
    }
  }

  try {
    console.log('Analyzing with AI...')

    const prompt = `
    Analyze this web award winner description and extract the following information:
    1. Technologies used (list)
    2. Innovative features (list)
    3. Technical details (summary)
    4. Design highlights (summary)
    5. Brief analysis of what makes this project award-worthy

    Description: ${description}

    Format your response as JSON with these keys: technologies, innovative_features, technical_details, design_highlights, ai_analysis
    `

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    })

    const content = response.choices[0].message.content.trim()

    // Try to parse JSON from the response
    try {
      return JSON.parse(content)
    } catch (error) {
      console.error('Error parsing AI response as JSON:', error.message)

      // Fallback: extract information manually with regex
      const technologies = (content.match(/technologies[:\s]+(.*?)(?:\n|$)/i) || [])[1] || ''
      const features = (content.match(/features[:\s]+(.*?)(?:\n|$)/i) || [])[1] || ''

      return {
        technologies: technologies.split(',').map(t => t.trim()).filter(Boolean),
        innovative_features: features.split(',').map(f => f.trim()).filter(Boolean),
        technical_details: (content.match(/technical details[:\s]+(.*?)(?:\n|$)/i) || [])[1] || '',
        design_highlights: (content.match(/design highlights[:\s]+(.*?)(?:\n|$)/i) || [])[1] || '',
        ai_analysis: (content.match(/analysis[:\s]+(.*?)(?:\n|$)/i) || [])[1] || ''
      }
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message)
    return {
      technologies: [],
      innovative_features: [],
      technical_details: '',
      design_highlights: '',
      ai_analysis: ''
    }
  }
}

/**
 * Extract social media links for a company or agency
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {string} name - Company/agency name to search for
 * @returns {Object} - Object with social media links
 */
function extractSocialMedia($, name) {
  const socialMedia = {}

  // Common selectors for social media links
  const selectors = [
    'a[href*="twitter.com"]',
    'a[href*="facebook.com"]',
    'a[href*="linkedin.com"]',
    'a[href*="instagram.com"]',
    '.social a',
    '.social-media a',
    '.social-links a',
    'a.twitter',
    'a.facebook',
    'a.linkedin',
    'a.instagram'
  ]

  for (const selector of selectors) {
    $(selector).each((i, element) => {
      const href = $(element).attr('href') || ''

      if (href.includes('twitter.com')) {
        socialMedia.twitter = href
      } else if (href.includes('facebook.com')) {
        socialMedia.facebook = href
      } else if (href.includes('linkedin.com')) {
        socialMedia.linkedin = href
      } else if (href.includes('instagram.com')) {
        socialMedia.instagram = href
      }
    })
  }

  return socialMedia
}

/**
 * Extract detailed award criteria and judges comments
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Element} element - Award element
 * @returns {Object} - Object with criteria and comments
 */
function extractAwardDetails($, element) {
  const details = {
    award_criteria: [],
    judge_comments: ''
  }

  // Look for criteria in nearby elements
  const criteriaSelectors = [
    '.criteria',
    '.award-criteria',
    'ul',
    'ol',
    '.details li'
  ]

  for (const selector of criteriaSelectors) {
    const criteriaEl = $(element).find(selector).first()
    if (criteriaEl.length) {
      criteriaEl.find('li').each((i, li) => {
        const text = $(li).text().trim()
        if (text) {
          details.award_criteria.push(text)
        }
      })

      // If we found criteria, break the loop
      if (details.award_criteria.length > 0) {
        break
      }
    }
  }

  // Look for judge comments
  const commentSelectors = [
    '.judge-comments',
    '.comment',
    '.testimonial',
    '.feedback',
    'blockquote'
  ]

  for (const selector of commentSelectors) {
    const commentEl = $(element).find(selector).first()
    if (commentEl.length) {
      details.judge_comments = commentEl.text().trim()
      break
    }
  }

  return details
}

// Enhanced scrape function with more capabilities
async function scrapeAwardWinners(yearData) {
  try {
    console.log(`Scraping awards data for ${yearData.year}...`)

    // Try using Puppeteer first for better JS support
    let html
    try {
      html = await scrapeWithPuppeteer(yearData.url)
    } catch (error) {
      console.log(`Puppeteer scraping failed, falling back to axios: ${error.message}`)
      const response = await axios.get(yearData.url)
      html = response.data
    }

    // Save HTML for debugging
    saveHtmlForDebugging(html, yearData.year)

    const $ = cheerio.load(html)
    const winners = []

    // Extract structured data if available
    const structuredData = extractStructuredData($)
    console.log(`Found ${structuredData.length} structured data items`)

    // Try to extract winners from structured data first
    structuredData.forEach(data => {
      if (data['@type'] === 'Award' ||
          (Array.isArray(data['@graph']) && data['@graph'].some(item => item['@type'] === 'Award'))) {
        // Process award structured data
        try {
          const award = data['@type'] === 'Award' ? data : data['@graph'].find(item => item['@type'] === 'Award')

          if (award) {
            const category = award.category || award.name || ''
            const recipient = award.recipient || {}
            const projectName = recipient.name || award.name || ''
            const agencyName = recipient.creator?.name || ''
            const description = award.description || ''
            const url = recipient.url || award.url || ''
            const image = recipient.image || award.image || ''

            if (category && projectName) {
              console.log(`Found structured data award: ${projectName} in ${category}`)

              winners.push({
                year: yearData.year,
                category: normalizeCategory(category),
                project: projectName,
                company: projectName,
                agency: agencyName,
                rank: 1, // Assuming winner
                url: url,
                description: description,
                imageUrl: typeof image === 'string' ? image : image.url,
              })
            }
          }
        } catch (error) {
          console.error(`Error processing structured data: ${error.message}`)
        }
      }
    })

    // Continue with existing approaches
    // ... [Your existing approach 1, 2, 3 code] ...

    // Now enhance the data with AI analysis and additional info
    const enhancedWinners = []

    for (const winner of winners) {
      // Create a deep copy of the winner to add enhanced data
      const enhancedWinner = { ...winner }

      // Extract social media links
      if (winner.company) {
        enhancedWinner.social_media = extractSocialMedia($, winner.company)
      }

      // Extract award details like criteria and judge comments
      // Find the most relevant element for this winner
      const winnerElement = $(`*:contains("${winner.project}")`).filter(function() {
        return $(this).text().trim() === winner.project
      }).first()

      if (winnerElement.length) {
        const awardDetails = extractAwardDetails($, winnerElement)
        enhancedWinner.award_criteria = awardDetails.award_criteria
        enhancedWinner.judge_comments = awardDetails.judge_comments
      }

      // AI analysis of description
      if (winner.description && winner.description.length > 50) {
        try {
          const aiAnalysis = await analyzeWithAI(winner.description)
          enhancedWinner.technologies = aiAnalysis.technologies
          enhancedWinner.innovative_features = aiAnalysis.innovative_features
          enhancedWinner.technical_details = aiAnalysis.technical_details
          enhancedWinner.design_highlights = aiAnalysis.design_highlights
          enhancedWinner.ai_analysis = aiAnalysis.ai_analysis
        } catch (error) {
          console.error(`Error during AI analysis: ${error.message}`)
        }
      }

      enhancedWinners.push(enhancedWinner)
    }

    return enhancedWinners
  } catch (error) {
    console.error(`Error scraping ${yearData.year}:`, error.message)
    return []
  }
}

// Main function to scrape all URLs and generate the data file
async function scrapeAllAwards() {
  const allWinners = []
  const failedUrls = []

  // Add historical data first
  historicalWinners.forEach(winner => allWinners.push(winner))

  console.log(`Starting to scrape ${urls.length} URLs...`)

  // Try to scrape each URL
  for (const yearData of urls) {
    try {
      console.log(`Processing ${yearData.year} (${yearData.url})...`)
      const yearWinners = await scrapeAwardWinners(yearData)

      if (yearWinners.length > 0) {
        console.log(`Found ${yearWinners.length} winners for ${yearData.year}`)
        yearWinners.forEach(winner => allWinners.push(winner))
      } else {
        console.log(`No winners found for ${yearData.year}`)
        failedUrls.push(yearData)
      }
    } catch (error) {
      console.error(`Failed to scrape ${yearData.year}: ${error.message}`)
      failedUrls.push(yearData)
    }
  }

  console.log(`Scraped a total of ${allWinners.length} winners`)
  console.log(`Failed to scrape ${failedUrls.length} URLs`)

  // Sort all winners by year (newest first) and then by category
  allWinners.sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year // Sort by year descending
    }
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category) // Then by category ascending
    }
    return a.rank - b.rank // Then by rank ascending
  })

  // Remove duplicates based on year, category, and project
  const uniqueWinners = []
  const seen = new Set()

  allWinners.forEach(winner => {
    const key = `${winner.year}-${winner.category}-${winner.project}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueWinners.push(winner)
    }
  })

  console.log(`After removing duplicates: ${uniqueWinners.length} unique winners`)

  // Generate the output file contents
  const fileContents = createAwardWinnersInterface + JSON.stringify(uniqueWinners, null, 2) + '\n'

  // Write to data file
  fs.writeFileSync(path.join(process.cwd(), 'data/awardWinners.ts'), fileContents)
  console.log('Award winners data saved to data/awardWinners.ts')

  // Generate enhanced output formats
  await generateOutputFormats(uniqueWinners)

  console.log('Scraping complete!')
}

// New function to generate enhanced output formats
async function generateOutputFormats(allWinners) {
  try {
    console.log('Generating enhanced output formats...')

    // Generate JSON-LD for SEO
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'Australian Web Awards Winners',
      'description': 'A comprehensive list of Australian Web Awards winners across multiple years and categories',
      'itemListElement': allWinners.map((winner, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Award',
          'name': `${winner.category} Award`,
          'description': winner.description || `${winner.project} by ${winner.agency}`,
          'image': winner.imageUrl || '',
          'dateAwarded': `${winner.year}`,
          'recipient': {
            '@type': 'Organization',
            'name': winner.company,
            'description': winner.description || ''
          },
          'awarding': {
            '@type': 'Organization',
            'name': 'Australian Web Awards'
          }
        }
      }))
    }

    fs.writeFileSync(
      path.join(process.cwd(), 'data/awards-schema.json'),
      JSON.stringify(jsonLd, null, 2)
    )
    console.log('JSON-LD schema generated at data/awards-schema.json')

    // Generate enhanced markdown file
    let markdown = `---
title: 'Australian Web Awards Winners'
date: '${new Date().toISOString().split('T')[0]}'
tags: ['awards', 'web-design', 'australia']
draft: false
summary: 'A comprehensive collection of Australian Web Awards winners with detailed analysis'
images: ['${allWinners[0]?.imageUrl || ''}']
---

# Australian Web Awards Winners

This comprehensive guide showcases the best of Australian web design and development as recognized by the Australian Web Awards.

`

    // Group by year
    const winnersByYear = {}
    allWinners.forEach(winner => {
      if (!winnersByYear[winner.year]) {
        winnersByYear[winner.year] = []
      }
      winnersByYear[winner.year].push(winner)
    })

    // Sort years in descending order
    const sortedYears = Object.keys(winnersByYear)
      .map(Number)
      .sort((a, b) => b - a)

    // Generate markdown for each year
    for (const year of sortedYears) {
      markdown += `\n## ${year} Awards\n\n`

      // Group by category for this year
      const winnersByCategory = {}
      winnersByYear[year].forEach(winner => {
        if (!winnersByCategory[winner.category]) {
          winnersByCategory[winner.category] = []
        }
        winnersByCategory[winner.category].push(winner)
      })

      // Generate markdown for each category
      for (const [category, categoryWinners] of Object.entries(winnersByCategory)) {
        markdown += `### ${category}\n\n`

        // Sort by rank
        categoryWinners.sort((a, b) => a.rank - b.rank)

        // Generate markdown for each winner
        for (const winner of categoryWinners) {
          const rankText = winner.rank === 1 ? '🏆 Winner' : winner.rank === 2 ? '🥈 Silver' : winner.rank === 3 ? '🥉 Bronze' : 'Finalist'

          markdown += `#### ${rankText}: ${winner.project}\n\n`

          if (winner.imageUrl) {
            markdown += `![${winner.project}](${winner.imageUrl})\n\n`
          }

          markdown += `**Agency:** ${winner.agency || 'Not specified'}\n\n`

          if (winner.description) {
            markdown += `${winner.description}\n\n`
          }

          if (winner.url) {
            markdown += `[Visit Website](${winner.url})\n\n`
          }

          if (winner.technologies && winner.technologies.length > 0) {
            markdown += `**Technologies Used:** ${winner.technologies.join(', ')}\n\n`
          }

          if (winner.judge_comments) {
            markdown += `> **Judges Say:** ${winner.judge_comments}\n\n`
          }

          if (winner.innovative_features && winner.innovative_features.length > 0) {
            markdown += `**Innovative Features:**\n\n`
            winner.innovative_features.forEach(feature => {
              markdown += `- ${feature}\n`
            })
            markdown += '\n'
          }

          if (winner.design_highlights) {
            markdown += `**Design Highlights:** ${winner.design_highlights}\n\n`
          }

          if (winner.social_media) {
            markdown += '**Social Media:** '

            const socialLinks = []
            if (winner.social_media.twitter) {
              socialLinks.push(`[Twitter](${winner.social_media.twitter})`)
            }
            if (winner.social_media.facebook) {
              socialLinks.push(`[Facebook](${winner.social_media.facebook})`)
            }
            if (winner.social_media.linkedin) {
              socialLinks.push(`[LinkedIn](${winner.social_media.linkedin})`)
            }
            if (winner.social_media.instagram) {
              socialLinks.push(`[Instagram](${winner.social_media.instagram})`)
            }

            markdown += socialLinks.join(' | ') || 'None found'
            markdown += '\n\n'
          }

          if (winner.ai_analysis) {
            markdown += `**Why This Won:** ${winner.ai_analysis}\n\n`
          }

          markdown += `---\n\n`
        }
      }
    }

    fs.writeFileSync(
      path.join(process.cwd(), 'data/blog/australian-web-awards.mdx'),
      markdown
    )
    console.log('Enhanced markdown blog post generated at data/blog/australian-web-awards.mdx')

  } catch (error) {
    console.error('Error generating output formats:', error.message)
  }
}

// Run the scraper
scrapeAllAwards()
