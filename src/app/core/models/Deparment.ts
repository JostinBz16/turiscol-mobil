import { Municipality } from './Municipality';

export interface Departament {
  id: string;
  name: string;
  municipalities: Municipality[];
}
