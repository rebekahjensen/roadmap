import Map from './components/Map'
import './App.css'

function App() {

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">ROUTE YOUR RUN</p>
        <h1>roadmap</h1>
        <p className="subtitle">
          Click points on the map, calculate your route distance, and save favorite runs.
        </p>
      </section>

      <Map />

    </main>
  )
}

export default App