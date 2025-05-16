const { Schema,model } = require("mongoose");

const adminSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique : true,
    },
    password: {
        type : String,
        required : true
    },
    accessToken : {
        type : String,
        required : true,
        unique : true
    },
    refreshToken : {
        type : String,
        required : true,
        unique : true
    }
},{
    timestamps : true
})

const Admin = model('Admin', adminSchema);

module.exports.Admin = Admin;