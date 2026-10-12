import { Link } from 'react-router-dom'

const cover = {
  thumbnailUrl: '/dashboard-mountain.png',
}

const features = [
  {
    number: '01',
    title: 'Choose your path',
    description: 'Explore sacred places, forest walks and high Himalayan views across all 13 districts.',
    path: '/destinations',
    action: 'Explore places',
    image: cover.thumbnailUrl,
    imageAlt: 'Snow-covered Himalayan peaks above the natural ridges of Uttarakhand',
  },
  {
    number: '02',
    title: 'Travel mindfully',
    description: 'Check district weather and public alerts before setting out into the mountains.',
    path: '/alerts',
    action: 'View travel updates',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Symmetrical_Himalayas.jpg',
    imageAlt: 'Himalayan peaks reflected in a quiet mountain lake at dusk',
    artist: 'Shubhang99',
    pageUrl: 'https://commons.wikimedia.org/wiki/File:Symmetrical_Himalayas.jpg',
  },
  {
    number: '03',
    title: 'Care for the hills',
    description: 'Share a road, trail or cleanliness concern to help fellow travellers and local communities.',
    path: '/report',
    action: 'Report an issue',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Valley_of_Flowers_National_Park_05.JPG/1280px-Valley_of_Flowers_National_Park_05.JPG',
    imageAlt: 'A clear stream winding through the green landscape of the Valley of Flowers',
    artist: 'Guptaele',
    pageUrl: 'https://commons.wikimedia.org/wiki/File:Valley_of_Flowers_National_Park_05.JPG',
  },
]

export default function Home() {
  return (
    <>
      <section className="scenic-hero text-snow">
        <img className="scenic-hero__photo" src={cover.thumbnailUrl} alt="" aria-hidden="true" />
        <div className="scenic-hero__inner">
          <span className="scenic-hero__eyebrow">Uttarakhand · Garhwal &amp; Kumaon</span>
          <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.05] sm:text-7xl">Find your stillness in the Himalaya.</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">Discover sacred trails, quiet mountain towns and the living culture of Devbhoomi.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/destinations" className="hero-action hero-action--primary">Explore destinations <span aria-hidden="true">→</span></Link>
            <Link to="/alerts" className="hero-action hero-action--secondary">Check travel updates</Link>
          </div>
        </div>
      </section>
      <section className="home-intro">
        <p className="home-intro__kicker">A gentler way to travel</p>
        <h2 className="mt-2 text-3xl font-bold text-pine sm:text-4xl">Rooted in nature. Guided by spirit.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-ink/70">Plan thoughtfully, explore respectfully, and let the mountains set the pace.</p>
      </section>
      <section className="home-features">
        {features.map(feature => (
          <article key={feature.number} className="home-feature">
            <div className="home-feature__image">
              <img src={feature.image} alt={feature.imageAlt} loading="lazy" decoding="async" />
              <span className="home-feature__number">{feature.number}</span>
              {feature.artist && feature.pageUrl && <a
                className="home-feature__credit photo-credit"
                href={feature.pageUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Photo by ${feature.artist}, licensed CC BY-SA 4.0`}
                title={`Photo by ${feature.artist} · CC BY-SA 4.0`}
              >
                Photo: {feature.artist} · CC BY-SA 4.0
              </a>}
            </div>
            <div className="home-feature__body">
              <h3 className="text-xl font-semibold text-pine">{feature.title}</h3>
              <p className="mt-2 leading-relaxed text-ink/70">{feature.description}</p>
              <Link className="home-feature__link" to={feature.path}>
                {feature.action} <span aria-hidden="true">→</span>
            </Link>
            </div>
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
