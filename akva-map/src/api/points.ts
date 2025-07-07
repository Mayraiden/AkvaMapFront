// API-клиент для работы с точками (points)
// Здесь предполагается, что backend доступен по адресу http://localhost:3000

export interface PointDTO {
	id: number
	contractor: { name: string }
	address: { fullAddress: string; latitude: string; longitude: string }
	lastService: string
	nextService: string
	deviceCount: number
}

const API_URL = 'http://localhost:3000'

export async function getPoints(): Promise<PointDTO[]> {
	const res = await fetch(`${API_URL}/contractor-addresses`, {
		method: 'GET',
	})
	if (!res.ok) throw new Error('Ошибка загрузки точек')
	return res.json()
}

export async function addPoint(point: Omit<PointDTO, 'id'>): Promise<PointDTO> {
	const res = await fetch(`${API_URL}/contractor-addresses`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(point),
	})
	if (!res.ok) throw new Error('Ошибка добавления точки')
	return res.json()
}

export async function deletePoint(id: number): Promise<void> {
	const res = await fetch(`${API_URL}/contractor-addresses/${id}`, {
		method: 'DELETE',
	})
	if (!res.ok) throw new Error('Ошибка удаления точки')
}
