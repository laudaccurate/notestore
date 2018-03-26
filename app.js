const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const key = require("./config/keys");
const bodyParser = require("body-parser");

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(
  "mongodb://localhost:27017/notes",
  { useMongoClient: true },
  err => {
    if (err) console.log(err);
    else console.log("Database connection successful");
  }
);
const db = mongoose.connection;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    resave: true,
    secret: key,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: db
    })
  })
);

app.set("view engine", "pug");
app.set("views", "./views");
app.use(express.static("./public"));

app.use((req, res, next) => {
  res.locals.user = req.session.userId;
  return next();
});

require("./routes")(app);

app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  return next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("error", { title: "Error", err, message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("server is running on PORT", PORT);
});
