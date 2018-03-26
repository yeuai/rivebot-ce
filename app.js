var express = require("express");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");

var config = require("config");
var controllers = require("./app/controllers");

var app = express();
var port = process.env.PORT || 3000;

// db info
var constr = `${config.get('dbConfig.DB_HOST')}/${config.get('dbConfig.DB_NAME')}`
mongoose.connect(constr, (err) => {
    if (!err) {
        console.log('connect db ok: ', constr)
    } else {
        console.log('connect db nok, err: ', constr, err)
    }
});

app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.set("view engine", "ejs");

// bind api controllers
app.use('/api', controllers);

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
})

app.listen(port, function() {
    console.log("App listening on port: " + port);
});

