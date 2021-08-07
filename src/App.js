import logo from "./logo.svg";
import "antd/dist/antd.css";
import "./App.css";
import Login from "./Views/Login";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import { Layout } from "antd";
import Register from "./Views/Register";
import Experiment from "./Views/Experiment";

const { Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <div>
        <Layout className="main-layout">
          <Content className="site-content">
            <Switch>
              <Route path="/register">
                <Register />
              </Route>
              <Route path="/experiment/:userId">
                <Experiment />
              </Route>
              <Route path="/">
                <Login />
              </Route>
            </Switch>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Sleep Facial Expression Recognition ©2021 Created by Sadaf Hafezi &
            Vahid Geraeinejad
          </Footer>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
