const generateUniqueNumberEveryTime = () => {
    return (Math.floor((Math.random()+1)*100000));
}

module.exports.generateUniqueNumberEveryTime = generateUniqueNumberEveryTime;