import { User } from '../models/User';

export const MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    userName: '',
    email: 'jostin@gmail.com',
    phoneNumber: '3001112233',
    role: 'turista',
    active: true,
  },
  {
    id: 'usr-002',
    userName: 'Ana',
    email: 'ana.lopez@example.com',
    phoneNumber: '3012223344',
    role: 'proveedor',
    active: true,
  },
  {
    id: 'usr-003',
    userName: 'Jx',
    email: 'admin@example.com',
    phoneNumber: '3023334455',
    role: 'admin',
    active: true,
  },
  {
    id: 'usr-004',
    userName: 'Luisa',
    email: 'luisa.martinez@example.com',
    phoneNumber: '3034445566',
    role: 'turista',
    active: false,
  },
  {
    id: 'usr-005',
    userName: 'David Herrera',
    email: 'david.herrera@example.com',
    phoneNumber: '3045556677',
    role: 'proveedor',
    active: true,
  },
  {
    id: 'usr-006',
    userName: 'Sara',
    email: 'sara.mejia@example.com',
    phoneNumber: '3056667788',
    role: 'turista',
    active: true,
  },
];
