import { ObjectUnsubscribedError } from "rxjs";

/**
 * @param {Function} reducer
 * @param {  }
 * @param { Function } enhancer
 * @returns store
 */
export default (reducer, preloadState, enhancer) => {
  if (typeof reducer !== 'function') {
    throw new Error('reducer must be a function.');
  }
  let currentPreloadState = preloadState;
  let currentEnhancer = enhancer;
  if (typeof preloadState === 'function' && enhancer === undefined) {
    currentEnhancer = preloadState;
    currentPreloadState = undefined;
  }

  const currentReducer = reducer;
  const currentState = currentPreloadState;
  const currentListeners = [];
  const nextListeners = currentListeners;

  function subscribe(event) {
    return unsubscribe() {

    }
  }

}
