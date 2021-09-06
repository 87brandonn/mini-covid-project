import React from "react";
import {
    BrowserRouter as Router, Route, Switch
} from "react-router-dom";
import ToDoManagement from "../pages/ToDoManagement";
import CovidMini from "../pages/Covid-Mini";

export default function Routes() {
  return (
    <Router>
        <Switch>
          <Route path="/covid">
            <CovidMini />
          </Route>
          <Route path="/">
            <ToDoManagement />
          </Route>
       
        </Switch>
    </Router>
  );
}
