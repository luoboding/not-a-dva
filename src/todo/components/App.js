import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  onClick= (evt) => {
    evt.preventDefault();
    const { dispatch } = this.props;
    dispatch({
      type: 'todo/stateWillUpdate',
      payload: {
        name: '李四',
      },
    });
  }

  onClickAsync= (evt) => {
    evt.preventDefault();
    const { dispatch } = this.props;
    dispatch({
      type: 'todo/changeName',
      payload: {
      },
    });
  }

  render() {
    const { name } = this.props;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            name { name }
          </p>
          <a href="#" onClick={this.onClick}>同步更名字</a>
          <a href="#" onClick={this.onClickAsync}>异步更名字</a>
          <Switch>
            <Route path="/" exact component={() => (<div>首页欢迎你</div>)} />
            <Route path="/login" component={() => (<div>login</div>)} />
            <Route path="/home" component={() => (<div>home</div>)} />
            <Route path="*" component={() => (<div>页面不存在....</div>)} />
          </Switch>
        </header>
      </div>
    );
  }
}

export default App;
