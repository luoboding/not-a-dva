import TodoService from '../services';

const defaultState = {
  name: '张三',
};

export default {
  namespace: 'todo',
  state: {
    ...defaultState,
  },
  reducers: {
    stateWillUpdate(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
  effects: {
    * changeName(_, { put, call }) {
      const name = yield call(TodoService.list);
      yield put({
        type: 'stateWillUpdate',
        payload: {
          name,
        },
      });
    },
    * fetch(_, { put }) {
      yield put({
        type: 'stateWillUpdate',
        payload: {
          name: '首页的张三',
        },
      });
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/home') {
          dispatch({
            type: 'fetch',
            payload: {
            },
          });
        }
      });
    },
  },
};
