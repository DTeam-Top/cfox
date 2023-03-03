import {existsSync, readFileSync, writeFileSync} from 'fs';
import {injectable} from 'inversify';
import path from 'path';
import {createPathIfNotExisting} from '../commons';
import {Cache} from '../types/types';

@injectable()
export class LocalCache implements Cache {
  constructor(private cacheHome: string) {
    createPathIfNotExisting(cacheHome);
  }

  put(key: string, value: string): void {
    const realKey = path.join(this.cacheHome, key);

    if (existsSync(realKey)) {
      throw new Error(`Existing key: ${key}`);
    }

    createPathIfNotExisting(path.dirname(realKey));
    writeFileSync(realKey, value);
  }

  get(key: string): string | null {
    const realKey = path.join(this.cacheHome, key);

    if (existsSync(realKey)) {
      return readFileSync(realKey).toString();
    }

    return null;
  }
}
