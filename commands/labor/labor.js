/**
 * Coolbot Messenger - labor
 * 
 * AUTHOR
 * Patrick Kvaksrud <patrick@kvaksrud.no>
 * https://github.com/Kvaksrud/CoolBot-Messenger
 * 
 * DESCRIPTION
 * This bot was originally made for the TCGC community
 * under MIT licensing to allow re-use of code.
 */
const lang = require('./../../lang/default.js'); // Config
const backend = require('./../../library/backend.js'); // API / Database
const { debug } = require('./../../library/debug.js');
const messaging = require('./../../library/messaging.js');

async function handle(args,message){
    /**
     * Require user to be registered
     * - Also fetches registration data like Steam ID
     */
    let registrationStatus = await backend.getRegistration(message.guild.id,message.member.id).catch((err)=>{messaging.Error(message,err);return;});
    if(!registrationStatus) return;
    debug(registrationStatus);
    if(registrationStatus.success !== true){ messaging.ErrorMessage(message,'You are not registered','You have to register to be elegible for this service.'); return; }

    /**
     * Labor command
     */
    let laborStatus = await backend.doLabor(message.guild.id,message.member.id).catch((err)=>{messaging.Error(message,err);return;});
    debug(laborStatus);

    if(laborStatus.code === 263){
        /**
         * Labor Code 263 - You are too tired to work
         */
        const moment = require('moment');
        const theMoment = moment().add(laborStatus.data.seconds_left,'s');
        messaging.WarningMessage(message,'You are too tied to work now',`You can work again <t:${theMoment.unix()}:R>.`)
        return;
    } else if(laborStatus.code === 0){
        /**
         * Labor Code 0 - You just worked
         */
        messaging.Labor(message,laborStatus);
        return;
    } else {
        /**
         * Unknows Reply - Code is not handled in bot. Should not happen.
         */
        messaging.ErrorMessage(message,'Unknown Error','An unknown reply was received from the department of workaholics.\rPlease create a ticket to have this looked at.');
        return;
    }
    return;
}

module.exports = {
    handle
};