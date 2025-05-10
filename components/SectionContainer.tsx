import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function SectionContainer({ children }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-4 transition-all duration-200 sm:px-6 md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
      {children}
    </section>
  )
}
