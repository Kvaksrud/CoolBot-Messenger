/**
 * Coolbot Messenger
 * 
 * AUTHOR
 * Patrick Kvaksrud <patrick@kvaksrud.no>
 * https://github.com/Kvaksrud/CoolBot-Messenger
 * 
 * DESCRIPTION
 * This bot was originally made for the TCGC community
 * under MIT licensing to allow re-use of code.
 */
function debug(message){
    if(process.env.DEBUG == "true"){
        console.log('DEBUG LOGGING',message);
    }
    return;
}

module.exports = {
    debug
};