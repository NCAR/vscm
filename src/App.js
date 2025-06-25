import React, {Component} from 'react';
import './App.css';

import Header from './Header';
import Interactive from './Interactive';
import Footer from './Footer';


class App extends Component {

  render () {
    return (
      <div className="App">
        <Header/>
      <div id="vscm">
          <div className="contentContainer">
            <Interactive/>
            </div>
        </div>
        <Footer/>
    </div>
  )
  }
}

export default App;
