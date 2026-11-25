import React, { useState } from 'react'
import ArrowIcon from './ArrowIcon'
import { WORK_ITEMS } from './SelectedWork'
import '../styles/works-page.css'

const VISIBLE_ITEMS = 4

function formatIndex(index) {
  return String(index + 1).padStart(2, '0')
}

export default function WorksPage({ onOpenCaseStudy }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const visibleItems = Array.from({ length: VISIBLE_ITEMS }, (_, offset) => (
    WORK_ITEMS[(activeIndex + offset) % WORK_ITEMS.length]
  ))

  const move = (direction) => {
    setActiveIndex((current) => (
      (current + direction + WORK_ITEMS.length) % WORK_ITEMS.length
    ))
  }

  return (
    <section className="works-page">
      <div className="works-page__atmosphere" aria-hidden="true">
        <span className="works-page__glow works-page__glow--one" />
        <span className="works-page__glow works-page__glow--two" />
        <span className="works-page__grid" />
      </div>

      <div className="works-page__content">
        <header className="works-page__header">
          <div className="works-page__heading">
            <h1 className="works-page__title">
              Work<span> that moves</span>
              <span className="works-page__title-mark">.</span>
            </h1>
          </div>
          <p className="works-page__intro">
            A few things I’ve helped bring to life — across product, web, and app design.
          </p>
        </header>

        <div className="works-page__showcase" aria-label="Featured projects">
          {visibleItems.map((item, offset) => {
            const isCaseStudy = item.tag === 'Case Study'
            const isExternal = item.href.startsWith('http')

            const handleClick = (event) => {
              if (!isCaseStudy) return
              event.preventDefault()
              onOpenCaseStudy(item.id)
            }

            return (
              <article
                key={`${activeIndex}-${item.id}`}
                className="works-card"
                style={{ '--card-order': offset }}
              >
                <a
                  href={item.href}
                  onClick={handleClick}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="works-card__link group"
                  data-sfx="true"
                >
                  <div className="works-card__image-wrap">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="works-card__image"
                    />
                    <span className="works-card__index">
                      {formatIndex((activeIndex + offset) % WORK_ITEMS.length)}
                    </span>
                    <span className="works-card__arrow" aria-hidden="true">
                      <ArrowIcon />
                    </span>
                  </div>
                  <div className="works-card__details">
                    <div>
                      <span className="works-card__category">{item.tag}</span>
                      <h2 className="works-card__title">{item.title}</h2>
                    </div>
                    {item.year && <span className="works-card__year">{item.year}</span>}
                  </div>
                </a>
              </article>
            )
          })}
        </div>

        <div className="works-page__controls">
          <span className="works-page__count">
            {formatIndex(activeIndex)} <span>/</span> {formatIndex(WORK_ITEMS.length)}
          </span>
          <div className="works-page__progress" aria-hidden="true">
            <span style={{ width: `${((activeIndex + 1) / WORK_ITEMS.length) * 100}%` }} />
          </div>
          <div className="works-page__buttons">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous projects"
              className="works-page__button works-page__button--previous"
            >
              <ArrowIcon />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next projects"
              className="works-page__button"
            >
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
