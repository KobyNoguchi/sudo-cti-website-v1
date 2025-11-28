import type { RansomwareAttack, RansomwareSeverity } from '@/types'

export const severityColors: Record<RansomwareSeverity, string> = {
  low: '#00ff41', // <$100K
  medium: '#ffd700', // $100K - $1M
  high: '#ff6b00', // $1M - $10M
  critical: '#ff0040', // >$10M
}

export const severityAltitudes: Record<RansomwareSeverity, number> = {
  low: 0.08,
  medium: 0.12,
  high: 0.16,
  critical: 0.2,
}

export const PLATFORM_MIN_YEAR = 2013
export const PLATFORM_MAX_YEAR = 2025

const createAttack = (
  id: number,
  organization: string,
  city: string,
  state: string,
  lat: number,
  lng: number,
  ransomAmount: number,
  date: string,
  ransomwareFamily: string,
  severity: RansomwareSeverity,
  attackerOrigin?: { lat: number; lng: number }
): RansomwareAttack => ({
  id,
  organization,
  city,
  state,
  lat,
  lng,
  ransomAmount,
  ransomDisplay: ransomAmount >= 1_000_000
    ? `$${(ransomAmount / 1_000_000).toFixed(1)}M`
    : `$${Math.round(ransomAmount / 1_000)}K`,
  date,
  ransomwareFamily,
  severity,
  attackerOrigin,
})

export const mockRansomwareData: RansomwareAttack[] = [
  createAttack(1, 'Northern Grid Cooperative', 'Minneapolis', 'MN', 44.9778, -93.265, 85000, '2013-05-06', 'CryptoLocker', 'low', { lat: 55.7558, lng: 37.6173 }),
  createAttack(2, 'Gulf Coast Utility', 'Houston', 'TX', 29.7604, -95.3698, 220000, '2014-09-18', 'TeslaCrypt', 'medium', { lat: 50.4501, lng: 30.5234 }),
  createAttack(3, 'Sierra Hydro', 'Reno', 'NV', 39.5296, -119.8138, 1400000, '2015-03-11', 'Locky', 'high', { lat: 55.6761, lng: 12.5683 }),
  createAttack(4, 'Great Lakes Power', 'Cleveland', 'OH', 41.4993, -81.6944, 3200000, '2016-07-22', 'Samas', 'high', { lat: 25.2854, lng: 51.531 }),
  createAttack(5, 'Atlantic Renewables', 'Boston', 'MA', 42.3601, -71.0589, 12500000, '2017-01-14', 'WannaCry', 'critical', { lat: 39.9042, lng: 116.4074 }),
  createAttack(6, 'Cascade Waterworks', 'Seattle', 'WA', 47.6062, -122.3321, 95000, '2017-11-03', 'BadRabbit', 'low', { lat: 60.1699, lng: 24.9384 }),
  createAttack(7, 'SunBelt LNG', 'New Orleans', 'LA', 29.9511, -90.0715, 670000, '2018-04-29', 'GandCrab', 'medium', { lat: 41.2995, lng: 69.2401 }),
  createAttack(8, 'Blue Ridge Pipeline', 'Charlotte', 'NC', 35.2271, -80.8431, 8700000, '2018-10-16', 'Ryuk', 'high', { lat: 55.858, lng: -4.259 }),
  createAttack(9, 'Heartland Wind', 'Des Moines', 'IA', 41.5868, -93.625, 430000, '2019-02-05', 'Sodinokibi', 'medium', { lat: 59.3293, lng: 18.0686 }),
  createAttack(10, 'Metro Transit Authority', 'Chicago', 'IL', 41.8781, -87.6298, 2100000, '2019-08-21', 'Maze', 'high', { lat: 40.4168, lng: -3.7038 }),
  createAttack(11, 'Copper State Power', 'Phoenix', 'AZ', 33.4484, -112.074, 60000, '2020-01-12', 'NetWalker', 'low', { lat: 43.6532, lng: -79.3832 }),
  createAttack(12, 'Hudson River Grid', 'Albany', 'NY', 42.6526, -73.7562, 5400000, '2020-05-30', 'REvil', 'high', { lat: 59.437, lng: 24.7536 }),
  createAttack(13, 'Great Plains Storage', 'Omaha', 'NE', 41.2565, -95.9345, 175000, '2020-11-09', 'Egregor', 'medium', { lat: 35.6762, lng: 139.6503 }),
  createAttack(14, 'Pacific Wave Energy', 'San Diego', 'CA', 32.7157, -117.1611, 15300000, '2021-03-18', 'DarkSide', 'critical', { lat: 55.9533, lng: -3.1883 }),
  createAttack(15, 'Rocky Mountain ICS', 'Denver', 'CO', 39.7392, -104.9903, 760000, '2021-07-02', 'Hive', 'medium', { lat: 23.1291, lng: 113.2644 }),
  createAttack(16, 'Bay Area Desalination', 'San Jose', 'CA', 37.3382, -121.8863, 9800000, '2021-12-14', 'Conti', 'high', { lat: 31.2304, lng: 121.4737 }),
  createAttack(17, 'Frontier Rail Logistics', 'Kansas City', 'MO', 39.0997, -94.5786, 420000, '2022-02-27', 'BlackMatter', 'medium', { lat: 41.9028, lng: 12.4964 }),
  createAttack(18, 'Evergreen Dams Authority', 'Portland', 'OR', 45.5051, -122.675, 1020000, '2022-06-10', 'AvosLocker', 'high', { lat: 52.52, lng: 13.405 }),
  createAttack(19, 'Tri-State Nuclear Cooperative', 'Knoxville', 'TN', 35.9606, -83.9207, 18800000, '2022-10-04', 'BlackCat', 'critical', { lat: 55.1644, lng: 61.4368 }),
  createAttack(20, 'Great Basin Water Authority', 'Salt Lake City', 'UT', 40.7608, -111.891, 135000, '2023-01-19', 'Royal', 'low', { lat: 45.4215, lng: -75.6972 }),
  createAttack(21, 'Lone Star Grid', 'Austin', 'TX', 30.2672, -97.7431, 3900000, '2023-05-08', 'LockBit', 'high', { lat: 53.9, lng: 27.5667 }),
  createAttack(22, 'Bayou Refining Consortium', 'Baton Rouge', 'LA', 30.4515, -91.1871, 870000, '2023-08-27', 'Clop', 'medium', { lat: 1.3521, lng: 103.8198 }),
  createAttack(23, 'Northern Lights Grid', 'Anchorage', 'AK', 61.2181, -149.9, 640000, '2024-02-12', 'Play', 'medium', { lat: 25.2048, lng: 55.2708 }),
  createAttack(24, 'Liberty Petrochem', 'Philadelphia', 'PA', 39.9526, -75.1652, 11200000, '2024-06-18', 'Akira', 'critical', { lat: 19.4326, lng: -99.1332 }),
  createAttack(25, 'Heartland Grain Rail', 'Wichita', 'KS', 37.6872, -97.3301, 280000, '2024-09-03', 'NoEscape', 'medium', { lat: 52.3667, lng: 4.8945 }),
  createAttack(26, 'Capital Beltway Transit', 'Washington', 'DC', 38.9072, -77.0369, 5600000, '2025-01-22', 'LockBit', 'high', { lat: 55.75, lng: 37.6167 }),
  createAttack(27, 'Atlantic Offshore Wind', 'Providence', 'RI', 41.824, -71.4128, 125000, '2025-04-11', 'Medusa', 'low', { lat: 34.6937, lng: 135.5023 }),
  createAttack(28, 'Southwest Gas Hub', 'El Paso', 'TX', 31.7619, -106.485, 4200000, '2025-07-05', 'RansomHouse', 'high', { lat: 59.95, lng: 30.3167 }),
  createAttack(29, 'Great River Barge', 'Memphis', 'TN', 35.1495, -90.049, 960000, '2025-09-18', 'BlackByte', 'medium', { lat: 13.7563, lng: 100.5018 }),
  createAttack(30, 'Cascadia SmartGrid', 'Spokane', 'WA', 47.6588, -117.426, 20500000, '2025-11-02', 'VoltTyphoon', 'critical', { lat: 31.5497, lng: 74.3436 }),
]

