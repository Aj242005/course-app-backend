const { Schema, model , Mongoose } = require("mongoose");

const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    purchasedCourses : [{
        type : Schema.Types.ObjectId,
        ref : "Course",
    }],
    accessToken: {
        type: String,
        required: true,
        unique: true
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true
    }
})


const User = model('User', userSchema);

module.exports.User = User;