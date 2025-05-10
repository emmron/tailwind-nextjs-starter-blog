import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from '.contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'

const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`
const discussUrl = (path) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`${siteMetadata.siteUrl}/${path}`)}`

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, tags } = content
  const basePath = path.split('/')[0]

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article className="divide-y divide-gray-200 dark:divide-gray-700">
        <header className="pt-6 pb-6 sm:pt-8 sm:pb-8">
          <div className="space-y-3 text-center sm:space-y-4">
            <dl className="space-y-1">
              <div>
                <dt className="sr-only">Published on</dt>
                <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                  <time dateTime={date}>
                    {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                  </time>
                </dd>
              </div>
            </dl>
            <div>
              <PageTitle>{title}</PageTitle>
            </div>

            {/* Tags at top for mobile */}
            {tags && (
              <div className="flex flex-wrap justify-center pt-2 sm:hidden">
                {tags.map((tag) => (
                  <Tag key={tag} text={tag} />
                ))}
              </div>
            )}
          </div>
        </header>
        <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 md:grid md:grid-cols-4 md:gap-x-6 md:divide-y-0 dark:divide-gray-700">
          <dl className="pt-4 pb-6 md:border-b md:border-gray-200 md:pt-6 md:pt-11 md:pb-10 md:dark:border-gray-700">
            <dt className="sr-only">Authors</dt>
            <dd>
              <ul className="flex flex-wrap justify-center gap-4 sm:space-x-12 md:block md:space-y-6 md:space-x-0">
                {authorDetails.map((author) => (
                  <li
                    className="flex items-center space-x-3 transition-transform duration-200 hover:scale-105"
                    key={author.name}
                  >
                    {author.avatar && (
                      <Image
                        src={author.avatar}
                        width={42}
                        height={42}
                        alt="avatar"
                        className="h-9 w-9 rounded-full md:h-10 md:w-10"
                      />
                    )}
                    <dl className="text-sm leading-5 font-medium whitespace-nowrap">
                      <dt className="sr-only">Name</dt>
                      <dd className="text-gray-900 dark:text-gray-100">{author.name}</dd>
                      <dt className="sr-only">Twitter</dt>
                      <dd>
                        {author.twitter && (
                          <Link
                            href={author.twitter}
                            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            {author.twitter
                              .replace('https://twitter.com/', '@')
                              .replace('https://x.com/', '@')}
                          </Link>
                        )}
                      </dd>
                    </dl>
                  </li>
                ))}
              </ul>
            </dd>
          </dl>
          <div className="divide-y divide-gray-200 md:col-span-3 md:row-span-2 md:pb-0 dark:divide-gray-700">
            <div className="prose dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline prose-img:rounded-md prose-img:shadow-lg max-w-none pt-6 pb-6 md:pt-10 md:pb-8">
              {children}
            </div>
            <div className="flex flex-col space-y-3 pt-4 pb-4 text-sm text-gray-700 sm:flex-row sm:justify-between sm:space-y-0 md:pt-6 md:pb-6 dark:text-gray-300">
              <Link
                href={discussUrl(path)}
                rel="nofollow"
                className="hover:text-primary-500 transition-colors"
              >
                Discuss on Twitter
              </Link>
              <Link href={editUrl(filePath)} className="hover:text-primary-500 transition-colors">
                View on GitHub
              </Link>
            </div>
            {siteMetadata.comments && (
              <div
                className="pt-4 pb-4 text-center text-gray-700 md:pt-6 md:pb-6 dark:text-gray-300"
                id="comment"
              >
                <Comments slug={slug} />
              </div>
            )}
          </div>
          <footer>
            <div className="divide-gray-200 text-sm leading-5 font-medium md:col-start-1 md:row-start-2 md:divide-y dark:divide-gray-700">
              {tags && (
                <div className="hidden py-4 sm:block md:py-8">
                  <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Tags
                  </h2>
                  <div className="mt-2 flex flex-wrap">
                    {tags.map((tag) => (
                      <Tag key={tag} text={tag} />
                    ))}
                  </div>
                </div>
              )}
              {(next || prev) && (
                <div className="flex flex-col gap-4 py-4 sm:flex-row sm:justify-between xl:block xl:space-y-8 xl:py-8">
                  {prev && prev.path && (
                    <div className="mb-3 sm:mb-0">
                      <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        Previous Article
                      </h2>
                      <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mt-1">
                        <Link href={`/${prev.path}`}>{prev.title}</Link>
                      </div>
                    </div>
                  )}
                  {next && next.path && (
                    <div>
                      <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        Next Article
                      </h2>
                      <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mt-1">
                        <Link href={`/${next.path}`}>{next.title}</Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="pt-4 md:pt-8">
              <Link
                href={`/${basePath}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 inline-flex items-center transition-colors"
                aria-label="Back to the blog"
              >
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to the blog
              </Link>
            </div>
          </footer>
        </div>
      </article>
    </SectionContainer>
  )
}
