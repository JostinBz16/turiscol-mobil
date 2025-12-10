import { Departament } from '../models/Deparment';

export const departamentos: Departament[] = [
  {
    id: 'dep-01',
    name: 'Antioquia',
    municipalities: [
      { id: 'mun-01', name: 'Medellín', departmentId: 'dep-01' },
      { id: 'mun-02', name: 'Envigado', departmentId: 'dep-01' },
      { id: 'mun-03', name: 'Bello', departmentId: 'dep-01' },
    ],
  },
  {
    id: 'dep-02',
    name: 'Cundinamarca',
    municipalities: [
      { id: 'mun-04', name: 'Bogotá', departmentId: 'dep-02' },
      { id: 'mun-05', name: 'Chía', departmentId: 'dep-02' },
      { id: 'mun-06', name: 'Zipaquirá', departmentId: 'dep-02' },
    ],
  },
  {
    id: 'dep-03',
    name: 'Valle del Cauca',
    municipalities: [
      { id: 'mun-07', name: 'Cali', departmentId: 'dep-03' },
      { id: 'mun-08', name: 'Palmira', departmentId: 'dep-03' },
      { id: 'mun-09', name: 'Buenaventura', departmentId: 'dep-03' },
    ],
  },
];

// Cities are the same as municipalities in your model
export const cities = [...departamentos.flatMap((d) => d.municipalities)];
