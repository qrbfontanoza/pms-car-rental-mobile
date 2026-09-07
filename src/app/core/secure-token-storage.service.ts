import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { KeychainAccess, SecureStorage } from '@aparajita/capacitor-secure-storage';
import { StoredAuthSession } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class SecureTokenStorageService {
  private readonly key = 'auth-session';
  private readonly native = Capacitor.isNativePlatform();
  private initialized?: Promise<void>;

  async read(): Promise<StoredAuthSession | null> {
    const raw = this.native ? await this.readNative() : sessionStorage.getItem(this.key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredAuthSession;
    } catch {
      await this.clear();
      return null;
    }
  }

  async write(session: StoredAuthSession): Promise<void> {
    const raw = JSON.stringify(session);
    if (this.native) {
      await this.initializeNative();
      await SecureStorage.set(this.key, raw, false, false, KeychainAccess.whenUnlockedThisDeviceOnly);
    } else {
      sessionStorage.setItem(this.key, raw);
    }
  }

  async clear(): Promise<void> {
    if (this.native) {
      await this.initializeNative();
      await SecureStorage.remove(this.key);
    } else {
      sessionStorage.removeItem(this.key);
    }
  }

  private async readNative(): Promise<string | null> {
    await this.initializeNative();
    const value = await SecureStorage.get(this.key, false);
    return typeof value === 'string' ? value : null;
  }

  private initializeNative(): Promise<void> {
    this.initialized ??= (async () => {
      await SecureStorage.setKeyPrefix('ph.pmsrentals.customer.');
      await SecureStorage.setSynchronize(false);
      await SecureStorage.setDefaultKeychainAccess(KeychainAccess.whenUnlockedThisDeviceOnly);
    })();
    return this.initialized;
  }
}
