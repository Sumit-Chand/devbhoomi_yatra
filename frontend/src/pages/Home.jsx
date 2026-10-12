import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../api.js'

const fallbackPhoto = {
  thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Joshimath_auli_Badrinath.jpg',
  pageUrl: 'https://commons.wikimedia.org/wiki/File:Joshimath_auli_Badrinath.jpg',
  artist: 'Bibek Raj Pandeya',
  license: 'CC BY-SA 4.0',
}

export default function Home() {
  const { data: galleryData } = useApi('/api/places/auli/images')
  const photos = galleryData?.images?.length ? galleryData.images : [fallbackPhoto]
  const [photoIndex, setPhotoIndex] = useState(0)
  const cover = photos[photoIndex % photos.length]

  useEffect(() => {
    if (photos.length < 2) return undefined
    const rotation = window.setInterval(() => {
      setPhotoIndex(current => (current + 1) % photos.length)
    }, 120_000)
    return () => window.clearInterval(rotation)
  }, [photos.length])

  return (
    <>
      <section className="scenic-hero text-snow">
        <img key={cover.pageUrl} className="scenic-hero__photo" src={cover.thumbnailUrl} alt="" aria-hidden="true" />
        <div className="scenic-hero__inner">
          <span className="scenic-hero__eyebrow">Uttarakhand · Garhwal &amp; Kumaon</span>
          <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.05] sm:text-7xl">Find your stillness in the Himalaya.</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">Discover sacred trails, quiet mountain towns and the living culture of Devbhoomi.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/destinations" className="hero-action hero-action--primary">Explore destinations <span aria-hidden="true">→</span></Link>
            <Link to="/alerts" className="hero-action hero-action--secondary">Check travel updates</Link>
          </div>
        </div>
        <div className="scenic-hero__credit">
          {photos.length > 1 && <span>Scenery changes every 2 minutes · </span>}
          <a href={cover.pageUrl} target="_blank" rel="noreferrer">Photo: {cover.artist} · {cover.license}</a>
        </div>
      </section>
      <section className="home-intro">
        <p className="home-intro__kicker">A gentler way to travel</p>
        <h2 className="mt-2 text-3xl font-bold text-pine sm:text-4xl">Rooted in nature. Guided by spirit.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-ink/70">Plan thoughtfully, explore respectfully, and let the mountains set the pace.</p>
      </section>
      <section className="home-features">
        {[
          ['01', 'Choose your path', 'Explore sacred places, forest walks and high Himalayan views across all 13 districts.', '/destinations', 'Explore places'],
          ['02', 'Travel mindfully', 'Check district weather and public alerts before setting out into the mountains.', '/alerts', 'View travel updates'],
          ['03', 'Care for the hills', 'Share a road, trail or cleanliness concern to help fellow travellers and local communities.', '/report', 'Report an issue'],
        ].map(([number, title, description, path, action]) => (
          <article key={number} className="home-feature">
            <span className="home-feature__number">{number}</span>
            <h3 className="mt-5 text-xl font-semibold text-pine">{title}</h3>
            <p className="mt-2 leading-relaxed text-ink/70">{description}</p>
            <Link className="home-feature__link" to={path}>
              {action} <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </section>
      <section className="home-quote">
        <span aria-hidden="true" className="home-quote__mark">“</span>
        <p>Leave only footprints. Take home a little more peace.</p>
        <span className="home-quote__caption">Travel gently through Devbhoomi</span>
      </section>
    </>
  )
}
