export class LocalStorageHelper {
  static getItem(key: string) {
    if (this.isBrowser()) {
      return localStorage.getItem(key);
    }
    return undefined;
  }

  /**
   *
   * @param key
   * @param value
   */
  static setItem(key: string, value: string) {
    if (this.isBrowser()) {
      localStorage.setItem(key, value);
    }
  }

  static isBrowser() {
    return typeof window !== undefined;
  }
}
