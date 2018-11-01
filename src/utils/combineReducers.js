/**
 * @param {Object} reducers
 * @returns {Function}
 */
export default (reducers) => {
  const keys = Object.keys(reducers);
  const filteredReducers = {};
  keys.forEach((key) => {
    const reducer = reducers[key];
    if (!reducer) {
      throw new Error(`reducer '${key}' 非法`);
    }

    if (typeof reducer === 'function') {
      /**
       * 对reducer进行测试, 任何一个reducer执行结果都必须有state
       * 传入任意action都应该得到一个的state, 否则为非法的reducer
       * reducer(initState, action)
       */
      const state = reducer(undefined, { type: '@not_a_dva/test' });
      if (!state) {
        throw new Error(`reducer '${key}' 需提供默认state`);
      }
      filteredReducers[key] = reducer;
    }
  });
  /**
   * @param {Object} state 前一次运算的所有state
   * @param {Object} action 当前收到的action
   * @returns {Object} 当前action计算出来的state且合并后的结果
   * 我们根据这次action计算出新的state，然后和前一次的state进行merge
   */
  return (state, action) => {
    /**
     * 当接受到action的时候, 要对注册reducers进行调用
     * 我们可以通过循环的方式依次调用, 如果每次都不停调用
     */
    const nextState = {};
    Object.keys(filteredReducers).forEach((key) => {
      const reducer = filteredReducers[key];
      const previousState = state[key];
      Object.assign(nextState, {
        [key]: reducer(previousState, action), // 这里其实是需要做检查的, 过滤出计算结果为undefined的结果.
      });
    });
    return nextState;
  };
};
