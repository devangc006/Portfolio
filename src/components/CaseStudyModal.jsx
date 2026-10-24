import React, { useEffect } from 'react'
import Button from './Button'

export default function CaseStudyModal({ caseStudyId, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!caseStudyId) return null

  const isOpswat = caseStudyId === 'opswat'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[var(--background-bg-1)] border border-[var(--background-stroke-1)] rounded-lg p-6 sm:p-10 my-auto text-white shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[var(--background-stroke-1)] pb-6 mb-8">
          <div>
            <span className="font-heading text-xs uppercase tracking-widest text-[var(--primary-green-neon)]">
              Case Study
            </span>
            <h1 className="font-heading text-3xl sm:text-5xl font-bold uppercase mt-1">
              {isOpswat ? 'OPSWAT Enterprise Suite' : 'Ronin Market — Sky Mavis'}
            </h1>
          </div>
          <Button onClick={onClose} className="h-10 px-5">
            Close
          </Button>
        </div>

        {/* Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-[var(--background-bg-2)] p-4 rounded border border-[var(--background-stroke-1)] mb-10 font-mono text-xs">
          <div>
            <span className="block text-[var(--text-grey-1)] uppercase">Role</span>
            <span className="font-medium text-white">{isOpswat ? 'Senior Product Designer' : 'Product Designer'}</span>
          </div>
          <div>
            <span className="block text-[var(--text-grey-1)] uppercase">Dates</span>
            <span className="font-medium text-white">{isOpswat ? '2025 - Jun 2026' : 'Jun 2024 - Mar 2025'}</span>
          </div>
          <div>
            <span className="block text-[var(--text-grey-1)] uppercase">Focus</span>
            <span className="font-medium text-white">{isOpswat ? 'Cybersecurity Systems' : 'NFT & Web3 Trading'}</span>
          </div>
          <div>
            <span className="block text-[var(--text-grey-1)] uppercase">Location</span>
            <span className="font-medium text-white">Ho Chi Minh City, VN</span>
          </div>
        </div>

        {/* Content Body */}
        {isOpswat ? (
          <div className="space-y-8 font-sans text-sm sm:text-base text-[var(--text-white-grey)] leading-relaxed">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white uppercase tracking-wider mb-3">
                Overview
              </h2>
              <p>
                At OPSWAT, a critical-infrastructure cybersecurity company, I worked as a product designer across four enterprise products — My OPSWAT, Central Management, MetaDefender Drive, and Industrial Firewall — designing complex, technical workflows into interfaces that security and operations teams can rely on every day.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-white uppercase tracking-wider mb-3">
                The Context
              </h2>
              <p>
                OPSWAT secures the files, devices, and data transfers that move into the world's most critical networks — energy, manufacturing, defense, and other operational-technology environments. Designing for this space means designing for technical users making high-stakes decisions, often across distributed, on-premises, and even fully air-gapped sites.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-5 bg-black/40 border border-[var(--background-stroke-1)] rounded">
                <span className="font-heading font-bold text-[var(--primary-green-neon)]">01. My OPSWAT</span>
                <p className="mt-2 text-xs sm:text-sm">Unified customer portal for license management, downloads, and role-based access.</p>
              </div>
              <div className="p-5 bg-black/40 border border-[var(--background-stroke-1)] rounded">
                <span className="font-heading font-bold text-[var(--primary-green-neon)]">02. Central Management</span>
                <p className="mt-2 text-xs sm:text-sm">Centralized console for managing MetaDefender instances across cloud and air-gapped sites.</p>
              </div>
              <div className="p-5 bg-black/40 border border-[var(--background-stroke-1)] rounded">
                <span className="font-heading font-bold text-[var(--primary-green-neon)]">03. MetaDefender Drive</span>
                <p className="mt-2 text-xs sm:text-sm">Portable bare-metal scanning device inspecting laptops before boot.</p>
              </div>
              <div className="p-5 bg-black/40 border border-[var(--background-stroke-1)] rounded">
                <span className="font-heading font-bold text-[var(--primary-green-neon)]">04. Industrial Firewall</span>
                <p className="mt-2 text-xs sm:text-sm">Ruggedized firewall for OT networks protecting industrial control systems.</p>
              </div>
            </div>

            <div className="pt-6">
              <h2 className="font-heading text-2xl font-bold text-white uppercase tracking-wider mb-4">
                Selected Screens & System Artifacts
              </h2>
              <img
                src="/images/work/case-study-opswat.webp"
                alt="OPSWAT Enterprise Interface"
                className="w-full rounded border border-[var(--background-stroke-1)]"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8 font-sans text-sm sm:text-base text-[var(--text-white-grey)] leading-relaxed">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white uppercase tracking-wider mb-3">
                Designing a Better Trading Experience for the Ronin Ecosystem
              </h2>
              <p>
                From June 2024 to March 2025, I worked as a Product Designer on Mavis Market at Sky Mavis, later rebranded as Ronin Market. What started as a focus on visual design and user flows gradually evolved into a much broader product design role — working across research, competitive analysis, UX flows, UI design, technical constraints, developer collaboration, and product iteration.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-white uppercase tracking-wider mb-3">
                Core Contributions
              </h2>
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Add to Cart', 'Sweep', 'Bulk Buy', 'Presale Ticket', 'Global Search',
                  'Verified Badge', 'Credit-card checkout via Transak', 'Collection Offer for ERC-721',
                  'Trait Offer', 'Trading Contest', 'Compact / List View', 'Collection Detail Revamp'
                ].map((feat) => (
                  <span key={feat} className="px-3 py-1 bg-black/50 border border-[var(--background-stroke-1)] text-xs font-mono text-[var(--primary-green-neon)] rounded">
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <h2 className="font-heading text-2xl font-bold text-white uppercase tracking-wider mb-4">
                Marketplace Architecture & UI Audit
              </h2>
              <img
                src="/images/work/case-study-skymavis.webp"
                alt="Sky Mavis Ronin Market UI"
                className="w-full rounded border border-[var(--background-stroke-1)]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
