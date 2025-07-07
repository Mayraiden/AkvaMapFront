import { Forms } from './comonents/Forms'
import { Header } from './comonents/Header'
import { Map } from './comonents/Map'
import Splitter, { SplitDirection } from '@devbookhq/splitter'
import { useState, useRef, useEffect } from 'react'
import { Map as LeafletMap } from 'leaflet'
import { getPoints, deletePoint as apiDeletePoint } from './api/points'

function App() {
	// Тип точки
	type Point = {
		id: string
		position: [number, number]
		company: string
		deviceCount: number
		address: string
		lastService: string
		nextService: string
	}

	const [points, setPoints] = useState<Point[]>([])
	const [selectedPosition, setSelectedPosition] = useState<
		[number, number] | null
	>(null)

	const mapRef = useRef<LeafletMap | null>(null)

	useEffect(() => {
		// Загрузка точек с backend
		getPoints()
			.then((data) => {
				// Преобразуем данные с сервера к формату Point
				const mapped = data.map((item) => ({
					id: item.id.toString(),
					position: [
						Number(item.address.latitude),
						Number(item.address.longitude),
					] as [number, number],
					company: item.contractor.name,
					deviceCount: item.deviceCount,
					address: item.address.fullAddress,
					lastService: item.lastService,
					nextService: item.nextService,
				}))
				setPoints(mapped)
			})
			.catch((e) => {
				console.error('Ошибка загрузки точек', e)
			})
	}, [])

	const flyToPosition = (lat: number, lng: number) => {
		if (mapRef.current) {
			mapRef.current.flyTo([lat, lng], 17)
		}
	}

	const onDeletePoint = async (id: string) => {
		try {
			await apiDeletePoint(Number(id))
			setPoints(points.filter((p) => p.id !== id))
		} catch (e) {
			console.error('Ошибка удаления точки', e)
		}
	}

	return (
		<div className="py-2 h-screen w-screen bg-black">
			<div className="w-full h-full flex flex-col px-4 pb-2">
				<Header />
				<div className="w-full flex-1 flex gap-2">
					{' '}
					<Splitter
						direction={SplitDirection.Horizontal}
						initialSizes={[50, 50]}
					>
						<div className="h-full min-w-[600px]">
							{' '}
							<Map
								points={points}
								setSelectedPosition={setSelectedPosition}
								onDeletePoint={onDeletePoint}
								mapRef={mapRef}
								selectedPosition={selectedPosition}
							/>
						</div>
						<div className="h-full min-w-[400px]">
							<Forms
								selectedPosition={selectedPosition}
								setSelectedPosition={setSelectedPosition}
								setPoints={setPoints}
								points={points}
								flyToPosition={flyToPosition}
							/>
						</div>
					</Splitter>
				</div>
			</div>
		</div>
	)
}

export default App
