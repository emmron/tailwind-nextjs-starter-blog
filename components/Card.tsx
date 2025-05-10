import Image from './Image'
import Link from './Link'
import { motion } from 'framer-motion'

const Card = ({ title, description, imgSrc, href }) => (
  <div className="md max-w-[544px] p-4 md:w-1/2">
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`${
        imgSrc && 'h-full'
      } group hover:border-primary-400 dark:hover:border-primary-500 overflow-hidden rounded-md border-2 border-gray-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-800`}
    >
      {imgSrc &&
        (href ? (
          <Link href={href} aria-label={`Link to ${title}`} className="block overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'tween', duration: 0.5 }}
              className="overflow-hidden"
            >
              <Image
                alt={title}
                src={imgSrc}
                className="aspect-video object-cover object-center md:h-36 lg:h-48"
                width={544}
                height={306}
              />
            </motion.div>
          </Link>
        ) : (
          <Image
            alt={title}
            src={imgSrc}
            className="aspect-video object-cover object-center md:h-36 lg:h-48"
            width={544}
            height={306}
          />
        ))}
      <div className="p-6">
        <h2 className="group-hover:text-primary-500 dark:group-hover:text-primary-400 mb-3 text-2xl leading-8 font-bold tracking-tight text-gray-900 transition-colors duration-200 dark:text-white">
          {href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p className="prose mb-4 max-w-none text-gray-600 dark:text-gray-300">{description}</p>
        {href && (
          <Link
            href={href}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 after:bg-primary-500 relative inline-flex items-center text-base leading-6 font-medium transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:transition-all hover:after:w-full"
            aria-label={`Learn more about ${title}`}
          >
            Learn more
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-1 h-4 w-4 transform transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        )}
      </div>
    </motion.div>
  </div>
)

export default Card
