import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Departament } from '../models/Deparment';
import { departamentos } from '../data/DepartamentsMock';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private departamentos$ = new BehaviorSubject<Departament[]>(departamentos);

  getDepartments() {
    return this.departamentos$.asObservable();
  }

  getMunicipalities(deptId: string) {
    return (
      this.departamentos$.value.find((d) => d.id === deptId)?.municipalities ??
      []
    );
  }

  getCities() {
    return this.departamentos$.value.flatMap((d) => d.municipalities);
  }
}
