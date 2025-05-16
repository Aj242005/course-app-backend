const { model ,Schema, connect } = require("mongoose");
const { Admin } = require("../model/admin.model.js")
const { User } = require("../model/user.model.js");
const { Course } = require("../model/course.model.js");



const addUserDetailsToDB = ( userObj ) => {

    try{
        User.create({...userObj});
        console.log(`Created a User with username : ${userObj.username}`);
    }catch (err) {
        throw new Error(err);
    }

};


const addAdminDetailsToDB = (adminObj) => {

    try{
        Admin.create({...adminObj});
        console.log(`Created a Admin with username : ${adminObj.username}`);
    }catch(err){

        throw new Error(err);
    }

};

const addCourseDetailsToDB = (courseObj) => { //only by an admin

    try{
        Course.create(courseObj);
        console.log(`Created a New Course with title : ${courseObj.title}`);
    }catch(err) {
        throw new Error(err);
    }
};

module.exports.addUserDetailsToDB = addUserDetailsToDB;
module.exports.addAdminDetailsToDB = addAdminDetailsToDB;
module.exports.addCourseDetailsToDB = addCourseDetailsToDB;