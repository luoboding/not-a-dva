
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
        [namespace]: (s = state, a) => {
          const { type } = a;
          const computedType = type.substring(type.indexOf('/') + 1);
          if (computedType in reducers && reducers[computedType]) {
            const computedState = reducers[computedType](s, a);
            return computedState;
          }
          return s;
        },
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
