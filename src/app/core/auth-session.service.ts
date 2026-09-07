import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StoredAuthSession } from '../models/api.models';
import { User } from '../models/domain.models';
import { SecureTokenStorageService } from './secure-token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly sessionSubject = new BehaviorSubject<StoredAuthSession | null>(null);
  private readonly readySubject = new BehaviorSubject(false);
  readonly user$ = new BehaviorSubject<User | null>(null);
  readonly ready$ = this.readySubject.asObservable();

  constructor(private readonly storage: SecureTokenStorageService) {}

  get session(): StoredAuthSession | null {
    return this.sessionSubject.value;
  }
  get accessToken(): string | null {
    return this.session?.accessToken ?? null;
  }
  get refreshToken(): string | null {
    return this.session?.refreshToken ?? null;
  }

  async load(): Promise<StoredAuthSession | null> {
    const session = await this.storage.read();
    this.sessionSubject.next(session);
    this.user$.next(session?.user ?? null);
    return session;
  }

  async set(session: StoredAuthSession): Promise<void> {
    await this.storage.write(session);
    this.sessionSubject.next(session);
    this.user$.next(session.user);
  }

  updateUser(user: User): void {
    const current = this.session;
    if (!current) return;
    void this.set({ ...current, user });
  }

  async clear(): Promise<void> {
    this.sessionSubject.next(null);
    this.user$.next(null);
    await this.storage.clear();
  }

  markReady(): void {
    this.readySubject.next(true);
  }
}
