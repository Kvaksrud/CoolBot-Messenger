/**
 * Coolbot Messenger - Money
 * 
 * AUTHOR
 * Patrick Kvaksrud <patrick@kvaksrud.no>
 * https://github.com/Kvaksrud/CoolBot-Messenger
 * 
 * DESCRIPTION
 * This bot was originally made for the TCGC community
 * under MIT licensing to allow re-use of code.
 */
const lang = require('../../lang/default.js'); // Config
const backend = require('../../library/backend.js'); // API / Database
const messaging = require('../../library/messaging.js');
const { debug } = require('../../library/debug.js');

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
     * Get bank account statement
     */
    const bankStatement = await backend.getBankAccount(message.guild.id,message.member.id).catch((err)=>{messaging.Error(message,err);return;});
    if(!bankStatement) return;

    debug(bankStatement);
        if(bankStatement.code === 0)
            /**
             * Reply with banking balance
             */
            messaging.BankingBalance(message,bankStatement.data.item.balance,bankStatement.data.item.wallet);
        else if(bankStatement.code === 301)
            /**
             * No bank account.
             * I.e.: No money has been made or received
             */
            messaging.NoBankAccount(message);
        else
            /**
             * Unknown error. Should not happen.
             */
            messaging.ErrorUnknown(message);
    return;
}

module.exports = {
    handle
};