import { User } from '../models/User';

export const MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Jostin',
    lastName: 'Morales',
    email: 'jostin.morales@example.com',
    phone: '3001112233',
    role: 'turista',
    active: true,
  },
  {
    id: 'usr-002',
    name: 'Ana',
    lastName: 'López',
    email: 'ana.lopez@example.com',
    phone: '3012223344',
    role: 'proveedor',
    active: true,
  },
  {
    id: 'usr-003',
    name: 'Carlos',
    lastName: 'Ruiz',
    email: 'carlos.ruiz@example.com',
    phone: '3023334455',
    role: 'admin',
    active: true,
  },
  {
    id: 'usr-004',
    name: 'Luisa',
    lastName: 'Martínez',
    email: 'luisa.martinez@example.com',
    phone: '3034445566',
    role: 'turista',
    active: false, // 🔥 caso real: usuario desactivado
  },
  {
    id: 'usr-005',
    name: 'David Herrera',
    lastName: 'Gómez',
    email: 'david.herrera@example.com',
    phone: '3045556677',
    role: 'proveedor',
    active: true,
  },
  {
    id: 'usr-006',
    name: 'Sara',
    lastName: 'Mejía',
    email: 'sara.mejia@example.com',
    phone: '3056667788',
    role: 'turista',
    active: true,
  },
];
