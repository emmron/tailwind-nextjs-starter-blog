'use client'

import { useState, useEffect } from 'react'
import { AwardWinner } from '@/data/awardsWinners'
import CategoryFilter from './CategoryFilter'
import { motion, AnimatePresence } from 'framer-motion'

interface AwardsClientProps {
  years: number[]
  categories: string[]
  awardWinners: AwardWinner[]
}

export default function AwardsClient({ years, categories, awardWinners }: AwardsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRank, setSelectedRank] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<AwardWinner[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    // Reset search when changing category
    setSearchQuery('')
    setIsSearching(false)
  }

  const handleRankChange = (rank: number | null) => {
    setSelectedRank(rank)
    // Reset search when changing rank
    setSearchQuery('')
    setIsSearching(false)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim() === '') {
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    // Simple search through all relevant fields
    const filtered = awardWinners.filter((winner) => {
      const lowerQuery = query.toLowerCase()
      return (
        winner.company.toLowerCase().includes(lowerQuery) ||
        winner.agency?.toLowerCase().includes(lowerQuery) ||
        winner.project.toLowerCase().includes(lowerQuery) ||
        winner.category.toLowerCase().includes(lowerQuery) ||
        winner.description?.toLowerCase().includes(lowerQuery)
      )
    })

    setSearchResults(filtered)
  }

  // Filter by rank first if a rank is selected
  const rankFilteredWinners = selectedRank
    ? awardWinners.filter((winner) => winner.rank === selectedRank)
    : awardWinners

  // Determine which winners to display based on filters
  const filteredWinners = isSearching
    ? searchResults
    : selectedCategory === 'all'
      ? rankFilteredWinners
      : rankFilteredWinners.filter((winner) => winner.category === selectedCategory)

  const filteredYears = [...new Set(filteredWinners.map((winner) => winner.year))].sort(
    (a, b) => b - a
  )

  return (
    <>
      <motion.div
        className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-xl transition-all dark:border-gray-700 dark:bg-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex flex-col items-start gap-6 md:flex-row md:items-center">
          {/* Rank Filter - Moved to top */}
          <div className="w-full md:w-auto">
            <div>
              <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">
                Award Rank:
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleRankChange(null)}
                  className={`group flex items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selectedRank === null
                      ? 'bg-blue-600 text-white shadow-md dark:bg-blue-700'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-blue-900'
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
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  <span>All Ranks</span>
                </button>
                <button
                  onClick={() => handleRankChange(1)}
                  className={`group flex items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selectedRank === 1
                      ? 'bg-yellow-500 text-white shadow-md dark:bg-yellow-600'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-yellow-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-yellow-900/30'
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Winners</span>
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                      selectedRank === 1
                        ? 'bg-white text-yellow-700 group-hover:bg-yellow-100'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {awardWinners.filter((winner) => winner.rank === 1).length}
                  </span>
                </button>
                <button
                  onClick={() => handleRankChange(2)}
                  className={`group flex items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selectedRank === 2
                      ? 'bg-gray-400 text-white shadow-md dark:bg-gray-500'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
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
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  <span>Finalists</span>
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                      selectedRank === 2
                        ? 'bg-white text-gray-700 group-hover:bg-gray-100'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {awardWinners.filter((winner) => winner.rank === 2).length}
                  </span>
                </button>
                <button
                  onClick={() => handleRankChange(3)}
                  className={`group flex items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selectedRank === 3
                      ? 'bg-orange-700 text-white shadow-md dark:bg-orange-800'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-orange-900/30'
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
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Bronze</span>
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                      selectedRank === 3
                        ? 'bg-white text-orange-700 group-hover:bg-orange-100'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {awardWinners.filter((winner) => winner.rank === 3).length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col items-start gap-4 md:flex-row">
          <div className="w-full md:w-2/3">
            <CategoryFilter
              categories={categories}
              onFilterChange={handleCategoryChange}
              awardWinners={awardWinners}
            />
          </div>
          <div className="w-full md:w-1/3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search projects, companies..."
                value={searchQuery}
                onChange={handleSearch}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-12 pl-10 text-gray-900 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
              {searchQuery && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => {
                    setSearchQuery('')
                    setIsSearching(false)
                  }}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-gray-200 p-1 text-gray-500 hover:bg-gray-300 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                  aria-label="Clear search"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== 'all' || selectedRank !== null || isSearching) && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Filters:
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== 'all' && (
                <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <span>Category: {selectedCategory}</span>
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="ml-1 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                    title="Clear category filter"
                    aria-label="Clear category filter"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {selectedRank !== null && (
                <div
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                    selectedRank === 1
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : selectedRank === 2
                        ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                  }`}
                >
                  <span>
                    Rank:{' '}
                    {selectedRank === 1 ? 'Winners' : selectedRank === 2 ? 'Finalists' : 'Bronze'}
                  </span>
                  <button
                    onClick={() => handleRankChange(null)}
                    className={`ml-1 rounded-full p-0.5 ${
                      selectedRank === 1
                        ? 'hover:bg-yellow-200 dark:hover:bg-yellow-800'
                        : selectedRank === 2
                          ? 'hover:bg-gray-300 dark:hover:bg-gray-600'
                          : 'hover:bg-orange-200 dark:hover:bg-orange-800'
                    }`}
                    title="Clear rank filter"
                    aria-label="Clear rank filter"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {isSearching && (
                <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <span>Search: "{searchQuery}"</span>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setIsSearching(false)
                    }}
                    className="ml-1 rounded-full p-0.5 hover:bg-green-200 dark:hover:bg-green-800"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {filteredWinners.length} entries found across {filteredYears.length} years
            </div>
          </div>
        )}

        {filteredWinners.length > 0 && (
          <div className="mb-4 text-center">
            <div className="mb-2 inline-flex items-center space-x-2 rounded-md bg-gray-100 px-4 py-2 dark:bg-gray-800">
              <div className="flex items-center">
                <div className="mr-1 h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Winners
                </span>
              </div>
              <div className="flex items-center">
                <div className="mr-1 h-3 w-3 rounded-full bg-gray-400"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Finalists
                </span>
              </div>
              <div className="flex items-center">
                <div className="mr-1 h-3 w-3 rounded-full bg-orange-700"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Bronze</span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>{/* Removed the old notification banners */}</AnimatePresence>
      </motion.div>

      {filteredWinners.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
          <div className="inline-block rounded-lg bg-gray-100 p-8 shadow-md dark:bg-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-4 h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
              No awards found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try changing your filter or search criteria.
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          {filteredYears.map((year) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="from-primary-500 to-primary-700 mb-4 inline-block bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
                {year} Awards
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredWinners
                  .filter((winner) => winner.year === year)
                  .map((winner, index) => (
                    <motion.div
                      key={`${winner.year}-${winner.category}-${winner.project}-${index}`}
                      className={`group relative overflow-hidden rounded-lg border ${
                        winner.rank === 1
                          ? 'border-yellow-200 bg-gradient-to-br from-white to-yellow-50 dark:border-yellow-900/30 dark:from-gray-800 dark:to-yellow-900/10'
                          : winner.rank === 2
                            ? 'border-gray-200 bg-gradient-to-br from-white to-gray-50 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900/50'
                            : 'border-orange-200 bg-gradient-to-br from-white to-orange-50 dark:border-orange-900/30 dark:from-gray-800 dark:to-orange-900/10'
                      } shadow-md transition-all hover:shadow-xl`}
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="absolute -top-1 -right-1 z-10">
                        {winner.rank === 1 && (
                          <div className="flex h-16 w-16 transform items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                          </div>
                        )}
                        {winner.rank === 2 && (
                          <div className="flex h-16 w-16 transform items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                        )}
                        {winner.rank === 3 && (
                          <div className="flex h-16 w-16 transform items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-orange-800 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 mb-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium">
                            <span className="mr-1">
                              {winner.rank === 1 ? '🏆' : winner.rank === 2 ? '🥈' : '🥉'}
                            </span>
                            {winner.category}
                          </div>
                        </div>

                        <h3 className="group-hover:text-primary-500 dark:group-hover:text-primary-400 mb-2 text-xl font-bold text-gray-900 transition-colors dark:text-white">
                          {winner.project}
                        </h3>

                        {winner.agency && (
                          <p className="mb-1 flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="mr-1 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            <span className="font-medium">Agency:</span> {winner.agency}
                          </p>
                        )}

                        <p className="mb-3 flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-1 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="font-medium">Company:</span> {winner.company}
                        </p>

                        {winner.description && (
                          <div className="mb-4 overflow-hidden">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {winner.description.length > 120
                                ? `${winner.description.substring(0, 120)}...`
                                : winner.description}
                            </p>
                          </div>
                        )}

                        {winner.url && (
                          <a
                            href={winner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group mt-3 inline-flex items-center rounded-lg px-4 py-2 text-center text-sm font-medium text-white shadow transition-all duration-200 hover:scale-105 focus:ring-4 focus:outline-none ${
                              winner.rank === 1
                                ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800'
                                : winner.rank === 2
                                  ? 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800'
                                  : 'bg-orange-700 hover:bg-orange-800 focus:ring-orange-300 dark:bg-orange-800 dark:hover:bg-orange-900 dark:focus:ring-orange-800'
                            }`}
                          >
                            Visit Project
                            <svg
                              className="ml-2 h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              ></path>
                            </svg>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))}
        </>
      )}
    </>
  )
}
