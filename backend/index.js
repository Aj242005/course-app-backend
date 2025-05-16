const express = require("express");
const cors = require("cors");
const { connectingToDB } = require("./database/connection/connectDB");
require("dotenv/config");
const { createAccessToken, createRefreshToken, checkForAccessToken, checkForRefreshToken } = require("./utils/dealingWithJWT.js");
const { Admin } = require("./database/model/admin.model.js")
const { User } = require("./database/model/user.model.js");
const { Course } = require("./database/model/course.model.js");
const { encryptTheGivenPassword, checkForTheValidPassword } = require("./utils/dealingWithPassword.js");
const { addAdminDetailsToDB, addCourseDetailsToDB, addUserDetailsToDB } = require("./database/connection/addToDB.js");
const { Model } = require("mongoose");
const { generateUniqueNumberEveryTime } = require("./utils/usefulFunctions.js");

(() => {
    connectingToDB(`${process.env.MONGO_DB_URI}`);
})()

let liveAdmins = [];
let liveUsers = [];
let courses = [];

const App = express();

App.use(express.json());
App.use(cors());


const checkForUniqueUsernameAdmin = async (req, res, next) => {
    let userName = req.body.username;
    if (await Admin.exists({ username: userName })) {
        res.status(409).send(`Username :  ${userName} Already Exists`);
    }
    else {
        next();
    }
}

const checkForUniqueUsernameUser = async (req, res, next) => {
    let userName = req.body.username;
    if (await User.exists({ username: userName })) {
        res.status(409).send(`Username :  ${userName} Already Exists`);
    }
    else {
        next();
    }
}


const checkForBlankValues = (req, res, next) => {
    try {
        let username = req.body.username ?? "";
        let password = req.body.password ?? "";
        if (username && password) {
            next();
        }
        else {
            res.status(204).send(`Please Enter a valid password or username`);
        }
    } catch (err) {
        res.status(204).send("Enter valid username and password");
    }
}

const adminAuthentication = async (req, res, next) => {

    //console.log("A");
    let accessToken = req.body.accessToken ?? "";
    let refreshToken = req.body.refreshToken ?? "";
    if (accessToken && refreshToken) {
        //console.log("B");
        let accessObj = await checkForAccessToken(accessToken,process.env.ACCESS_TOKEN_SECRET);
        //console.log(accessObj);
        if (accessObj === "TokenExpiredError"){
            //console.log("C");
            let refreshObj = await checkForRefreshToken(refreshToken,process.env.REFRESH_TOKEN_SECRET);
            if (refreshObj === "TokenExpiredError"){
                //console.log("D");
                //if both of the tokens are expired for the authentication purpose
                let userName = req.headers.username;
                let passWord = req.headers.password;
                let mongoInstance = await Admin.findOne({ username: userName }).exec();
                if (mongoInstance != null) {
                    checkForTheValidPassword(mongoInstance.toJSON().password, passWord);
                    console.log(`valid password for user : ${userName}`);
                    let messageObj = {
                        message : "both of your tokens are expired now giving you the new ones",
                        accessToken : createAccessToken(process.env.ACCESS_TOKEN_SECRET,process.env.TIME_VALIDITY_FOR_ACCESS_TOKEN,{
                            username : userName,
                            password: mongoInstance.toJSON().password
                        }),
                        refreshToken: createRefreshToken(process.env.REFRESH_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_REFRESH_TOKEN, {
                            username: userName,
                        })
                    }
                    res.setHeader("accessToken",messageObj.accessToken);
                    res.setHeader("refreshToken", messageObj.refreshToken);
                    mongoInstance.updateOne({
                        accessToken : messageObj.accessToken,
                        refreshToken : messageObj.refreshToken
                    }).exec().then((something) => {
                        console.log(something);
                    })
                    next();
                    
                }
                else {
                    res.status(401).send("Unauthorized");
                }
            }
            else{
                if (refreshObj === "JsonWebTokenError"){
                    res.status(401).send("Unauthorized")
                }
                else{
                    if(refreshToken === (await Admin.findOne({username : refreshObj.username}).exec()).toJSON().refreshToken){
                        console.log(refreshObj);
                        let adminObj = await Admin.findOne({username : refreshObj.username}).exec();
                        let messageObj = {
                            message : "Your access Token is expired providing you a new one",
                            accessToken : createAccessToken(process.env.ACCESS_TOKEN_SECRET,process.env.TIME_VALIDITY_FOR_ACCESS_TOKEN,{
                                username : refreshObj.username,
                                password : adminObj.toJSON().password
                            })
                        }
                        res.setHeader("accessToken", messageObj.accessToken);
                        adminObj.updateOne({
                            accessToken : messageObj.accessToken
                        }).exec().then( (something) => {
                            console.log(something);
                        })
                        next();
                        //if only accessToken is expired for the authentication purpose
                    }
                    else{
                        res.status(401).send("Unauthorized");
                    }
                }
            }
        }
        else{
            if (accessObj === "JsonWebTokenError"){
                res.status(401).send("Unauthorized");
            }
            else{
                if(accessToken === (await Admin.findOne({username : accessObj.username}).exec()).toJSON().accessToken){
                    next();
                }
                else{
                    res.status(401).send("Unauthorized");
                }
            }
            //none of the token is expired
        }
    }
    else{
        //console.log("E");
        let userName = req.headers.username;
        let passWord = req.headers.password;
        let mongoInstance = await Admin.findOne({username : userName}).exec();
        if(mongoInstance != null){
            checkForTheValidPassword(mongoInstance.toJSON().password,passWord);
            console.log(`valid password for user : ${userName}`);
            next();
        }
        else{
            res.status(401).send("Unauthorized");
        }
    }

}

const userAuthentication = async (req,res,next) => {
    let accessToken = req.body.accessToken ?? "";
    let refreshToken = req.body.refreshToken ?? "";
    if (accessToken && refreshToken) {
        //console.log("B");
        let accessObj = await checkForAccessToken(accessToken, process.env.ACCESS_TOKEN_SECRET);
        //console.log(accessObj);
        if (accessObj === "TokenExpiredError") {
            //console.log("C");
            let refreshObj = await checkForRefreshToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            if (refreshObj === "TokenExpiredError") {
                //console.log("D");
                //if both of the tokens are expired for the authentication purpose
                let userName = req.headers.username;
                let passWord = req.headers.password;
                let mongoInstance = await User.findOne({ username: userName }).exec();
                if (mongoInstance != null) {
                    checkForTheValidPassword(mongoInstance.toJSON().password, passWord);
                    console.log(`valid password for user : ${userName}`);
                    let messageObj = {
                        message: "both of your tokens are expired now giving you the new ones",
                        accessToken: createAccessToken(process.env.ACCESS_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_ACCESS_TOKEN, {
                            username: userName,
                            password: mongoInstance.toJSON().password
                        }),
                        refreshToken: createRefreshToken(process.env.REFRESH_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_REFRESH_TOKEN, {
                            username: userName,
                        })
                    }
                    res.setHeader("accessToken", messageObj.accessToken);
                    res.setHeader("refreshToken", messageObj.refreshToken);
                    mongoInstance.updateOne({
                        accessToken: messageObj.accessToken,
                        refreshToken: messageObj.refreshToken
                    }).exec().then((something) => {
                        console.log(something);
                    })
                    req.username = userName;
                    next();

                }
                else {
                    res.status(401).send("Unauthorized");
                }
            }
            else {
                if (refreshObj === "JsonWebTokenError") {
                    res.status(401).send("Unauthorized")
                }
                else {
                    if (refreshToken === (await User.findOne({ username: refreshObj.username }).exec()).toJSON().refreshToken) {
                        console.log(refreshObj);
                        let userObj = await User.findOne({ username: refreshObj.username }).exec();
                        let messageObj = {
                            message: "Your access Token is expired providing you a new one",
                            accessToken: createAccessToken(process.env.ACCESS_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_ACCESS_TOKEN, {
                                username: refreshObj.username,
                                password: userObj.toJSON().password
                            })
                        }
                        res.setHeader("accessToken", messageObj.accessToken);
                        adminObj.updateOne({
                            accessToken: messageObj.accessToken
                        }).exec().then((something) => {
                            console.log(something);
                        })
                        req.username = refreshObj.username;
                        next();
                        //if only accessToken is expired for the authentication purpose
                    }
                    else {
                        res.status(401).send("Unauthorized");
                    }
                }
            }
        }
        else {
            if (accessObj === "JsonWebTokenError") {
                res.status(401).send("Unauthorized");
            }
            else {
                if (accessToken === (await User.findOne({ username: accessObj.username }).exec()).toJSON().accessToken) {
                    req.username = accessObj.username;
                    next();
                }
                else {
                    res.status(401).send("Unauthorized");
                }
            }
            //none of the token is expired
        }
    }
    else {
        //console.log("E");
        let userName = req.headers.username;
        let passWord = req.headers.password;
        let mongoInstance = await User.findOne({ username: userName }).exec();
        if (mongoInstance != null) {
            checkForTheValidPassword(mongoInstance.toJSON().password, passWord);
            console.log(`valid password for user : ${userName}`);
            req.username = userName;
            next();
        }
        else {
            res.status(401).send("Unauthorized");
        }
    }
};




const nonEmptyCourseContent = (req,res,next) => {
    let courseObj = {
        title : req.body.title ?? "",
        description: req.body.description ?? "",
        price: req.body.price ?? "",
        imageLink: req.body.imageLink ?? "",
        isLive : req.body.isLive ?? 0
    }
    if (courseObj.title && courseObj.description && courseObj.price && courseObj.imageLink){
        req.course = courseObj;
        next()
    }
    else{
        res.status(400).send("There should be course content");
    }
}

const getTheCourses = async ( req, res, next ) => {
    courses = await Course.find().exec();
    next();
}




//writing all the admin routes first
App.post("/admin/signup", checkForBlankValues, checkForUniqueUsernameAdmin, async (req, res, next) => {
    let userName = req.body.username;
    let passWord = await encryptTheGivenPassword(req.body.password, Number(process.env.SALT_ROUNDS));
    let adminObj = {
        username: userName,
        password: passWord,
        accessToken: await createAccessToken(process.env.ACCESS_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_ACCESS_TOKEN, {
            username: userName,
            password: passWord
        }),
        refreshToken: await createRefreshToken(process.env.REFRESH_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_REFRESH_TOKEN, {
            username: userName
        })
    }
    addAdminDetailsToDB(adminObj);
    res.status(201).json({
        message: `Admin with username : ${userName} Created Successfully`,
        accessToken: adminObj.accessToken,
        refreshToken: adminObj.refreshToken
    })
})


App.post("/admin/login", adminAuthentication,(req,res,next)=>{
    console.log("Admin Logged In Successfully");
    res.status(200).send("Admin logged In successfully");
})

App.post("/admin/courses", nonEmptyCourseContent ,adminAuthentication, (req,res,next) => {
    let courseObj = {courseId : generateUniqueNumberEveryTime() ,...req.course};
    console.log(courseObj);
    addCourseDetailsToDB(courseObj);
    res.status(201).send(`New Course Created with courseID : ${courseObj.courseId} and title : ${courseObj.title}`);
})

App.put("/admin/courses/:courseId", adminAuthentication , async(req,res,next) => {
    let courseID = req.params.courseId;
    let {title, description, price, imageLink, isLive} = req.body;
    if(title || description || price || imageLink || isLive){
        var courseObj = await Course.findOne({
            courseId: courseID
        });
        console.log(courseObj);
        if (courseObj === null){
            console.log("C");
            res.status(404).end("Not Found");
            console.log(courseObj);
        }
        else{
            courseObj.updateOne({
                courseId: courseObj.courseId,
                title: title ?? courseObj.title,
                description: description ?? courseObj.description,
                price: price ?? courseObj.price,
                imageLink: imageLink ?? courseObj.imageLink,
                isLive: isLive ?? courseObj.isLive
            }).exec()
            .then( (result) => {
                console.log("D");
                res.status(200).send("Updated Successfully")
                console.log(result);
            } )
            .catch( (err) => {
                res.status(400).send("Bad Request");
                console.log("E");
                console.log(err);
            })
        }
    }
    else{
        res.status(400).send("Bad Request");
    }
})

App.get("/admin/courses" , adminAuthentication, getTheCourses ,(req,res,next) => {
    res.status(200).send(courses);
    console.log(`All the courses fetched by the admin`);
})

App.post("/users/signup", checkForBlankValues ,  async(req,res,next) => {
    let userName = req.body.username;
    let passWord = await encryptTheGivenPassword(req.body.password, Number(process.env.SALT_ROUNDS));
    let userObj = {
        username: userName,
        password: passWord,
        accessToken: await createAccessToken(process.env.ACCESS_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_ACCESS_TOKEN, {
            username: userName,
            password: passWord
        }),
        refreshToken: await createRefreshToken(process.env.REFRESH_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_REFRESH_TOKEN, {
            username: userName
        })
    }
    addUserDetailsToDB(userObj);
    res.status(201).json({
        message: `User with username : ${userName} Created Successfully`,
        accessToken: userObj.accessToken,
        refreshToken: userObj.refreshToken
    })
})

App.post("/users/login", userAuthentication, (req,res,next)=>{
    console.log(`User loggedIn successfully`);
    res.status(200).send("User Logged In successfully");
})

App.get("/users/courses", userAuthentication, getTheCourses, (req,res,next) => {
    let localCourses = courses.filter( (items) => {
        if(items.isLive){
            return items;
        }
    })
    res.status(200).send(localCourses);
    console.log(`All the live courses fetched by the user`);
})

App.post("/users/courses/:courseId", userAuthentication, async (req,res,next) => {
    let courseID = req.params.courseId;
    let courseObj = await (Course.findOne({courseId : courseID})).exec();
    console.log(courseObj);
    if(courseObj === null || !courseObj.isLive){
        res.status(404).end("Not Found");
    }
    else{
        let userObj = await (User.findOne({username : req.username})).exec();
        let purchasedCourseArray = userObj.purchasedCourses;
        purchasedCourseArray.push(courseObj)
        userObj.updateOne({
            purchasedCourses : purchasedCourseArray
        }).exec()
        .then( (result) => {
            console.log(result);
            res.status(200).send(`Purchased Course : ${courseObj.title} Successfully !!!`);
        })
        .catch( (err) => {
            console.log(err);
            res.status(400).send("Bad Request");
        })
    }
});

App.get("/users/purchasedCourses", userAuthentication, async (req,res,next) => {
    let userObj = await User.findOne({username : req.username}).exec() ;
    let purchased = [];
    for(let i  = 0; i <userObj.purchasedCourses.length; i++ ){
        let course = await Course.findOne({ _id: userObj.purchasedCourses[i] }).exec();
        course = course.toJSON();
        await purchased.push(course);
    }
    console.log(purchased);
    res.status(200).send(purchased);
})


App.use( (req,res,next)=>{
    res.status(404).end(`Not Found`);
})

App.listen(process.env.PORT, () => {
    console.log(`Server Listening on the port : ${process.env.PORT}`);
})