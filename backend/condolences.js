const adminAuthentication = async (req, res, next) => {
    let accessToken = req.headers.accessToken ?? "";
    let refreshToken = req.headers.refreshToken ?? "";
    if (accessToken && refreshToken) {
        let accessObj = await checkForAccessToken(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if (accessObj.name != undefined) {
            if (accessObj.name === "TokenExpiredError") {
                let refreshObj = await checkForRefreshToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                if (refreshObj.name != undefined) {
                    if (refreshObj.name === "TokenExpiredError") {

                        console.log(`Access Token and Refresh Token Expired`)
                        let userName = req.headers.username;
                        let passWord = req.headers.password;



                        if (await Admin.exists({ username: userName })) {
                            let mongoObjInstance = Admin.findOne({ username: userName });

                            mongoObjInstance.exec()
                                .then((obj) => {
                                    if (checkForTheValidPassword(obj.toJSON().password, passWord) == true) {
                                        let messageObj = {
                                            message: `Access Token and Refresh Token Expired`,
                                            accessToken: createAccessToken(process.env.ACCESS_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_ACCESS_TOKEN, {
                                                username: userName,
                                                password: passWord
                                            }),
                                            refreshToken: createRefreshToken(process.env.REFRESH_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_REFRESH_TOKEN, {
                                                username: userName
                                            })
                                        };
                                        mongoObjInstance.updateOne({
                                            accessToken: messageObj.accessToken,
                                            refreshToken: messageObj.refreshToken
                                        })
                                        res.json(messageObj);
                                        next();
                                    }
                                })
                        }
                    }
                    else {
                        res.status(401).send("Unauthorized");
                    }
                }
                else {
                    if (await Admin.exists({ username: refreshObj.username })) {
                        let mongoObjInstance = Admin.findOne({ username: refreshObj.username });
                        mongoObjInstance.exec()
                            .then((obj) => {
                                let messageObj = {
                                    message: "Access Token Expired but refresh token is still alive issuing you a new access token",
                                    accessToken: createAccessToken(process.env.ACCESS_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_ACCESS_TOKEN, {
                                        username: refreshObj.username,
                                        password: obj.toJSON().password
                                    })
                                }
                                mongoObjInstance.updateOne({ accessToken: messageObj.accessToken });
                                res.json(messageObj);
                                next();
                            })
                    }
                }
            }
            else {
                res.status(401).send("Unauthorized");
            }
        }
        else {
            if (await Admin.exists({ username: accessObj.username })) {
                next();
            }
            else {
                res.status(404).send("Not Found");
            }
        }
    }
    else {
        let userName = req.headers.username;
        let passWord = req.headers.password;
        if (await Admin.exists({ username: userName })) {
            if (checkForTheValidPassword((await Admin.findOne({ username: userName })).password, passWord == true)) {
                res.json({
                    message: `Access Token and Refresh Token Expired`,
                    accessToken: await createAccessToken(process.env.ACCESS_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_ACCESS_TOKEN, {
                        username: userName,
                        password: passWord
                    }),
                    refreshToken: await createRefreshToken(process.env.REFRESH_TOKEN_SECRET, process.env.TIME_VALIDITY_FOR_REFRESH_TOKEN, {
                        username: userName
                    })
                });
                next();
            }
        }
    }

}