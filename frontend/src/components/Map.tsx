import { useState } from 'react'
import { MapContainer, TileLayer, useMapEvents, Marker, Polyline } from 'react-leaflet'

type RoutePoint = [number, number]

type SavedRoute = {
  name: string
  distance: number
  points: RoutePoint[]
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (position: RoutePoint) => void
}) {
  useMapEvents({
    click(event) {
      const clickedPoint: RoutePoint = [event.latlng.lat, event.latlng.lng]
      console.log(clickedPoint)
      onMapClick(clickedPoint)
    },
  })

  return null
}

function calculateDistanceMiles(points: RoutePoint[]) {
  if (points.length < 2) return 0

  let totalMiles = 0

  for (let i = 1; i < points.length; i++) {
    const [lat1, lon1] = points[i - 1]
    const [lat2, lon2] = points[i]

    const milesPerDegreeLat = 69
    const avgLat = ((lat1 + lat2) / 2) * (Math.PI / 180)
    const milesPerDegreeLon = 69 * Math.cos(avgLat)

    const deltaLatMiles = (lat2 - lat1) * milesPerDegreeLat
    const deltaLonMiles = (lon2 - lon1) * milesPerDegreeLon

    totalMiles += Math.sqrt(deltaLatMiles ** 2 + deltaLonMiles ** 2)
  }

  return totalMiles
}

function Map() {
  const [points, setPoints] = useState<RoutePoint[]>([])
  const [routeName, setRouteName] = useState('')
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([])
  const [undonePoints, setUndonePoints] = useState<RoutePoint[]>([])

  const distanceMiles = calculateDistanceMiles(points)

  function addPoint(newPoint: RoutePoint) {
    setPoints([...points, newPoint])
    setUndonePoints([])
  }

  function undoPoint() {
    if (points.length === 0) return

    const lastPoint = points[points.length - 1]
    setPoints(points.slice(0, -1))
    setUndonePoints([...undonePoints, lastPoint])
  }

  function redoPoint() {
    if (undonePoints.length === 0) return

    const pointToRestore = undonePoints[undonePoints.length - 1]
    setPoints([...points, pointToRestore])
    setUndonePoints(undonePoints.slice(0, -1))
  }

  function clearRoute() {
    setPoints([])
    setUndonePoints([])
  }

  function saveRoute() { //save route!
    if (points.length < 2 || routeName.trim() === '') return

    const newRoute: SavedRoute = {
      name: routeName.trim(),
      distance: distanceMiles,
      points: points,
    }

    setSavedRoutes([...savedRoutes, newRoute])
    setRouteName('')
    setPoints([])
    setUndonePoints([])
  }

  function loadRoute(route: SavedRoute) {
    setPoints(route.points)
    setRouteName('')
    setUndonePoints([])
  }

  return (
    <section className="card">
      <h2>Route Builder</h2>
      <p>Click the map to build a running route.</p>

      <MapContainer
        center={[37.6775, -113.0619]}
        zoom={13}
        style={{ height: '340px', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={addPoint} />

        {points.map((point, index) => (
          <Marker key={index} position={point} />
        ))}

        {points.length > 1 && <Polyline positions={points} />}
      </MapContainer>

      <p>Route points: {points.length}</p>
      <p>Distance: {distanceMiles.toFixed(2)} miles</p>

      <input
        type="text"
        placeholder="Route name"
        value={routeName}
        onChange={(event) => setRouteName(event.target.value)}
      />

      <button onClick={saveRoute}>Save Route</button>
      <button onClick={undoPoint}>Undo Point</button>
      <button onClick={redoPoint}>Redo Point</button>
      <button onClick={clearRoute}>Clear Route</button>

      <h3>Saved Routes</h3>

      {savedRoutes.length === 0 ? (
        <p>No saved routes yet.</p>
      ) : (
        <ul>
          {savedRoutes.map((route, index) => (
            <li key={index}>
              <button onClick={() => loadRoute(route)}>
                {route.name} — {route.distance.toFixed(2)} miles
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Map