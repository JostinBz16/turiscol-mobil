import { Injectable } from '@angular/core';
import { Municipality } from '../models/Municipality';
import { destinations } from '../data/MunicipalityMock';

@Injectable({
  providedIn: 'root',
})
export class MunicipalityService {
  getAll(): Municipality[] {
    return destinations;
  }

  getByDepartment(departmentId: string): Municipality[] {
    return destinations.filter((d) => d.departmentId === departmentId);
  }

  getById(id: string): Municipality | undefined {
    return destinations.find((d) => d.id === id);
  }
}
