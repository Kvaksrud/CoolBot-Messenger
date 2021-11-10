/**
 * Coolbot Messenger - register
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

async function handle(args,message){
    const SteamID = args[0];
    const regexp_steam_id = new RegExp('^[0-9]{17}$');

    if(regexp_steam_id.test(SteamID) !== true){
        messaging.ErrorMessage(message,'Invalid Steam ID','The supplied Steam ID is either invalid or missing from the command.\r```Usage: !register <my numeric Steam ID>```')
        return;
    }

    // Check if registered
    let registrationStatus = await backend.getRegistration(message.guild.id,message.member.id).catch((err)=>{messaging.Error(message,err);return;});

    if(!registrationStatus) return;
    if(registrationStatus.success === true){
        debug(registrationStatus.data.item.steam_id);
        messaging.WarningMessage(message,'You are already registered!',`Your account was registered at: ${registrationStatus.data.item.created_at}\nSteam ID: ${registrationStatus.data.item.steam_id}\n\nPlease create a ticket to remove the Steam ID from your account.`);
        return;
    }

    // Register
    let registration = await backend.register(message.guild.id,message.member.id,SteamID,message.member.user.username);
    debug(registration);
    if(registration.success === true){
        messaging.SuccessMessage(message,'Registration successfull','Your Steam ID was successfully registered to your Discord account.\rThank you for registering and I hope you enjoy our services.\r\rSince you now are registered, the registration channal has disapeard, and a couple of new channels has appeard!\r\rHave a nice day!',true)
        message.member.roles.add(process.env.DISCORD_ROLE_ID_REGISTERED);
    } else {
        message.ErrorMessage(message,'Registration failed',`I was unable to register you.\rPlease create a ticket with refrence ID #${registration.code}.`)
    }
    return;
}

module.exports = {
    handle
};