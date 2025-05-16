const crypto = require("crypto");
const mongoose = require("mongoose");
require("dotenv/config");
const { Admin } = require("./database/model/admin.model.js");
const { connectingToDB } = require("./database/connection/connectDB.js");

connectingToDB(process.env.MONGO_DB_URI);
setTimeout(()=>{},3000)

Admin.findOne({username : "Aj242005"}).exec()
.then((something)=>{
    console.log(something.toJSON().password)
})