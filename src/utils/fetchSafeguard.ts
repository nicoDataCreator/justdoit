/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Global safeguard to ensure window.fetch can be monkey-patched or assigned to
// in strict-mode environments (like sandboxed iframes) without throwing
// "Cannot set property fetch of #<Window> which has only a getter"
(function initFetchSafeguard() {
  try {
    const target: any =
      typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
        ? globalThis
        : null;

    if (target && target.fetch) {
      const origFetch = target.fetch.bind(target);
      let activeFetch = origFetch;

      // Define both getter and setter on target so assignments succeed
      Object.defineProperty(target, 'fetch', {
        configurable: true,
        enumerable: true,
        get() {
          return activeFetch;
        },
        set(newFetch) {
          activeFetch = typeof newFetch === 'function' ? newFetch : origFetch;
        },
      });
    }
  } catch (err) {
    // Fail silently or log warning if property cannot be redefined
    console.warn('Fetch safeguard warning:', err);
  }
})();

export {};
