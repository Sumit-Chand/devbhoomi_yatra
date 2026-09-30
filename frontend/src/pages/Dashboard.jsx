import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useApi } from '../api.js'

const COLORS = ['#1F3D36', '#E0A030', '#7FA6A0', '#B5533C']

export default function Dashboard() {
  const { loading, error, data } = useApi('/api/stats')
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-pine">Reports dashboard</h1>
      {loading && <p className="mt-6">Loading</p>}
      {error && <p className="mt-6 text-red-800">Could not load stats: {error}</p>}
      {data && data.total === 0 && (
        <p className="mt-6">No reports yet. <Link className="underline" to="/report">Send the first report</Link> and it will appear here.</p>
      )}
      {data && data.total > 0 && (
        <>
          <p className="mt-2 text-lg"><strong className="text-3xl font-display text-pine">{data.total}</strong> reports so far</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <section aria-label="Reports by category">
              <h2 className="font-semibold mb-2">Reports by type</h2>
              <div className="h-64 bg-white border border-pine/15 rounded-lg p-2">
                <ResponsiveContainer>
                  <BarChart data={data.byCategory}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Reports" fill="#1F3D36" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section aria-label="Reports by status">
              <h2 className="font-semibold mb-2">Reports by status</h2>
              <div className="h-64 bg-white border border-pine/15 rounded-lg p-2">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data.byStatus} dataKey="count" nameKey="name" outerRadius={80}>
                      {data.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
