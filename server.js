var express = require("express");
var axios = require("axios");
var password = encodeURIComponent("VamosVamoscr#7");
var cors = require("cors");
const connectionString = `mongodb+srv://87brandonn:${password}@cluster0.zums7.mongodb.net/mini-project?retryWrites=true&w=majority`;
const MongoClient = require("mongodb").MongoClient;

var groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
var app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

MongoClient.connect(
  connectionString,
  { useNewUrlParser: true },
  (err, client) => {
    const db = client.db("mini-project");
    const covidDataCollection = db.collection("covid-data");
    const covidLogsCollection = db.collection("covid-logs");
    if (err) return console.error(err);
    console.log("Connected to Database");

    app.listen(3001, () => {
      console.log("Server running on port 3001");
    });
    app.get("/test", (req, res) => {
      res.send("Hello");
    });
    app.get("/covid-data/all", async (req, res) => {
      covidDataCollection.find({}).toArray(function (err, response) {
        res.send(response);
      });
    });
    app.get("/covid-data/logs", async (req, res) => {
      covidLogsCollection.find({}).toArray(function (err, response) {
        res.send(groupBy(response, "createdOn"));
      });
    });
    app.get("/covid-data/fetch", async (req, res) => {
      axios
        .get("https://api.covidtracking.com/v1/us/daily.json")
        .then(async (response) => {
          var added = [];
          for (var i = 0; i < response.data.length; i++) {
            var getCount = await covidDataCollection.countDocuments({
              date: response.data[i].date,
            });
            if (getCount == 0) {
              covidDataCollection.insertOne(
                { ...response.data[i], createdOn: new Date() },
                (err, res) => {
                  if (err) throw err;
                  covidDataCollection.findOne(
                    { _id: res.insertedId },
                    (err, res) => {
                      covidLogsCollection.insertOne(
                        {
                          ...res,
                          createdOn: new Date(),
                        },
                        () => {
                          console.log("sucessfully added to logs!");
                        }
                      );
                      added.push(res);
                    }
                  );
                }
              );
            } else {
              console.log("already exist");
            }
          }
          res.send(added);
        });
    });
    app.get("/remove", (req, res) => {
      covidDataCollection.drop();
    });
    app.post("/covid-data", (req, res) => {});
    app.post("/quotes/", (req, res) => {
      res.send(req.body);
      console.log(req.body);
    });
  }
);
