export type OriginId = 'american' | 'japanese' | 'chinese' | 'german';
export type Product = {
  id: string;
  origin: OriginId;
  brand: string;
  category: string;
  name: { en: string; ar: string };
  categoryName: { en: string; ar: string };
  models: string[];
  years: number[];
  price: number;
  oldPrice: number;
  art: 'brake' | 'filter' | 'battery' | 'spark' | 'shock' | 'lamp' | 'belt' | 'pump';
  color: string;
};

export const origins: { id: OriginId; nameKey: OriginId; brands: string[] }[] = [
  { id: 'american', nameKey: 'american', brands: ['Chevrolet', 'Ford', 'GMC', 'Dodge', 'Jeep', 'Cadillac'] },
  { id: 'japanese', nameKey: 'japanese', brands: ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Mitsubishi', 'Lexus'] },
  { id: 'chinese', nameKey: 'chinese', brands: ['Geely', 'Chery', 'MG', 'Changan', 'Haval', 'BYD'] },
  { id: 'german', nameKey: 'german', brands: ['Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Porsche'] },
];

const make = (id: string, origin: OriginId, brand: string, category: string, en: string, ar: string, categoryEn: string, categoryAr: string, models: string[], years: number[], price: number, oldPrice: number, art: Product['art'], color: string): Product => ({
  id, origin, brand, category, name: { en, ar }, categoryName: { en: categoryEn, ar: categoryAr }, models, years, price, oldPrice, art, color,
});

export const products: Product[] = [
  make('us-brake', 'american', 'Chevrolet', 'brakes', 'Front brake pad set', 'طقم تيل فرامل أمامي', 'Brakes', 'فرامل', ['Cruze', 'Aveo', 'Optra'], [2014, 2015, 2016, 2017, 2018], 1480, 1760, 'brake', '#df6b23'),
  make('us-filter', 'american', 'Ford', 'filters', 'Engine air filter', 'فلتر هواء المحرك', 'Filters', 'فلاتر', ['Focus', 'Fiesta', 'EcoSport'], [2016, 2017, 2018, 2019, 2020], 420, 510, 'filter', '#d99337'),
  make('us-shock', 'american', 'Jeep', 'suspension', 'Front shock absorber', 'مساعد أمامي', 'Suspension', 'عفشة', ['Cherokee', 'Compass', 'Renegade'], [2015, 2016, 2017, 2018], 2650, 2990, 'shock', '#7d8f98'),
  make('us-lamp', 'american', 'GMC', 'lighting', 'Headlamp assembly', 'وحدة فانوس أمامي', 'Lighting', 'إضاءة', ['Terrain', 'Acadia', 'Yukon'], [2017, 2018, 2019, 2020], 3180, 3590, 'lamp', '#8f9eab'),
  make('jp-battery', 'japanese', 'Toyota', 'electrical', '12V maintenance-free battery', 'بطارية ١٢ فولت جافة', 'Electrical', 'كهرباء', ['Corolla', 'Yaris', 'Camry'], [2018, 2019, 2020, 2021, 2022], 2450, 2790, 'battery', '#c85f2c'),
  make('jp-spark', 'japanese', 'Nissan', 'ignition', 'Iridium spark plug set', 'طقم بوجيهات إيريديوم', 'Ignition', 'إشعال', ['Sunny', 'Sentra', 'Qashqai'], [2017, 2018, 2019, 2020], 890, 1040, 'spark', '#b88242'),
  make('jp-filter', 'japanese', 'Honda', 'filters', 'Cabin air filter', 'فلتر هواء تكييف', 'Filters', 'فلاتر', ['Civic', 'City', 'CR-V'], [2016, 2017, 2018, 2019, 2020], 360, 425, 'filter', '#7996a0'),
  make('jp-brake', 'japanese', 'Mitsubishi', 'brakes', 'Rear brake disc pair', 'طقم طنابير خلفي', 'Brakes', 'فرامل', ['Lancer', 'Outlander', 'ASX'], [2015, 2016, 2017, 2018], 1980, 2240, 'brake', '#d67b3b'),
  make('cn-pump', 'chinese', 'MG', 'engine', 'Water pump assembly', 'طلمبة مياه كاملة', 'Engine', 'محرك', ['ZS', 'MG 5', 'HS'], [2019, 2020, 2021, 2022], 1270, 1490, 'pump', '#b36d47'),
  make('cn-belt', 'chinese', 'Geely', 'engine', 'Drive belt', 'سير مجموعة', 'Engine', 'محرك', ['Emgrand', 'Coolray', 'GX3 Pro'], [2018, 2019, 2020, 2021], 540, 630, 'belt', '#858d91'),
  make('cn-lamp', 'chinese', 'Chery', 'lighting', 'Front fog lamp', 'كشاف شبورة أمامي', 'Lighting', 'إضاءة', ['Tiggo 4', 'Tiggo 7', 'Arrizo 5'], [2019, 2020, 2021, 2022], 780, 920, 'lamp', '#a77b48'),
  make('cn-shock', 'chinese', 'Changan', 'suspension', 'Rear shock absorber', 'مساعد خلفي', 'Suspension', 'عفشة', ['CS35', 'CS55', 'Eado'], [2018, 2019, 2020, 2021], 1540, 1790, 'shock', '#76878f'),
  make('de-brake', 'german', 'BMW', 'brakes', 'Ceramic brake pad set', 'طقم تيل فرامل سيراميك', 'Brakes', 'فرامل', ['3 Series', '5 Series', 'X3'], [2016, 2017, 2018, 2019], 2890, 3350, 'brake', '#c45334'),
  make('de-filter', 'german', 'Volkswagen', 'filters', 'Oil filter cartridge', 'فلتر زيت داخلي', 'Filters', 'فلاتر', ['Golf', 'Passat', 'Tiguan'], [2015, 2016, 2017, 2018, 2019], 315, 390, 'filter', '#a27849'),
  make('de-spark', 'german', 'Mercedes-Benz', 'ignition', 'Ignition coil', 'بوبينة إشعال', 'Ignition', 'إشعال', ['C-Class', 'E-Class', 'GLA'], [2016, 2017, 2018, 2019, 2020], 1820, 2130, 'spark', '#88939a'),
  make('de-pump', 'german', 'Audi', 'engine', 'Coolant circulation pump', 'طلمبة مياه التبريد', 'Engine', 'محرك', ['A3', 'A4', 'Q3'], [2017, 2018, 2019, 2020], 2190, 2490, 'pump', '#bd7347'),
];

export const productModels = Array.from(new Set(products.flatMap((product) => product.models))).sort();
export const productYears = Array.from(new Set(products.flatMap((product) => product.years))).sort((a, b) => b - a);
