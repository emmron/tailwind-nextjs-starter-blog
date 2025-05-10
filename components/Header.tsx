'use client'

import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import { motion } from 'framer-motion'

const Header = () => {
  let headerClass =
    'flex items-center w-full bg-white dark:bg-gray-950 justify-between py-4 px-4 sm:px-6'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50 backdrop-blur-lg bg-white/90 dark:bg-gray-950/90 shadow-md'
  }

  return (
    <header className={headerClass}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/"
          aria-label={siteMetadata.headerTitle}
          className="transition-transform duration-200 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div className="mr-3">
              <Logo />
            </div>
            {typeof siteMetadata.headerTitle === 'string' ? (
              <div className="hidden h-6 text-2xl font-bold text-gray-900 sm:block dark:text-white">
                {siteMetadata.headerTitle}
              </div>
            ) : (
              siteMetadata.headerTitle
            )}
          </div>
        </Link>
      </motion.div>

      <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
        <nav className="no-scrollbar hidden max-w-40 items-center gap-x-6 overflow-x-auto sm:flex md:max-w-72 lg:max-w-96">
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="hover:text-primary-500 dark:hover:text-primary-400 after:bg-primary-500 relative font-medium text-gray-700 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:transition-all hover:after:w-full dark:text-gray-300"
                >
                  {link.title}
                </Link>
              </motion.div>
            ))}
        </nav>
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SearchButton />
          <ThemeSwitch />
          <MobileNav />
        </motion.div>
      </div>
    </header>
  )
}

export default Header
