import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Activities.css";
import { Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";

const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    End date : {moment(props).format("dddd , DD MMMM YYYY")}
  </Tooltip>
);

const getDuration = (start, end) => {
  var duration = moment.duration(end.diff(start));
  return duration.asHours();
};

function Activites() {
  const [activitiesData, setActivitiesData] = useState([]);
  const [isShowForm, setFormShow] = useState(false);
  const [editedActivity, setEditedActivity] = useState({});
  const [show, setShow] = useState(false);
  const [showSucess, setShowSucess] = useState(false);

  const fetchActivities = () => {
    axios.get("https://localhost:5001/api/todolists/all").then((res) => {
      setActivitiesData(res.data);
    });
  };

  useEffect(() => {
    fetchActivities();
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
      fetchActivities();
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
        fetchActivities();
      });
  };

  const onSubmit = (data) => {
    const finalObj = {
      Name: data.name,
      TimeStamp: data.due,
      Description: data.description,
      Reminder: data.reminder == "1" ? true : false,
    };
    console.log(finalObj);
    axios.post(`https://localhost:5001/api/todolists`, finalObj).then((res) => {
      setValue("name", "");
      setValue("due", "");
      setValue("description", "");
      setValue("reminder", "");
      fetchActivities();
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
          <Modal.Title>Edit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="newName"
              placeholder="name@example.com"
              defaultValue={editedActivity.Name}
              onChange={(e) =>
                setEditedActivity({ ...editedActivity, Name: e.target.value })
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
              defaultValue={moment(editedActivity.TimeStamp).format(
                "YYYY-MM-DDTHH:mm"
              )}
              onChange={(e) => {
                setEditedActivity({
                  ...editedActivity,
                  TimeStamp: e.target.value,
                });

                console.log(editedActivity.TimeStamp);
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
              defaultValue={editedActivity.Description}
              onChange={(e) =>
                setEditedActivity({
                  ...editedActivity,
                  Description: e.target.value,
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
                  Reminder: e.target.value == "1" ? true : false,
                })
              }
            >
              <option value="1" selected={editedActivity.Reminder}>
                Yes
              </option>
              <option value="2" selected={!editedActivity.Reminder}>
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
      <div className="fs-3 text-warning">Warning ! Nearest Deadline: </div>
      <div className="fs-6">
        Your activity named <strong>"Sports"</strong> is going to close in 3
        hours.
      </div>
      <div className="fs-6">
        Do you want to mark it as done?{" "}
        <button className="btn btn-sm btn-primary ms-2 me-2">Yes,please</button>
        <button className="btn btn-sm btn-danger btn-primary ms-2 me-2">
          Maybe later
        </button>
      </div>

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
        Your Unfinished Activity
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
          {activitiesData &&
            activitiesData.map((activity, idx) => {
              return (
                <tr key={idx}>
                  <th scope="row">{idx + 1}</th>
                  <td>{activity.Name}</td>
                  <td
                    className={`due-tab ${
                      getDuration(moment(), moment(activity.TimeStamp)) <= 24
                        ? `text-danger`
                        : ""
                    }`}
                  >
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(activity.TimeStamp)}
                    >
                      <div>{moment(activity.TimeStamp).fromNow()}</div>
                    </OverlayTrigger>
                  </td>
                  <td>{activity.Description}</td>
                  <td>{activity.Reminder ? "Yes" : "No"}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEdit(activity)}
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(activity.Id)}
                    >
                      Delete
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDelete(activity.Id)}
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
        Your Finished Activity
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
          {activitiesData &&
            activitiesData.map((activity, idx) => {
              return (
                <tr key={idx}>
                  <th scope="row">{idx + 1}</th>
                  <td>{activity.Name}</td>
                  <td
                    className={`due-tab ${
                      getDuration(moment(), moment(activity.TimeStamp)) <= 24
                        ? `text-danger`
                        : ""
                    }`}
                  >
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(activity.TimeStamp)}
                    >
                      <div>{moment(activity.TimeStamp).fromNow()}</div>
                    </OverlayTrigger>
                  </td>
                  <td>{activity.Description}</td>
                  <td>{activity.Reminder ? "Yes" : "No"}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEdit(activity)}
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(activity.Id)}
                    >
                      Delete
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDelete(activity.Id)}
                    >
                      Undo Finish
                    </button>
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
