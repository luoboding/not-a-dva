import { dispatch } from "rxjs/internal/observable/range";

const compose = (a, b) => (...args) => a(b(...args));
const composeAll = (...funcs) => {
  if (!funcs.length) {
    return args => args;
  }
  return funcs.reduce((result, current) => (...args) => result(current(...args)));
}

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

  function subscribe(fn) {
    if (typeof fn !== 'function') {
      throw new Error('input of subscribe must be a function.');
    }
    nextListeners.push(fn);
  }

  function getState() {

  }

  function dispacth(action) {
  }

  return {
    subscribe,
    dispacth,
    getState,
  };
}
