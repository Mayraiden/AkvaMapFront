import { Map, Marker } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useState } from 'react'
import { SmartSearch } from '../searching/SmartSearch'
import type { ICoordinates } from '../../shared/api/geocode'

export function AkvaMap() {
	const [marker, setMarker] = useState<ICoordinates | null>(null)
	const [viewState, setViewState] = useState({
		longitude: 37.6151,
		latitude: 55.7569,
		zoom: 10,
	})

	function handleSearchedCoords(coords: ICoordinates) {
		setMarker(coords)
		setViewState({
			longitude: coords.lon,
			latitude: coords.lat,
			zoom: 16,
		})
	}

	return (
		<div className="relative h-full w-full">
			<Map
				mapLib={maplibregl}
				mapStyle="https://api.maptiler.com/maps/01982e2e-6966-7f91-92e7-e4b34e1c711c/style.json?key=shOTfMjg9NtFhrfS0Ufh"
				style={{ width: '100%', height: '100%' }}
				dragPan={true}
				touchZoomRotate={true}
				scrollZoom={true}
				doubleClickZoom={true}
				keyboard={true}
				{...viewState}
				onMove={(evt) => setViewState(evt.viewState)}
			>
				{marker && (
					<Marker longitude={marker.lon} latitude={marker.lat}>
						<div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
					</Marker>
				)}
			</Map>
			<SmartSearch handleSearchedCoords={handleSearchedCoords} />
			<div className="fixed top-0 right-0 z-90 w-1/2 h-full bg-self flex items-center justify-center">
				hi
			</div>
		</div>
	)
}
