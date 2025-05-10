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

  // Determine which winners to display based on filters
  const filteredWinners = isSearching
    ? searchResults
    : selectedCategory === 'all'
      ? awardWinners
      : awardWinners.filter((winner) => winner.category === selectedCategory)

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

        <AnimatePresence>
          {selectedCategory !== 'all' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700 shadow dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
            >
              <div className="mr-3 rounded-full bg-blue-100 p-2 dark:bg-blue-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-700 dark:text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">
                  Showing awards in the &quot;{selectedCategory}&quot; category.
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {filteredWinners.length} entries found across {filteredYears.length} years.
                </p>
              </div>
            </motion.div>
          )}

          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 shadow dark:border-green-800 dark:bg-green-900/50 dark:text-green-200"
            >
              <div className="mr-3 rounded-full bg-green-100 p-2 dark:bg-green-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-700 dark:text-green-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Search results for &quot;{searchQuery}&quot;</p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {searchResults.length} entries found across {filteredYears.length} years.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                      whileHover={{ y: -5 }}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="absolute -top-1 -right-1">
                        {winner.rank === 1 && (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-white shadow-lg">
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
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-400 text-white shadow-lg">
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
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-700 text-white shadow-lg">
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
                          <div className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 mb-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                            {winner.category}
                          </div>
                        </div>

                        <h3 className="group-hover:text-primary-500 dark:group-hover:text-primary-400 mb-2 text-xl font-bold text-gray-900 dark:text-white">
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
                            Agency: {winner.agency}
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
                          Company: {winner.company}
                        </p>

                        {winner.description && (
                          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            {winner.description.length > 120
                              ? `${winner.description.substring(0, 120)}...`
                              : winner.description}
                          </p>
                        )}

                        {winner.url && (
                          <a
                            href={winner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-2 inline-flex items-center rounded-lg px-4 py-2 text-center text-sm font-medium text-white focus:ring-4 focus:outline-none"
                          >
                            Visit Project
                            <svg
                              className="ml-2 h-4 w-4"
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
