require("dotenv").config();
const express = require('express')
const bodyparser = require('body-parser')
const path = require("path")
const app = express()
const port = process.env.PORT

// error handling
process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});

// setting the view engine and static files directory
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


// body-parser middleware
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())


// Database Connection
const sequelize = require("./utils/db");
const domain = require("./models/domain")
try {
    sequelize.authenticate().then(() => {
        console.log('Database Connected.');
    });
    // sequelize.sync({force: true});
} catch (err) {
    console.error('Unable to connect to the database:', err);
}



// routes
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);


app.get('/', (req, res) => {
  res.render('index', {result: {}});
})

app.listen(port, () => {
  console.log(`Whois Domain Lookup Utility is running on http://localhost:${port}`)
})