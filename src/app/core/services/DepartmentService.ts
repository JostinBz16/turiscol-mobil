import { Injectable } from '@angular/core';
import { Department } from '../models/Deparment';
import { departamentos } from '../data/DepartamentsMock';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  getAll(): Department[] {
    return departamentos;
  }

  getById(id?: string): Department | undefined {
    return departamentos.find((d) => d.id === id);
  }
}
