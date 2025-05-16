const bcrypt = require("bcrypt");

const encryptTheGivenPassword = async (password, saltRounds) => {
    let salt = await bcrypt.genSalt(saltRounds);
    let hashedPassword = await bcrypt.hash(password,salt);
    return hashedPassword;
}

const checkForTheValidPassword = async (hashFromDB , password) => {
    let checkedPassword = await bcrypt.compare(password,hashFromDB);
    if(checkedPassword == true){
        console.log(`The password entered is true`);
    }
    else{
        console.log(`The password Entered is incorrect`);
    }
    return checkedPassword;
}

module.exports.encryptTheGivenPassword = encryptTheGivenPassword;
module.exports.checkForTheValidPassword = checkForTheValidPassword;