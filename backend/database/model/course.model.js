const { Schema, model } = require("mongoose");
const { type } = require("os");

const courseSchema = new Schema({
    courseId : {
        type : Number,
        required : true,
        unique : true,
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    imageLink : {
        type : String,
        required : true
    },
    isLive : {
        type : Boolean,
        required : true,
        default : 0
    }
}, {
    timestamps : true
})

const Course = model('Course', courseSchema);

module.exports.Course = Course;