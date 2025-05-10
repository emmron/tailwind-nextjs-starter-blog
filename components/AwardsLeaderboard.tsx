'use client'

import { useState } from 'react'
import { AwardWinner } from '@/data/awardsWinners'
import { motion, AnimatePresence } from 'framer-motion'

interface LeaderStats {
  name: string
  wins: number
  firstPlace: number
  uniqueYears: number
  yearSpan: string
  categories: string[]
  type: 'agency' | 'company'
}

interface AwardsLeaderboardProps {
  awardWinners: AwardWinner[]
}

export default function AwardsLeaderboard({ awardWinners }: AwardsLeaderboardProps) {
  const [leaderboardType, setLeaderboardType] = useState<'agency' | 'company'>('agency')
  const [sortBy, setSortBy] = useState<'wins' | 'firstPlace' | 'uniqueYears'>('wins')
  const [limit, setLimit] = useState<number>(10)

  // Calculate stats for agencies and companies
  const calculateStats = (type: 'agency' | 'company'): LeaderStats[] => {
    const statsMap = new Map<string, LeaderStats>()

    awardWinners.forEach((winner) => {
      const name = type === 'agency' ? winner.agency : winner.company

      // Skip if no agency name (for agency type)
      if (type === 'agency' && !name) return

      if (!statsMap.has(name)) {
        statsMap.set(name, {
          name,
          wins: 0,
          firstPlace: 0,
          uniqueYears: 0,
          yearSpan: '',
          categories: [],
          type,
        })
      }

      const stats = statsMap.get(name)!
      stats.wins++

      if (winner.rank === 1) {
        stats.firstPlace++
      }

      // Track unique categories
      if (!stats.categories.includes(winner.category)) {
        stats.categories.push(winner.category)
      }
    })

    // Calculate unique years and year span for each entity
    statsMap.forEach((stats, name) => {
      const years = awardWinners
        .filter((w) => (type === 'agency' ? w.agency === name : w.company === name))
        .map((w) => w.year)

      const uniqueYears = [...new Set(years)]
      stats.uniqueYears = uniqueYears.length

      const minYear = Math.min(...uniqueYears)
      const maxYear = Math.max(...uniqueYears)
      stats.yearSpan = minYear === maxYear ? `${minYear}` : `${minYear} - ${maxYear}`
    })

    // Convert map to array and sort
    return Array.from(statsMap.values())
      .sort((a, b) => {
        if (sortBy === 'wins') return b.wins - a.wins
        if (sortBy === 'firstPlace') return b.firstPlace - a.firstPlace
        return b.uniqueYears - a.uniqueYears
      })
      .slice(0, limit)
  }

  const leaderboardData = calculateStats(leaderboardType)

  // Find the maximum value for the selected metric to calculate percentages for the bars
  const maxValue = Math.max(...leaderboardData.map((item) => item[sortBy]))

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Australian Web Awards Leaderboard
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          See who's performed the best over the history of the awards
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setLeaderboardType('agency')}
            className={`rounded-lg px-4 py-2 font-medium ${
              leaderboardType === 'agency'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Agencies
          </button>
          <button
            onClick={() => setLeaderboardType('company')}
            className={`rounded-lg px-4 py-2 font-medium ${
              leaderboardType === 'company'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Companies
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'wins' | 'firstPlace' | 'uniqueYears')}
            className="focus:border-primary-500 focus:ring-primary-500 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            aria-label="Sort leaderboard by"
          >
            <option value="wins">Most Wins</option>
            <option value="firstPlace">Most 1st Places</option>
            <option value="uniqueYears">Most Active Years</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="focus:border-primary-500 focus:ring-primary-500 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            aria-label="Number of results to show"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${leaderboardType}-${sortBy}-${limit}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    Rank
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    {leaderboardType === 'agency' ? 'Agency' : 'Company'}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    Total Wins
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    First Places
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    Years Active
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    Categories
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {leaderboardData.map((item, index) => (
                  <motion.tr
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <span className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.yearSpan}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-1 flex items-center">
                        <span className="mr-2 text-base font-semibold text-gray-900 dark:text-white">
                          {item.wins}
                        </span>
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <motion.div
                            className="bg-primary-500 dark:bg-primary-400 h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.wins / maxValue) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-1 flex items-center">
                        <span className="mr-2 text-base font-semibold text-gray-900 dark:text-white">
                          {item.firstPlace}
                        </span>
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <motion.div
                            className="h-full bg-yellow-500 dark:bg-yellow-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.firstPlace / maxValue) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {item.uniqueYears} {item.uniqueYears === 1 ? 'year' : 'years'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.categories.length > 3 ? (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {item.categories.length} categories
                          </span>
                        ) : (
                          item.categories.map((category) => (
                            <span
                              key={category}
                              className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            >
                              {category}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
