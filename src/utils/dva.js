
import React from 'react';
import ReactDOM from 'react-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import {
  fork,
  all,
  takeEvery,
  call,
  put,
} from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';

// 我们根据dva的签名来推导这个函数的实现

function createReducer(initialState, handlers) {
  return (state = initialState, action) => {
    const { type } = action;
    if (handlers[type]) {
      return handlers[type](state, action);
    }
    return state;
  };
}

/**
 * 包装reducerHandler
 * @param {Object} handlers
 * @returns Function
 */
function bindNamespaceToHandler(handlers) {
  if (typeof handlers !== 'object' || handlers === null) {
    throw new Error('reducer handler error');
  }
  return function namespanced(namespace) {
    const newHandler = {};
    const keys = Object.keys(handlers);
    keys.forEach((key) => {
      const namespacedKey = `${namespace}/${key}`;
      Object.assign(newHandler, {
        [namespacedKey]: handlers[key],
      });
    });
    return newHandler;
  };
}
const setupKey = 'setup';
export default function dva(options) {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware];
  const sagas = [];
  const listeners = [];
  const reducerMapping = {};
  const {
    history,
    // onError,  这些方法还未实现
    // onAction,
    // onStateChange,
    // onReducer,
    // onEffect,
    // onHmr,
    // extraReducers,
    // extraEnhancers,
  } = options;

  // 如果用户没有设置history, 则默认为html5的browserhistory
  const customizedHistory = history || createBrowserHistory();
  // 挂载的根组件
  let RootElement;
  return {
    model(model) {
      const {
        namespace,
        effects,
        reducers,
        subscriptions,
        state,
      } = model;
      if (namespace in reducerMapping && reducerMapping[namespace]) {
        throw new Error('namespance in model must be unique.');
      }
      if (setupKey in subscriptions && subscriptions[setupKey]) {
        listeners.push({
          namespace,
          setup: subscriptions[setupKey],
        });
      }
      // 处理reducer
      Object.assign(reducerMapping, {
        [namespace]: createReducer(state, bindNamespaceToHandler(reducers)(namespace)),
      });
      // 处理saga 并且装饰put函数
      function* decoratedPut(action) {
        const { type } = action;
        yield put({
          ...action,
          type: `${namespace}/${type}`,
        });
      }
      /* eslint guard-for-in: 0 */
      for (const key in effects) {
        const computedKey = `${namespace}/${key}`;
        sagas.push(takeEvery(computedKey, function *init(action) {
          const { type } = action;
          const computedType = type.substring(type.indexOf('/') + 1);
          yield effects[computedType](action, { call, put: decoratedPut, fork });
        }));
      }
    },
    use(middleware) {
      middlewares.push(middleware);
    },
    router(cb) {
      RootElement = cb({ history: customizedHistory });
    },
    // 当用户调用start(element)时候, 开始挂载在这个节点.
    start(element) {
      const store = createStore(combineReducers(reducerMapping), applyMiddleware(...middlewares));
      sagaMiddleware.run(function *init() {
        yield all(sagas);
      });
      const { dispatch } = store;
      const decoratedDispatch = namespace => (action) => {
        const { type } = action;
        return dispatch({
          ...action,
          type: `${namespace}/${type}`,
        });
      };
      listeners.forEach((item) => {
        const { namespace, setup } = item;
        const d = decoratedDispatch(namespace);
        setup({ dispatch: d, history: customizedHistory });
      });
      ReactDOM.render((
        <Provider store={store}>
          {
            RootElement
          }
        </Provider>), document.querySelector(element));
    },
  };
}
