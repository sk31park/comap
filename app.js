var createError = require("http-errors");
var compression = require('compression');
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var favicon = require("serve-favicon");
var ip = require("ip");

var indexRouter = require("./routes/index");

var app = express();

// view engine setup
app.use(compression());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(favicon(path.join(__dirname, "public/images", "favicon.ico")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "store")));

app.get('*', function(req, res, next) {
  if (req.get("x-forwarded-proto") != "https" && ip.address() == "10.0.0.43") {
    res.set("x-forwarded-proto", "https");
    res.redirect("https://" + req.get("host") + req.url);
  } else {
    next();
  }
})

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
