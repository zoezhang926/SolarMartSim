var express = require("express"),
  app = express(),
  request = require("request"),
  solarModules = require("./public/modules.json"),
  spawn = require('child_process').spawn,

  pwd = spawn('python', ['public/test.py']);

// ***************************************************
// check if the python library and environment are correct
pwd.stderr.on("data", function(err) {
  console.log("python error msg: ", err.toString());
});

pwd.stdout.on("data", function(output) {
  console.log(output.toString());
});
// ***************************************************

app.set("view engine", "ejs");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", function(req, res) {
  var moduleNames = Object.keys(solarModules);
  res.render("home", { solarModules: solarModules, moduleNames: moduleNames });
});

// POST selected solar module and parameters to run python simulation with pylib
app.post("/simulate", function(req, res) {
  var data = JSON.stringify(req.body);
  var resultString = "";
  console.log(data);
  var py = spawn('python', ['public/simulate.py', data]);
  // py.stdin.write(data);
  // py.stdin.end();

  py.stderr.on('data', function(data) {
    console.log(`python simulation script error: ${data}`);
  });
  py.stdout.on('data', function(result) {
    resultString += result.toString();
  });
  py.stdout.on('end', function() {
    console.log('simulation result: ', resultString);
    res.json(resultString);
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/contact", function(req, res) {
  res.render("contact");
});

// app.get("/movie-search", function(req, res){
//   res.render("search");
// });

app.get("/movie-search", function(req, res) {
  var search = req.query.search;
  if (search != null) {
    var url = "http://omdbapi.com/?s=" + search + "&apikey=thewdb";
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body);
        res.render("search", { data: data });
      }
    });
  }
  else {
    res.render("search", { data: null });
  }
});

app.listen(process.env.PORT || 8080,
  // process.env.IP, 
  function() {
    console.log("Start SolarMart server!!!");
  });
