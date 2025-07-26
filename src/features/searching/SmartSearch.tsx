import { useState } from "react"
import { getCoords } from '../../shared/api/geocode'

interface SmartSearchProps {
	handleSearchedCoords: (coords: { lon: number; lat: number }) => void
}

export function SmartSearch({ handleSearchedCoords }: SmartSearchProps) {
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value)
    setError(null); 
  }

  async function getCoordinates() {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const coords = await getCoords(searchQuery);
      if (coords) {
        handleSearchedCoords(coords);
      } else {
        setError('Адрес не найден');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка при поиске');
    } finally {
      setIsLoading(false);
    }
  }

	return (
    <div className="w-3xs absolute top-5 left-5 z-10 text-black">
      <div className="relative">
        <input
          value={searchQuery}
          onChange={handleSearch}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              getCoordinates()
            }
          }}
          type="text"
          placeholder="Введите адрес и нажмите Enter"
          className="h-10 w-full p-2 border-1 rounded-md outline-none transition-colors 0.3s bg-[#F7F9FC] border-[#DEE0E3] focus:border-[#16D194]"
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-1 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
}

