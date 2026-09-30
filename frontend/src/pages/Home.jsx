import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <section className="bg-pine text-snow overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 pt-16">
          <h1 className="text-4xl sm:text-6xl font-bold max-w-2xl leading-tight">Walk lightly through the land of the gods.</h1>
          <p className="mt-4 max-w-xl text-lg text-snow/85">Plan trips across Garhwal and Kumaon, stay with local hosts, and tell us when a trail or road needs attention.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/destinations" className="bg-marigold text-ink font-semibold px-5 py-3 rounded-md">Browse destinations</Link>
            <Link to="/report" className="border border-snow/60 px-5 py-3 rounded-md hover:bg-white/10">Report an issue</Link>
          </div>
        </div>
        <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="w-full h-28 sm:h-40 mt-8 block" aria-hidden="true">
          <path d="M0 160V110l120-50 90 40 130-80 110 70 90-30 140-60 120 90 100-40 140-50 90 60 70-20v130z" fill="#DCE9EC" opacity=".25" />
          <path d="M0 160V130l160-40 100 30 140-70 120 60 150-50 130 70 110-30 150-40 140 60v70z" fill="#F7F8F6" />
        </svg>
      </section>
      <section className="max-w-5xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-3">
        {[
          ['Choose the season', 'Every sample destination lists the months when it is at its best, so you avoid crowds and closed passes.'],
          ['Stay local', 'Prefer homestays and village guides so tourism income stays in the hills.'],
          ['Report problems', 'Landslides, litter and unsafe trails can be logged in under a minute.'],
        ].map(([t, d]) => (
          <div key={t}><h2 className="text-xl font-semibold text-pine">{t}</h2><p className="mt-2 max-w-sm">{d}</p></div>
        ))}
      </section>
    </>
  )
}
