import {
	MapContainer,
	TileLayer,
	useMapEvent,
	Marker,
	Popup,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect } from 'react'
import type { Map as LeafletMap } from 'leaflet'

L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
	iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

// Тип точки совпадает с App
export type Point = {
	id: string
	position: [number, number]
	company: string
	deviceCount: number
	address: string
	lastService: string
	nextService: string
}

// Пропсы
interface MapProps {
	points: Point[]
	setSelectedPosition: Dispatch<SetStateAction<[number, number] | null>>
	onDeletePoint: (id: string) => void
	mapRef: React.MutableRefObject<LeafletMap | null>
	selectedPosition?: [number, number] | null
}

function MapClickHandler({
	setSelectedPosition,
}: {
	setSelectedPosition: Dispatch<SetStateAction<[number, number] | null>>
}) {
	useMapEvent('click', (e) => {
		setSelectedPosition([e.latlng.lat, e.latlng.lng])
	})
	return null
}

const markerIcon = new L.Icon({
	iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
	iconRetinaUrl:
		'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
})

export const Map = ({
	points,
	setSelectedPosition,
	onDeletePoint,
	mapRef,
	selectedPosition,
}: MapProps) => {
	// Получаем ссылку на карту
	function SetMapRef() {
		useMapEvent('load', (e) => {
			mapRef.current = e.target
		})
		useMapEvent('moveend', (e) => {
			mapRef.current = e.target
		})
		return null
	}

	return (
		<div className="h-full">
			<div className="w-full h-full">
				<MapContainer
					center={[55.75, 37.62]}
					zoom={11}
					className="h-full w-full rounded-2xl"
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					/>
					<MapClickHandler setSelectedPosition={setSelectedPosition} />
					<SetMapRef />
					{points.map((point) => (
						<Marker key={point.id} position={point.position} icon={markerIcon}>
							<Popup>
								<strong>{point.company}</strong>
								<br />
								{point.address}
								<br />
								<button
									className="mt-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
									onClick={() => onDeletePoint(point.id)}
								>
									Удалить
								</button>
							</Popup>
						</Marker>
					))}
					{/* Временный маркер для выбранной позиции, если она не совпадает с точками */}
					{selectedPosition &&
						!points.some(
							(p) =>
								p.position[0] === selectedPosition[0] &&
								p.position[1] === selectedPosition[1]
						) && (
							<Marker position={selectedPosition} icon={markerIcon}>
								<Popup>Выбранная точка</Popup>
							</Marker>
						)}
				</MapContainer>
			</div>
		</div>
	)
}
