'use client'

import siteMetadata from '@/data/siteMetadata'
import { useEffect, useState } from 'react'
import smoothscroll from 'smoothscroll-polyfill'

const ScrollTopAndComment = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    smoothscroll.polyfill()
    const handleWindowScroll = () => {
      if (window.scrollY > 300) setShow(true)
      else setShow(false)
    }

    window.addEventListener('scroll', handleWindowScroll)
    return () => window.removeEventListener('scroll', handleWindowScroll)
  }, [])

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleScrollToComment = () => {
    const comment = document.getElementById('comment')
    if (comment) {
      comment.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div
      className={`fixed right-8 bottom-8 flex flex-col gap-3 ${
        show ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-300`}
    >
      {siteMetadata.comments?.provider && (
        <button
          aria-label="Scroll To Comments"
          onClick={handleScrollToComment}
          className="rounded-full bg-gray-200 p-2 text-gray-500 transition-all hover:bg-gray-300 hover:text-gray-700 hover:shadow-lg dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-300"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
      <button
        aria-label="Scroll To Top"
        onClick={handleScrollTop}
        className="rounded-full bg-gray-200 p-2 text-gray-500 transition-all hover:bg-gray-300 hover:text-gray-700 hover:shadow-lg dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-300"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}

export default ScrollTopAndComment
