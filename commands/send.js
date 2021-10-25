// Give money from one player to another (bank balance to bank balance)
require('dotenv').config(); // Include environment variables
const config = require('../config.js'); // Config
const lang = require('../lang/default.js'); // Config
const backend = require('../library/backend.js'); // API / Database

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

async function handle(args,message){
    let reply;
    await message.reply('Working...').then((sentReply) => { reply = sentReply; });

    let registrationStatus = await backend.getRegistration(message.guild.id,message.member.id).catch((err) =>{
        if(err.code === 'ECONNREFUSED'){
            console.error(err);
            reply.edit(lang.MESSAGES.DISCORD.UNABLE_TO_CONNECT_TO_BACKEND).catch((errD) => {
                console.log('Discord Error:')
                console.error(errD);
            });
        } else {
            console.log('Unknown error');
            console.error(err);
            reply.edit('Well that was embarresing!\nI do not know what is wrong, but please submit a ticket with the refrence ``BOT#'+err.code+'-MONEY``').catch((errD) => {
                console.log('Discord Error:')
                console.error(errD);
            });
        };
        return null;
    });
    if(registrationStatus === null) // Makes sure to exit execution if it could not connect to the api
        return;

    console.log(registrationStatus);
    if(registrationStatus.success !== true){
        console.log(registrationStatus);
        reply.edit('You are not registered, so you are not elegible for a bank account. Please register before using our services. Thanks!');
        return;
    }

    mentionedUser = message.mentions.users.first();
    console.log('mentioned: ',mentionedUser);
    if(typeof mentionedUser === 'undefined' && !mentionedUser){
        reply.edit('Missing user mention as first argument.');
        return;
    }

    console.log('is numeric',isNumeric(args[1]))
    if(isNumeric(args[1]) === false){
        reply.edit('The amount supplied is invalid.');
        return;
    }

    const amount = Number(args[1]);
    if(0 >= amount){
        reply.edit('The amount supplied is invalid.');
        return;
    } else if(amount >= 1000000){
        reply.edit('Your account has a sending limit of ``1000000`` coins.');
        return;
    }

    /**
     * Bank account of sender
     */
     let senderBankAccount = await backend.getBankAccount(message.guild.id,message.member.id).then((result) => {
        console.log('sender bank account:',result);
        return result;
    }).catch((err) => {
        if(err.code === 'ECONNREFUSED'){
            console.error(err);
            reply.edit(lang.MESSAGES.DISCORD.UNABLE_TO_CONNECT_TO_BACKEND).catch((errD) => {
                console.log('Discord Error:')
                console.error(errD);
            });
        } else {
            console.log('Unknown error from command');
            console.error(err);
            reply.edit('Well that was embarresing!\nI do not know what is wrong, but please submit a ticket with the refrence ``BOT#'+err.code+'-MONEY``').catch((errD) => {
                console.log('Discord Error:')
                console.error(errD);
            });
        };
    });

    if(senderBankAccount.code === 0){ // Has bank account
        if(amount > senderBankAccount.data.item.balance){ // Insufficient funds
            reply.edit('There are insufficient funds in your bank account to complete this transaction.\nYou can deposit money from your wallet (cash) to you bank account (balance) by using !deposit <amount>.');
            return;
        }

        let transfer = await backend.doBankTransactionSend(message.guild.id,message.member.id,mentionedUser.id,amount).catch((err) => {
            if(err.code === 'ECONNREFUSED'){
                console.error(err);
                reply.edit(lang.MESSAGES.DISCORD.UNABLE_TO_CONNECT_TO_BACKEND).catch((errD) => {
                    console.log('Discord Error:')
                    console.error(errD);
                });
            } else {
                console.log('Unknown error from command');
                console.error(err);
                reply.edit('Well that was embarresing!\nI do not know what is wrong, but please submit a ticket with the refrence ``BOT#'+err.code+'-MONEY``').catch((errD) => {
                    console.log('Discord Error:')
                    console.error(errD);
                });
            };
        })

        if(transfer.code === 0){
            reply.edit(args[0] + ' received your money transfer.\n\nYour new account balance is:\n```Wallet (cash): '+transfer.data.bankAccount.wallet.toString()+'\nBank (balance): '+transfer.data.bankAccount.balance.toString()+'```');
        } else {
            reply.edit('Unknown exception. Please contact support with code SEND#TRANSFER-'+transfer.code.toString());
        }
        return;
    } else if(senderBankAccount.code === 301){ // Does not have bank account
        reply.edit('You do not currenlty have a bank account with us, so you are naturally unable to send anyone money! Please do some work or have someone send you some money and we will open an account for you!');
    } else {
        reply.edit('I was able to talk to the bank manager, but we did not find your detals. Please have contact support by creating a ticket.');
    }

    return;
}

module.exports = {
    handle
};