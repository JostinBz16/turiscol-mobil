import { Price } from '../models/Price';

export const pricesMock: Price[] = [
  {
    id: 'p-1',
    name: 'Tour por la Candelaria',
    description:
      'Recorrido histórico por el centro de Bogotá, visitando museos y plazas emblemáticas.',
    category: 'TOUR',
    minPrice: 80000,
    maxPrice: 150000,
    municipalityId: '1',
    active: true,
  },
  {
    id: 'p-2',
    name: 'Pasadía en Guatapé',
    description:
      'Día completo con transporte, alimentación y visita a la Piedra del Peñol.',
    category: 'PASADIA',
    minPrice: 120000,
    maxPrice: 200000,
    municipalityId: '2',
    active: true,
  },
  {
    id: 'p-3',
    name: 'Cena Típica Valluna',
    description: 'Degustación de platos tradicionales como sancocho y lulada.',
    category: 'GASTRONOMIA',
    minPrice: 45000,
    maxPrice: 85000,
    municipalityId: '3',
    active: true,
  },
  {
    id: 'p-4',
    name: 'Transporte Aeropuerto',
    description:
      'Servicio de recogida y traslado al aeropuerto con conductor bilingüe.',
    category: 'TRANSPORTE',
    minPrice: 60000,
    maxPrice: 90000,
    municipalityId: '1',
    active: true,
  },
  {
    id: 'p-5',
    name: 'Artesanías en Barro',
    description: 'Taller de cerámica tradicional y venta de productos locales.',
    category: 'ARTESANIA',
    minPrice: 20000,
    maxPrice: 150000,
    municipalityId: '4',
    active: true,
  },
];
