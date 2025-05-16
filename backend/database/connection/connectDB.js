const { connect } = require("mongoose");

const connectingToDB = async (uri) => {
    const dbConnect = await connect(uri);
    console.log(`Connected with the Database`);
}


module.exports.connectingToDB = connectingToDB;