'use client'

import { useState, useEffect } from 'react'
import { AwardWinner } from '@/data/awardsWinners'

interface CategoryFilterProps {
  categories: string[]
  onFilterChange: (category: string) => void
  awardWinners?: AwardWinner[]
}

export default function CategoryFilter({
  categories,
  onFilterChange,
  awardWinners = [],
}: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [showAll, setShowAll] = useState(false)
  const [displayCategories, setDisplayCategories] = useState<string[]>([])

  // Calculate category counts
  useEffect(() => {
    const counts: Record<string, number> = { all: awardWinners.length }
    categories.forEach((category) => {
      counts[category] = awardWinners.filter((winner) => winner.category === category).length
    })
    setCategoryCounts(counts)

    // Show only top 10 categories initially
    const sorted = [...categories].sort((a, b) => (counts[b] || 0) - (counts[a] || 0))
    setDisplayCategories(sorted.slice(0, 10))
  }, [categories, awardWinners])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    onFilterChange(category)
  }

  return (
    <div className="mb-2 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Filter by Category:</h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {showAll ? 'Show Less' : `Show All (${categories.length})`}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`group flex items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white shadow-md dark:bg-blue-700'
              : 'border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-blue-900/30'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          <span>All Categories</span>
          <span
            className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
              selectedCategory === 'all'
                ? 'bg-white text-blue-700 group-hover:bg-blue-100 dark:bg-blue-200 dark:text-blue-800'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {categoryCounts.all || 0}
          </span>
        </button>

        {(showAll ? categories : displayCategories).map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`group flex items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-md dark:bg-blue-700'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-blue-900/30'
            }`}
          >
            <span>{category}</span>
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                selectedCategory === category
                  ? 'bg-white text-blue-700 group-hover:bg-blue-100 dark:bg-blue-200 dark:text-blue-800'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {categoryCounts[category] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
