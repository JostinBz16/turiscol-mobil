import { User } from '../models/User';

export const users: User[] = [
  {
    id: 'usr-01',
    nombre: 'Jostin Morales',
    email: 'jostin@example.com',
    telefono: '3001112233',
    ciudadId: 'mun-01',
    rol: 'turista',
    foto: '/img/users/user1.png',
  },
  {
    id: 'usr-02',
    nombre: 'Ana López',
    email: 'ana@example.com',
    telefono: '3012223344',
    ciudadId: 'mun-04',
    rol: 'proveedor',
    foto: '/img/users/user2.png',
  },
  {
    id: 'usr-03',
    nombre: 'Carlos Ruiz',
    email: 'carlos@example.com',
    telefono: '3023334455',
    ciudadId: 'mun-07',
    rol: 'admin',
  },
  {
    id: 'usr-04',
    nombre: 'Luisa Martínez',
    email: 'luisa@example.com',
    telefono: '3034445566',
    ciudadId: 'mun-05',
    rol: 'turista',
  },
  {
    id: 'usr-05',
    nombre: 'David Herrera',
    email: 'david@example.com',
    telefono: '3045556677',
    ciudadId: 'mun-02',
    rol: 'proveedor',
  },
  {
    id: 'usr-06',
    nombre: 'Sara Mejía',
    email: 'sara@example.com',
    telefono: '3056667788',
    ciudadId: 'mun-08',
    rol: 'turista',
  },
];
