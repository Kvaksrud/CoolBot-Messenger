/**
 * Coolbot Messenger - Deposit
 * 
 * AUTHOR
 * Patrick Kvaksrud <patrick@kvaksrud.no>
 * https://github.com/Kvaksrud/CoolBot-Messenger
 * 
 * DESCRIPTION
 * This bot was originally made for the TCGC community
 * under MIT licensing to allow re-use of code.
 */
 const backend = require('./../../library/backend.js'); // API / Database
 const messaging = require('./../../library/messaging.js');
 const { debug } = require('./../../library/debug.js');
const { Message } = require('discord.js');
  
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
     * Build string to use in backend
     */
    const workString = args.join(' ');
    const workArr = workString.split('|');
    debug([workString,workArr,workArr.length]);

    /**
     * Validate input
     */
    if(workArr.length !== 3){
        messaging.ErrorMessage(message,'Invalid syntax','Your message should look like this example:\r```!laborreply You did a thing and made|doing nothing|balance\ror\r!laborreply You found|on a bench and kept it for yourself|wallet```\rThe build up of the command is ``<before automatic money text>|<after automatic money text>|<target, whitch is balance or wallet>``.\rBefore money text(pipe, no spaces)After money text(pipe, no spaces)Target.');
        return;
    }
    if(workArr[2].trim().toLowerCase() !== "balance" && workArr[2].trim().toLowerCase() !== "wallet"){
        messaging.ErrorMessage(message,'Invalid money target','The target, after the second pipe(|) can be either ``balance`` (bank account) or ``wallet`` (cash).');
        return;
    }

    /**
     * Send suggestion to backend
     */
    let suggestionRequest = await backend.laborSuggest(message.guild.id,message.member.id,workArr[0].trim(),workArr[1].trim(),workArr[2].trim()).catch((err)=>{messaging.Error(message,err);return;});
    if(!suggestionRequest) return;
    debug(suggestionRequest);

    if(suggestionRequest.code === 0)
        /**
         * Code 0 - Success
         */
        messaging.SuccessMessage(message,'Thank you for your suggestion!',
            'Your suggestion has been added to an approval queue and will be processed by an administrator.\r\r'+
            'You registered contribution:\r``'+workArr[0].trim()+'`` :moneybag: 1337 ``'+workArr[1].trim()+'``\r' +
            'The destination for the money was ``'+workArr[2].trim()+'``'
            );
    else if(suggestionRequest.code === 262)
        /**
         * Code 262 - Already exists
         */
        messaging.ErrorMessage(message,'This suggestion or reply already exist','To avoid having duplicate entries we check against existing records, and this time we found a matching one! Try again with a new suggestion :smile:');
    else
        messaging.ErrorUnknown(message);

    return;
 }
 
 module.exports = {
     handle
 };