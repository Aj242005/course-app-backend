const jwt = require("jsonwebtoken");


const createAccessToken = (accessTokenSecret, expiryTime, signedObj) => {
    let accessToken = jwt.sign({
        ...signedObj
    }, accessTokenSecret, {
        algorithm: "HS256",
        expiresIn: `${expiryTime}`
    });
    
    return accessToken;
};

const createRefreshToken = (refreshTokenSecret, expiryTime, signedObj) => {
    let refreshToken = jwt.sign({
        ...signedObj
    }, refreshTokenSecret, {
        algorithm: "HS256",
        expiresIn: `${expiryTime}`
    });

    return refreshToken;
};

const checkForAccessToken = async (accessToken, accessTokenSecret) => {
    try {
        let obj = jwt.verify(accessToken, accessTokenSecret,{
            algorithms: "HS256"
        });
        return obj;
    } catch (err) {
        return err.name;
    }
};

const checkForRefreshToken = async (refreshToken, refreshTokenSecret) => {
    try {
        let obj = jwt.verify(refreshToken, refreshTokenSecret, {
            algorithms: "HS256"
        });
        return obj;
    } catch (err) {
        return err.name;
    }
};


module.exports.createAccessToken = createAccessToken;
module.exports.createRefreshToken = createRefreshToken;
module.exports.checkForAccessToken = checkForAccessToken;
module.exports.checkForRefreshToken = checkForRefreshToken;