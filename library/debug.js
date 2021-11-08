require('dotenv').config(); // Include environment variables

function debug(message){
    if(process.env.DEBUG == "true"){
        console.log('DEBUG LOGGING',message);
    }
    return;
}

module.exports = {
    debug
};