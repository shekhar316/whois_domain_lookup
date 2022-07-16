const router = require("express").Router();
const {fetchWhoIsInfo} = require("../controllers/api");

router.post("/getinfo", fetchWhoIsInfo);

module.exports = router;