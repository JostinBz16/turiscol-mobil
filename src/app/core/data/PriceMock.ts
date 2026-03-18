import { Price } from '../models/Price';
import { ServiceCategory } from '../models/Offers';

export const pricesMock: Price[] = [
  {
    id: 'p-1',
    name: 'Tour por la Candelaria',
    description:
      'Recorrido histórico por el centro de Bogotá, visitando museos y plazas emblemáticas.',
    category: ServiceCategory.TOUR,
    minPrice: 80000,
    maxPrice: 150000,
    municipalityId: '1', // Bogotá
    active: true,
  },
  {
    id: 'p-2',
    name: 'Pasadía en Guatapé',
    description:
      'Día completo con transporte, alimentación y visita a la Piedra del Peñol.',
    category: ServiceCategory.PASADIA,
    minPrice: 120000,
    maxPrice: 200000,
    municipalityId: '2', // Medellín (Guatapé logic)
    active: true,
  },
  {
    id: 'p-3',
    name: 'Cena Típica Valluna',
    description: 'Degustación de platos tradicionales como sancocho y lulada.',
    category: ServiceCategory.GASTRONOMIA,
    minPrice: 45000,
    maxPrice: 85000,
    municipalityId: '3', // Cali
    active: true,
  },
  {
    id: 'p-4',
    name: 'Transporte Aeropuerto',
    description:
      'Servicio de recogida y traslado al aeropuerto con conductor bilingüe.',
    category: ServiceCategory.TRANSPORTE,
    minPrice: 60000,
    maxPrice: 90000,
    municipalityId: '1', // Bogotá
    active: true,
  },
  {
    id: 'p-5',
    name: 'Artesanías en Barro',
    description: 'Taller de cerámica tradicional y venta de productos locales.',
    category: ServiceCategory.ARTESANIA,
    minPrice: 20000,
    maxPrice: 150000,
    municipalityId: '4', // Barranquilla (Example)
    active: true,
  },
];
