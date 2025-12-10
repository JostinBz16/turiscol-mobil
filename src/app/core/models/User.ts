export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ciudadId: string;
  foto?: string;
  rol: 'turista' | 'admin' | 'proveedor';
}
