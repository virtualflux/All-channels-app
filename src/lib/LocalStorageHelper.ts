
// export class LocalStorageHelper {
//   static getItem(key: string) {
//     if (window && this.isBrowser()) {
//       return window.localStorage.getItem(key) ?? "";
//     }
//     return undefined;
//   }

//   /**
//    *
//    * @param key
//    * @param value
//    */
//   static setItem(key: string, value: string) {
//     if (window && this.isBrowser()) {
//       window.localStorage.setItem(key, value);
//     }
//   }

//   static isBrowser() {
//     return typeof window !== undefined;
//   }

//   static clearItems() {
//     if (window && this.isBrowser()) {
//       window.localStorage.clear();
//     }
//   }
// }
