import React from "react";
import "./App.css";

import Header from "./Header";
import Interactive from "./Interactive";
import Footer from "./Footer";
const App = () =>
{
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
};
export default App;