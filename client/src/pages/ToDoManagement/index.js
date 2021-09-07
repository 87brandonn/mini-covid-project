import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Activities.css";
import { Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckSquare,
  faTimes,
  faTrash,
  faTrashAlt,
  faEdit,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";

import moment from "moment";

const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    End date : {moment(props).format("dddd , DD MMMM YYYY")}
  </Tooltip>
);

const getDuration = (start, end) => {
  var duration = moment.duration(end.diff(start));
  return Math.floor(duration.asHours());
};

function Activites() {
  const [activitiesData, setActivitiesData] = useState([]);
  const [isShowForm, setFormShow] = useState(false);
  const [editedActivity, setEditedActivity] = useState({});
  const [show, setShow] = useState(false);
  const [showSucess, setShowSucess] = useState(false);
  const [finishedActivities, setFinishedActivities] = useState([]);
  const [unFinishedActivities, setUnfinishedActivities] = useState([]);
  const [currentTime, setCurrentTime] = useState(moment().format("hh:mm:ss A"));
  const [disableWarning, setDisableWarning] = useState(false);

  const [mostUrgent, setMostUrgent] = useState({});

  const fetchMostUrgent = () => {
    axios.get("https://localhost:5001/api/todolists/urgent").then((res) => {
      console.log(res.data);
      setMostUrgent(res.data[0]);
    });
  };

  const fetchFinishedAct = (query) => {
    axios
      .get("https://localhost:5001/api/todolists/all/sorted", {
        params: {
          finished: query,
        },
      })
      .then((res) => {
        query == true
          ? setFinishedActivities(res.data)
          : setUnfinishedActivities(res.data);
      });
  };

  useEffect(() => {
    fetchFinishedAct(true);
    fetchFinishedAct(false);
    fetchMostUrgent();

    setInterval(() => {
      setCurrentTime(moment().format("hh:mm:ss A"));
    }, 1000);
  }, []);

  const schema = yup.object().shape({
    name: yup.string().required("Name must be filled"),
    due: yup.string().required("Due must be filled"),
    description: yup.string().required("Description must be filled"),
    reminder: yup.string().required("Reminder must be filled"),
  });

  const {
    register: informationRegister,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
  });

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };

  const handleShowForm = () => {
    setFormShow(!isShowForm);
  };

  const handleDelete = (id) => {
    axios.delete(`https://localhost:5001/api/todolists/${id}`).then((res) => {
      setShowSucess(true);
      fetchFinishedAct(true);
      fetchFinishedAct(false);
    });
  };
  const handleEdit = (activity) => {
    setEditedActivity(activity);
    handleShow();
  };
  const handleSubmitEdit = () => {
    axios
      .post(`https://localhost:5001/api/todolists/edit`, editedActivity)
      .then((res) => {
        setShow(false);
        fetchFinishedAct(editedActivity.bitFinished ? true : false);
      });
  };

  const handleFinish = (activity) => {
    axios
      .post(`https://localhost:5001/api/todolists/edit`, {
        ...activity,
        bitFinished: true,
      })
      .then((res) => {
        fetchFinishedAct(false);
        fetchFinishedAct(true);
      });
  };

  const updateWarnings = (activity) => {
    // console.log(activity);
    handleFinish(activity)
    fetchMostUrgent()

    
  };

  const onSubmit = (data) => {
    const finalObj = {
      txtName: data.name,
      dtTimeStamp: data.due,
      txtDescription: data.description,
      bitReminder: data.reminder == "1" ? true : false,
      bitFinished: false,
    };
    console.log(finalObj);
    axios.post(`https://localhost:5001/api/todolists`, finalObj).then((res) => {
      setValue("name", "");
      setValue("due", "");
      setValue("description", "");
      setValue("reminder", "");
      fetchFinishedAct(false);
      fetchMostUrgent()
    });
  };

  return (
    <div className="container">
      <Modal show={showSucess} onHide={() => setShowSucess(false)} centered>
        <Modal.Header>
          <Modal.Title>Congratulations</Modal.Title>
        </Modal.Header>
        <Modal.Body>You have succesfully delete the activity.</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSucess(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Edit Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="newName"
              placeholder="name@example.com"
              defaultValue={editedActivity.txtName}
              onChange={(e) =>
                setEditedActivity({
                  ...editedActivity,
                  txtName: e.target.value,
                })
              }
            />
            <label htmlFor="newName">Activity</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="datetime-local"
              className="form-control"
              id="newDue"
              placeholder="name@example.com"
              defaultValue={moment(editedActivity.dtTimeStamp).format(
                "YYY-MM-DD hh:mm"
              )}
              onChange={(e) => {
                setEditedActivity({
                  ...editedActivity,
                  dtTimeStamp: e.target.value,
                });
              }}
            />
            <label htmlFor="newDue">Due</label>
          </div>
          <div className="form-floating mb-3">
            <textarea
              className="form-control"
              id="newDescription"
              style={{ height: "6rem" }}
              placeholder="name@example.com"
              defaultValue={editedActivity.txtDescription}
              onChange={(e) =>
                setEditedActivity({
                  ...editedActivity,
                  txtDescription: e.target.value,
                })
              }
            />
            <label htmlFor="newDescription">Description</label>
          </div>
          <div className="form-floating mb-3">
            <select
              className="form-control"
              id="newReminder"
              placeholder="name@example.com"
              onChange={(e) =>
                setEditedActivity({
                  ...editedActivity,
                  bitReminder: e.target.value == "1" ? true : false,
                })
              }
            >
              <option value="1" selected={editedActivity.bitReminder}>
                Yes
              </option>
              <option value="2" selected={!editedActivity.bitReminder}>
                No
              </option>
            </select>
            <label htmlFor="newReminder">Reminder</label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleSubmitEdit()}>
            Edit
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="fs-1 text-center mb-2 mt-5 fw-bold">
        To Do List Management
      </div>
      <div className="fs-3 text-center mb-2">Local Time : {currentTime}</div>

      {disableWarning ? (
        <div className="mb-5">
          <button
            className="btn btn-light"
            onClick={() => setDisableWarning(false)}
          >
            Show me warnings
          </button>
        </div>
      ) : null}

      {!disableWarning ? (
        <div className="row mt-5 mb-5">
          <div className="col-6">
            <div className="alert alert-warning">
              <div className="fs-2">Warning ! Nearest Deadline: </div>
              <div className="fs-4">
                Your activity named <strong>{mostUrgent.txtName}</strong> is
                going to close in{" "}
                {getDuration(moment(), moment(mostUrgent.dtTimestamp))} hour
              </div>
              <div className="fs-5">
                Do you want to mark it as done?{" "}
                <button
                  className="btn btn-sm btn-primary ms-2 me-2"
                  onClick={() => updateWarnings(mostUrgent)}
                >
                  Yes,please
                </button>
                <button
                  className="btn btn-sm btn-danger btn-primary ms-2 me-2"
                  onClick={() => setDisableWarning(true)}
                >
                  Do not show warning again
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 mb-4">
        {isShowForm ? (
          <div className="mt-3 mb-3">
            <div className="row">
              <div className="col-6">
                <div className="form-floating mb-1">
                  <input
                    type="text"
                    className="form-control"
                    {...informationRegister("name")}
                    placeholder="name@example.com"
                  />
                  <label htmlFor="name">Activity Name</label>
                </div>
                <p className="text-danger">{errors.name?.message}</p>
              </div>
              <div className="col-6">
                <div className="form-floating mb-1">
                  <input
                    type="datetime-local"
                    className="form-control"
                    {...informationRegister("due")}
                    placeholder="name@example.com"
                  />
                  <label htmlFor="due">Due</label>
                </div>
                <p className="text-danger">{errors.due?.message}</p>
              </div>
              <div className="col-6">
                <div className="form-floating mb-1">
                  <textarea
                    style={{ height: "6rem" }}
                    className="form-control"
                    {...informationRegister("description")}
                    placeholder="name@example.com"
                  />
                  <label htmlFor="description">Description</label>
                </div>
                <p className="text-danger">{errors.description?.message}</p>
              </div>
              <div className="col-6">
                <div className="form-floating mb-1">
                  <select
                    className="form-control"
                    {...informationRegister("reminder")}
                    placeholder="name@example.com"
                  >
                    <option value="1">Yes</option>
                    <option value="2">No</option>
                  </select>
                  <label htmlFor="description">Reminder</label>
                </div>
                <p className="text-danger">{errors.reminder?.message}</p>
              </div>
            </div>
          </div>
        ) : null}
        <button className="btn btn-primary" onClick={handleShowForm}>
          {isShowForm ? "Cancel" : "Add Activity"}
        </button>
        {isShowForm ? (
          <button
            className="btn btn-primary ms-3"
            onClick={handleSubmit(onSubmit)}
          >
            Submit
          </button>
        ) : null}
      </div>

      <div className="fs-2 mt-5 mb-2 text-center fw-bold">
        Your Unfinished Activity <FontAwesomeIcon icon={faTimes} color="red" />
      </div>
      <div className="mb-2">
        This is your unfinished activities, please make sure to finish it before
        the due date comes.
      </div>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">No</th>
            <th scope="col">Activity</th>
            <th scope="col">Due</th>
            <th scope="col">Description</th>
            <th scope="col">Reminder</th>
            <th scope="col"></th>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {unFinishedActivities &&
            unFinishedActivities.map((activity, idx) => {
              return (
                <tr key={idx}>
                  <th scope="row">{idx + 1}</th>
                  <td>{activity.txtName}</td>
                  <td
                    className={`due-tab ${
                      getDuration(moment(), moment(activity.dtTimestamp)) <= 24
                        ? `text-danger`
                        : ""
                    }`}
                  >
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(activity.dtTimestamp)}
                    >
                      <div>
                        {getDuration(moment(), moment(activity.dtTimestamp)) <=
                        24
                          ? `${getDuration(
                              moment(),
                              moment(activity.dtTimestamp)
                            )} hours`
                          : moment(activity.dtTimestamp).fromNow()}
                      </div>
                    </OverlayTrigger>
                  </td>
                  <td>{activity.txtDescription}</td>
                  <td>{activity.bitReminder ? "Yes" : "No"}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => handleEdit(activity)}
                    />
                  </td>
                  <td>
                    <FontAwesomeIcon
                      icon={faTrash}
                      color="red"
                      onClick={() => handleDelete(activity.txtId)}
                    ></FontAwesomeIcon>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleFinish(activity)}
                    >
                      Finish
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <div className="fs-2 mt-5 mb-2 text-center fw-bold">
        Your Finished Activity{" "}
        <FontAwesomeIcon icon={faCheckSquare} color="green" />
      </div>

      <div className="mb-2">
        This is your finished activities, you can revert anytime if there is
        something that needs to be added.
      </div>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">No</th>
            <th scope="col">Activity</th>
            <th scope="col">Due</th>
            <th scope="col">Description</th>
            <th scope="col">Reminder</th>
            <th scope="col"></th>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {finishedActivities &&
            finishedActivities.map((activity, idx) => {
              return (
                <tr key={idx}>
                  <th scope="row">{idx + 1}</th>
                  <td>{activity.txtName}</td>
                  <td className={`due-tab`}>
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(activity.dtTimestamp)}
                    >
                      <div>{moment(activity.dtTimestamp).fromNow()}</div>
                    </OverlayTrigger>
                  </td>
                  <td>{activity.txtDescription}</td>
                  <td>{activity.bitReminder ? "Yes" : "No"}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => handleEdit(activity)}
                    />
                  </td>
                  <td>
                    <FontAwesomeIcon
                      icon={faTrash}
                      color="red"
                      onClick={() => handleDelete(activity.txtId)}
                    ></FontAwesomeIcon>
                  </td>
                  <td>
                    <FontAwesomeIcon
                      icon={faUndo}
                      onClick={() => handleDelete(activity.txtId)}
                    />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <div className="mt-5 mb-5"></div>
    </div>
  );
}

export default Activites;
