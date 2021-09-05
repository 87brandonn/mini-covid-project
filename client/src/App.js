import logo from "./logo.svg";
import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import moment from "moment";
import abbreviate from "number-abbreviate";
import { Modal, Button } from "react-bootstrap";

function App() {
  const [covidData, setFullData] = useState([]);
  const [time, setTime] = useState(moment().format("HH:mm:ss"));
  const [show, setShow] = useState(false);
  const [logsData, setLogsData] = useState([]);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };

  const fetchData = () => {
    axios.get("http://localhost:3001/covid-data/all").then((res) => {
      setFullData(res.data);
    });
  };

  const fetchLogs = () => {
    axios.get("http://localhost:3001/covid-data/logs").then((res) => {
      var filtered = [];
      for (var keys in res.data) {
        filtered.push({
          date: keys,
          data: res.data,
        });
      }
      setLogsData(filtered);
    });
  };
  useEffect(() => {
    fetchData();
    fetchLogs();
  }, []);
  setInterval(() => {
    const currTime = moment().format("HH:mm:ss");
    if (currTime == "23:59:00") {
      fetchLogs();
      fetchData();
    }
    setTime(moment().format("HH:mm:ss"));
  }, 1000);

  const getDuration = (end, start) => {
    var duration = moment.duration(end.diff(start));
    return duration.asHours();
  };

  return (
    <div className="App">
      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Logs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {logsData && logsData.length == 0 ? (
            <div>No data to display</div>
          ) : (
            logsData.map((log) => {
              return (
                <div>
                  <div>{log.date}</div>
                  <div>Added {log.data.length}</div>
                </div>
              );
            })
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Exit
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="title">United States Covid API</div>
      <div className="times">{time}</div>
      <div className="">Resetted every 11.59 PM</div>

      <button className="btn btn-primary mt-4 mb-4" onClick={handleShow}>
        Check Logs
      </button>
      <div className="d-flex  align-items-center">
        <div className="label"></div>
        <div className="text-label">Just updated</div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">No</th>
            <th scope="col">Date</th>
            <th scope="col">Total Test</th>
            <th scope="col">Death</th>
            <th scope="col">Hospitalize</th>
            <th scope="col">On Ventilator</th>

            <th scope="col">In ICU</th>
            <th scope="col">Negative</th>
            <th scope="col">Positive</th>
          </tr>
        </thead>
        <tbody>
          {covidData &&
            covidData.map((data, idx) => {
              return (
                <tr
                  key={idx}
                  className={
                    getDuration(moment(), moment(data.createdOn)) <= 24
                      ? `bg-green`
                      : ``
                  }
                >
                  <th>{idx + 1}</th>
                  <th scope="row">
                    {moment(data.dateChecked).format("YYYY/MM/DD")}
                  </th>
                  <td>{abbreviate(data.totalTestResults)}</td>
                  <td>{abbreviate(data.death)}</td>
                  <td>{abbreviate(data.hospitalized)}</td>
                  <td>{abbreviate(data.onVentilatorCumulative)}</td>
                  <td>{abbreviate(data.inIcuCumulative)}</td>
                  <td>{abbreviate(data.negative)}</td>
                  <td>{abbreviate(data.positive)}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
