var express = require("express");
var path = require("path");
var app = express();
var cors = require('cors');
var session = require("express-session");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(
  session({
    secret: "dndkimleemoonchoi",
    resave: false,
    saveUninitialized: true,
    maxAge: 3600000
  })
);

app.use(cors())
var indexRouter = require("./routes/index")();
app.use("/", indexRouter);

var contractRouter = require("./routes/contract")();
app.use("/contract", contractRouter);

var payment = require("./routes/payment")();
app.use("/payment", payment);
var port = 8080;
app.listen(port, function () {
  console.log("server start", port);
});
