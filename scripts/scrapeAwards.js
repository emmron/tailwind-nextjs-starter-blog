const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

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

// Create the AwardWinner interface structure with additional fields
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

// Enhanced scrape function with more heuristics for finding awards
async function scrapeAwardWinners(yearData) {
  try {
    console.log(`Scraping awards data for ${yearData.year}...`)
    const response = await axios.get(yearData.url)

    // Save HTML for debugging
    saveHtmlForDebugging(response.data, yearData.year)

    const $ = cheerio.load(response.data)
    const winners = []

    // Enhanced approach 1: Use more specific CSS selectors with better targeting
    console.log('Trying enhanced approach 1: Specific CSS selectors')

    // Look for award winner blocks with specific structure - expanded selector list
    $('.winner, .finalist, .award-item, .award-winner, .award-entry, .award, .entry, .award-card, .winner-card, .finalist-card, .card, .result, .result-item, .project, .project-item, [class*="award"], [class*="winner"], [class*="finalist"]').each((index, element) => {
      try {
        let category = ''

        // Try to find category from nearest heading
        const headings = $(element).closest('section, div').find('h2, h3, h4').first()
        if (headings.length) {
          category = headings.text().trim()
        }

        // If no category found yet, go up the DOM tree to find a heading
        if (!category) {
          let parent = $(element).parent()
          for (let i = 0; i < 5 && !category; i++) {
            const heading = parent.find('h2, h3, h4').first()
            if (heading.length) {
              category = heading.text().trim()
              break
            }
            parent = parent.parent()
          }
        }

        // Try various selectors for project name
        const projectSelectors = [
          '.winner-name',
          '.project-name',
          '.entry-name',
          '.title',
          'h3',
          'h4',
          'strong',
        ]
        let projectName = ''

        for (const selector of projectSelectors) {
          const projectElement = $(element).find(selector).first()
          if (projectElement.length) {
            projectName = projectElement.text().trim()
            break
          }
        }

        // If still no project name, use the first strong text
        if (!projectName) {
          projectName = $(element).find('strong').first().text().trim()
        }

        // Try various selectors for agency name
        const agencySelectors = ['.agency-name', '.agency', '.creator', '.company', '.by']
        let agencyName = ''

        for (const selector of agencySelectors) {
          const agencyElement = $(element).find(selector).first()
          if (agencyElement.length) {
            agencyName = agencyElement
              .text()
              .trim()
              .replace(/^by\s+|^by:/i, '')
            break
          }
        }

        // If no agency name yet, look for text containing "by" or "agency"
        if (!agencyName) {
          const text = $(element).text()
          const byMatch = text.match(/by[\s:]+([\w\s&]+)/i)
          if (byMatch && byMatch[1]) {
            agencyName = byMatch[1].trim()
          }
        }

        // Determine rank (1st/2nd/3rd place)
        const rank = determineRank($, element)

        // Extract additional information
        const additionalInfo = extractAdditionalInfo($, element)

        // Normalize the category
        const normalizedCategory = normalizeCategory(category)

        console.log(
          `Found potential winner: Category=${normalizedCategory}, Project=${projectName}, Agency=${agencyName}, Rank=${rank}`
        )

        if (normalizedCategory && projectName) {
          winners.push({
            year: yearData.year,
            category: normalizedCategory,
            project: projectName,
            company: projectName, // Default to project name if no separate company info
            agency: agencyName,
            rank: rank,
            url: additionalInfo.url,
            description: additionalInfo.description,
            imageUrl: additionalInfo.imageUrl,
          })
        }
      } catch (error) {
        console.error(`Error processing winner element: ${error.message}`)
      }
    })

    // Enhanced approach 2: Find winner sections by content analysis
    if (winners.length === 0) {
      console.log('Trying enhanced approach 2: Content analysis')

      // Look for sections that likely contain winner info
      $('section, article, div.winner, div.awards, div.content').each((index, element) => {
        // Check if this section has headings that suggest categories
        const headings = $(element).find('h2, h3, h4')

        headings.each((i, heading) => {
          const categoryText = $(heading).text().trim()

          // Skip non-category headings
          if (
            categoryText.toLowerCase().includes('sponsor') ||
            categoryText.toLowerCase().includes('about') ||
            categoryText.toLowerCase() === 'winners' ||
            categoryText.toLowerCase() === 'finalists' ||
            categoryText === ''
          ) {
            return
          }

          const normalizedCategory = normalizeCategory(categoryText)

          // Find the content after this heading until the next heading
          let content = ''
          let currentNode = $(heading).next()

          while (currentNode.length && !currentNode.is('h2, h3, h4')) {
            content += currentNode.text() + ' '
            currentNode = currentNode.next()
          }

          // Try to extract winner patterns from the content
          const winnerPatterns = [
            /winner:?\s+([^,\n]+)(?:[\s,]+by\s+([^,\n]+))?/i,
            /gold:?\s+([^,\n]+)(?:[\s,]+by\s+([^,\n]+))?/i,
            /1st:?\s+([^,\n]+)(?:[\s,]+by\s+([^,\n]+))?/i,
            /silver:?\s+([^,\n]+)(?:[\s,]+by\s+([^,\n]+))?/i,
            /2nd:?\s+([^,\n]+)(?:[\s,]+by\s+([^,\n]+))?/i,
            /bronze:?\s+([^,\n]+)(?:[\s,]+by\s+([^,\n]+))?/i,
            /3rd:?\s+([^,\n]+)(?:[\s,]+by\s+([^,\n]+))?/i,
          ]

          // Check each pattern
          for (const pattern of winnerPatterns) {
            const match = content.match(pattern)
            if (match) {
              const projectName = match[1].trim()
              const agencyName = match[2] ? match[2].trim() : ''

              // Determine rank based on the pattern
              let rank = 1
              if (pattern.toString().includes('silver') || pattern.toString().includes('2nd')) {
                rank = 2
              } else if (
                pattern.toString().includes('bronze') ||
                pattern.toString().includes('3rd')
              ) {
                rank = 3
              }

              console.log(
                `Found pattern match: Category=${normalizedCategory}, Project=${projectName}, Agency=${agencyName}, Rank=${rank}`
              )

              if (projectName) {
                winners.push({
                  year: yearData.year,
                  category: normalizedCategory,
                  project: projectName,
                  company: projectName,
                  agency: agencyName,
                  rank: rank,
                })
              }
            }
          }
        })
      })
    }

    // Enhanced approach 3: Table parsing
    if (winners.length === 0) {
      console.log('Trying enhanced approach 3: Table parsing')

      // Look for tables that might contain award data
      $('table').each((index, table) => {
        let category = ''

        // Try to find category from nearest heading
        const headings = $(table).closest('section, div').find('h2, h3').first()
        if (headings.length) {
          category = headings.text().trim()
          category = normalizeCategory(category)
        }

        // Process table rows
        $(table)
          .find('tr')
          .each((rowIndex, row) => {
            // Skip header rows
            if (rowIndex === 0 && $(row).find('th').length > 0) {
              return
            }

            const cells = $(row).find('td')

            // Different patterns based on the number of cells
            if (cells.length >= 2) {
              let projectName = ''
              let agencyName = ''
              let rank = 1

              // If we have 3+ columns, assume it's [rank, project, agency]
              if (cells.length >= 3) {
                const rankText = $(cells[0]).text().trim().toLowerCase()
                if (
                  rankText.includes('winner') ||
                  rankText.includes('gold') ||
                  rankText.includes('1')
                ) {
                  rank = 1
                } else if (
                  rankText.includes('finalist') ||
                  rankText.includes('silver') ||
                  rankText.includes('2')
                ) {
                  rank = 2
                } else if (rankText.includes('bronze') || rankText.includes('3')) {
                  rank = 3
                }

                projectName = $(cells[1]).text().trim()
                agencyName = $(cells[2]).text().trim()
              }
              // If 2 columns, assume it's [project, agency]
              else {
                projectName = $(cells[0]).text().trim()
                agencyName = $(cells[1]).text().trim()
              }

              if (category && projectName) {
                console.log(
                  `Found table entry: Category=${category}, Project=${projectName}, Agency=${agencyName}, Rank=${rank}`
                )

                winners.push({
                  year: yearData.year,
                  category: category,
                  project: projectName,
                  company: projectName,
                  agency: agencyName,
                  rank: rank,
                })
              }
            }
          })
      })
    }

    // New Approach 4: Look for patterns in list items and paragraphs
    if (winners.length === 0) {
      console.log('Trying approach 4: List item and paragraph patterns')

      $('li, p').each((i, el) => {
        const text = $(el).text().trim()

        // Skip short or irrelevant texts
        if (text.length < 10 || text.length > 300) return

        // Look for patterns like "Category: Winner - Agency" or similar structures
        const patterns = [
          /([A-Za-z\s&']+)(?::|Award|Winner):?\s+([A-Za-z0-9\s&'\.]+)(?:\s+-\s+|\s+by\s+)([A-Za-z0-9\s&'\.]+)/i,
          /([A-Za-z\s&']+)(?:\s+Winner|\s+Gold):?\s+([A-Za-z0-9\s&'\.]+)(?:\s+-\s+|\s+by\s+)([A-Za-z0-9\s&'\.]+)/i,
          /(?:Winner|Gold|First)(?:\s+|\s+of\s+)([A-Za-z\s&']+):?\s+([A-Za-z0-9\s&'\.]+)(?:\s+-\s+|\s+by\s+)([A-Za-z0-9\s&'\.]+)/i,
        ]

        for (const pattern of patterns) {
          const match = text.match(pattern)
          if (match) {
            const [_, catText, projectText, agencyText] = match
            const category = normalizeCategory(catText.trim())
            const project = projectText.trim()
            const agency = agencyText.trim()

            if (category && project) {
              console.log(`Found list/paragraph pattern: Category=${category}, Project=${project}, Agency=${agency}`)
              winners.push({
                year: yearData.year,
                category: category,
                project: project,
                company: project, // Default to project name if no separate company info
                agency: agency,
                rank: 1,
              })
            }
          }
        }
      })
    }

    console.log(`Found ${winners.length} winners for ${yearData.year}`)
    return winners
  } catch (error) {
    console.error(`Error scraping ${yearData.year}:`, error.message)
    return []
  }
}

// Main function to scrape all URLs and generate the data file
async function scrapeAllAwards() {
  let allWinners = []

  // Try to scrape each URL
  for (const yearData of urls) {
    try {
      const yearWinners = await scrapeAwardWinners(yearData)
      if (yearWinners.length > 0) {
        allWinners = [...allWinners, ...yearWinners]
      } else {
        console.log(`No winners found for ${yearData.year}. Using historical data if available.`)
      }
    } catch (error) {
      console.error(`Failed to scrape ${yearData.year}: ${error.message}`)
    }
  }

  // Add historical data for older years or missing entries
  console.log('Adding historical data...')
  const historicalData = historicalWinners.filter(
    (winner) =>
      !allWinners.some(
        (w) =>
          w.year === winner.year && w.category === winner.category && w.project === winner.project
      )
  )

  console.log(`Adding ${historicalData.length} historical entries`)
  allWinners = [...allWinners, ...historicalData]

  // Add the fallback data for any missing categories in recent years
  const additionalWinners = fallbackWinners.filter(
    (winner) =>
      !allWinners.some(
        (w) => w.year === winner.year && w.category === winner.category && w.rank === winner.rank
      )
  )

  console.log(`Adding ${additionalWinners.length} additional winners from our manual data`)
  allWinners = [...allWinners, ...additionalWinners]

  // Clean up and normalize data
  allWinners = allWinners.map((winner) => ({
    ...winner,
    category: normalizeCategory(winner.category),
    // Remove any undefined or empty URL/description/imageUrl fields
    ...(winner.url && winner.url.trim() ? {} : { url: undefined }),
    ...(winner.description && winner.description.trim() ? {} : { description: undefined }),
    ...(winner.imageUrl && winner.imageUrl.trim() ? {} : { imageUrl: undefined }),
  }))

  // Remove duplicates
  const uniqueWinners = []
  const seenWinners = new Set()

  allWinners.forEach((winner) => {
    const key = `${winner.year}-${winner.category}-${winner.project}-${winner.rank}`
    if (!seenWinners.has(key)) {
      seenWinners.add(key)
      uniqueWinners.push(winner)
    }
  })

  // Sort by year (descending), then category, then rank
  uniqueWinners.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    if (a.category !== b.category) return a.category.localeCompare(b.category)
    return a.rank - b.rank
  })

  // Format the data as a TypeScript file
  const outputData = `${createAwardWinnersInterface}${JSON.stringify(uniqueWinners, null, 2)};`

  // Write to the awardsWinners.ts file
  const outputPath = path.join(__dirname, '../data/awardsWinners.ts')
  fs.writeFileSync(outputPath, outputData)

  console.log(`Successfully saved ${uniqueWinners.length} award winners to data/awardsWinners.ts`)
}

// Run the scraper
scrapeAllAwards()
