import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/User';
import { users } from '../data/UserMock';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private users$ = new BehaviorSubject<User[]>(users);

  getAll(): Observable<User[]> {
    return this.users$.asObservable();
  }

  getById(id: string): User | undefined {
    return this.users$.value.find((u) => u.id === id);
  }

  add(user: User) {
    this.users$.next([...this.users$.value, user]);
  }

  update(user: User) {
    const updated = this.users$.value.map((u) => (u.id === user.id ? user : u));
    this.users$.next(updated);
  }
}
