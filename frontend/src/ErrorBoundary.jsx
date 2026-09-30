import { Component } from 'react'

// Shows the error on screen instead of a blank white page.
export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error(error, info) }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <h1>Something went wrong</h1>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#b00020' }}>{String(this.state.error?.message || this.state.error)}</pre>
        <button onClick={() => location.reload()}>Reload</button>
      </div>
    )
  }
}
