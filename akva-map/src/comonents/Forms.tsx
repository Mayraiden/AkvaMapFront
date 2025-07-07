import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Point } from './Map'
import { addPoint as apiAddPoint } from '../api/points'

interface FormsProps {
	selectedPosition: [number, number] | null
	setSelectedPosition: Dispatch<SetStateAction<[number, number] | null>>
	setPoints: Dispatch<SetStateAction<Point[]>>
	flyToPosition: (lat: number, lng: number) => void
}

export const Forms = ({
	selectedPosition,
	setSelectedPosition,
	setPoints,
	flyToPosition,
}: FormsProps) => {
	const [company, setCompany] = useState('')
	const [deviceCount, setDeviceCount] = useState('1')
	const [address, setAddress] = useState('')
	const [lastService, setLastService] = useState('')
	const [nextService, setNextService] = useState('')
	const [loadingAddress, setLoadingAddress] = useState(false)
	const [geocodeError, setGeocodeError] = useState('')
	const [geocodeLoading, setGeocodeLoading] = useState(false)
	const [addressFound, setAddressFound] = useState(false)
	const [loadingAdd, setLoadingAdd] = useState(false)
	const [addError, setAddError] = useState('')

	// Автозаполнение адреса по координатам
	useEffect(() => {
		if (selectedPosition) {
			setLoadingAddress(true)
			fetch(
				`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${selectedPosition[0]}&lon=${selectedPosition[1]}`
			)
				.then((res) => res.json())
				.then((data) => {
					const addr = data.address
					let formatted = ''
					if (addr) {
						if (addr.road && addr.house_number) {
							formatted = `${addr.road}, д.${addr.house_number}`
						} else if (addr.road) {
							formatted = addr.road
						} else if (addr.house_number) {
							formatted = `д.${addr.house_number}`
						}
					}
					if (!formatted) {
						formatted = data.display_name || ''
					}
					setAddress(formatted)
				})
				.finally(() => setLoadingAddress(false))
		} else {
			setAddress('')
		}
	}, [selectedPosition])

	const handleFindOnMap = async () => {
		if (!address) return
		setGeocodeError('')
		setGeocodeLoading(true)
		setAddressFound(false)
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}`
			)
			const data = await res.json()
			if (data && data.length > 0) {
				const result = data[0]
				const lat = parseFloat(result.lat)
				const lon = parseFloat(result.lon)
				setSelectedPosition([lat, lon])
				flyToPosition(lat, lon)
				setAddressFound(true)
				// Форматируем адрес как при обратном геокодировании
				if (result.address) {
					const addr = result.address
					let formatted = ''
					if (addr.road && addr.house_number) {
						formatted = `${addr.road}, д.${addr.house_number}`
					} else if (addr.road) {
						formatted = addr.road
					} else if (addr.house_number) {
						formatted = `д.${addr.house_number}`
					}
					if (!formatted) {
						formatted = result.display_name || ''
					}
					setAddress(formatted)
				}
			} else {
				setGeocodeError('Адрес не найден')
			}
		} catch {
			setGeocodeError('Ошибка поиска адреса')
		} finally {
			setGeocodeLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedPosition) return
		setLoadingAdd(true)
		setAddError('')
		try {
			const newPoint = {
				company,
				address,
				latitude: selectedPosition[0],
				longitude: selectedPosition[1],
				lastService,
				nextService,
				deviceCount: Number(deviceCount),
			}
			const created = await apiAddPoint(newPoint)
			setPoints((prev) => [
				...prev,
				{
					id: created.id.toString(),
					position: [created.latitude, created.longitude],
					company: created.company,
					deviceCount: created.deviceCount,
					address: created.address,
					lastService: created.lastService,
					nextService: created.nextService,
				},
			])
			// Сброс формы и выбранной позиции
			setCompany('')
			setDeviceCount('1')
			setAddress('')
			setLastService('')
			setNextService('')
			setSelectedPosition(null)
		} catch (e) {
			setAddError('Ошибка добавления точки')
		} finally {
			setLoadingAdd(false)
		}
	}

	return (
		<div className="h-full bg-emerald-100 rounded-2xl p-4 flex flex-col gap-4">
			<h2 className="text-lg font-bold mb-2">Добавить точку</h2>
			<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
				<label className="font-semibold">
					Название компании
					<input
						className="w-full p-1 rounded border"
						value={company}
						onChange={(e) => setCompany(e.target.value)}
						required
						disabled={!selectedPosition}
					/>
				</label>
				<label className="font-semibold flex flex-col gap-1">
					Количество аппаратов
					<input
						type="number"
						min={1}
						className="w-full p-1 rounded border"
						value={deviceCount}
						onChange={(e) => setDeviceCount(e.target.value)}
						required
						disabled={!selectedPosition}
					/>
				</label>
				<label className="font-semibold flex flex-col gap-1">
					Адрес
					<div className="flex gap-2 items-center">
						<input
							className="w-full p-1 rounded border"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							required
							disabled={loadingAddress || geocodeLoading}
						/>
						<button
							type="button"
							className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700 whitespace-nowrap"
							onClick={handleFindOnMap}
							disabled={geocodeLoading || !address}
						>
							{geocodeLoading ? 'Поиск...' : 'Найти на карте'}
						</button>
					</div>
					{loadingAddress && (
						<span className="text-xs text-gray-500">Определяем адрес...</span>
					)}
					{geocodeError && (
						<span className="text-xs text-red-500">{geocodeError}</span>
					)}
					{addressFound && !geocodeError && (
						<span className="text-xs text-green-600">Адрес найден</span>
					)}
				</label>
				<label className="font-semibold">
					Дата последнего ТО
					<input
						type="date"
						className="w-full p-1 rounded border"
						value={lastService}
						onChange={(e) => setLastService(e.target.value)}
						required
						disabled={!selectedPosition}
					/>
				</label>
				<label className="font-semibold">
					Дата следующего ТО
					<input
						type="date"
						className="w-full p-1 rounded border"
						value={nextService}
						onChange={(e) => setNextService(e.target.value)}
						required
						disabled={!selectedPosition}
					/>
				</label>
				<div className="flex gap-2 mt-2">
					<button
						type="submit"
						className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
						disabled={!selectedPosition || loadingAdd}
					>
						{loadingAdd ? 'Добавление...' : 'Добавить'}
					</button>
					<button
						type="button"
						className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
						onClick={() => setSelectedPosition(null)}
						disabled={!selectedPosition}
					>
						Отмена
					</button>
				</div>
				{!selectedPosition && (
					<div className="text-xs text-gray-500 mt-2">
						Выберите точку на карте или найдите адрес
					</div>
				)}
				{addError && <span className="text-xs text-red-500">{addError}</span>}
			</form>
		</div>
	)
}
