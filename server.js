const express = require("express");
const bodyParser = require("body-parser");
const user = require("./routes/user");
const event = require("./routes/event");
const InitiateMongoServer = require("./config/db");

InitiateMongoServer();

const app = express();

app.set('view engine', 'ejs');
app.set('views' + __dirname + '/views')


const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
//   res.json({ message: "API Working" });
    res.render('index', {title: "Home"});
});

app.get("/signup", (req, res) => {
    res.render('signup');
});

app.get("/login", (req, res) => {
    res.render('login');
});


app.use("/user", user);
// app.use("/event", event);

app.listen(PORT, () => {
  console.log(`Server Started at PORT ${PORT}`);
});