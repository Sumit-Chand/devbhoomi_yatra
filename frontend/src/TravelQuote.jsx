export default function TravelQuote({ children }) {
  return (
    <aside className="travel-quote" aria-label="A thought for the journey">
      <span className="travel-quote__mark" aria-hidden="true">“</span>
      <p>{children}</p>
    </aside>
  )
}
