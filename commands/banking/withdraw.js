/**
 * Coolbot Messenger - Withdraw
 * 
 * AUTHOR
 * Patrick Kvaksrud <patrick@kvaksrud.no>
 * https://github.com/Kvaksrud/CoolBot-Messenger
 * 
 * DESCRIPTION
 * This bot was originally made for the TCGC community
 * under MIT licensing to allow re-use of code.
 */
const backend = require('../../library/backend.js'); // API / Database
const messaging = require('../../library/messaging.js');
const { debug } = require('../../library/debug.js');
const { isNumeric } = require('./../../library/helpers.js');

async function handle(args,message){
    /**
     * Require user to be registered
     * - Also fetches registration data like Steam ID
     */
    let registrationStatus = await backend.getRegistration(message.guild.id,message.member.id).catch((err)=>{messaging.Error(message,err);return;});
    if(!registrationStatus) return;
    debug(registrationStatus);
    if(registrationStatus.success !== true){ messaging.ErrorMessage(message,'You are not registered','You have to register to be elegible for this service.'); return; }

    if(isNumeric(args[0]) === false){
        if(args[0].toLowerCase() === 'all'){
            /**
             * Withdraw all money in balance to wallet
             * - Start by fetching current bank statement
             */
            let bankAccount = await backend.getBankAccount(message.guild.id,message.member.id).catch((err)=>{messaging.Error(message,err);return;});
            if(!bankAccount) return;

            debug(bankAccount);
            if(bankAccount.code === 0){
                args[0] = bankAccount.data.item.balance;
                if(bankAccount.data.item.balance === 0){
                    /**
                     * There is no money in the balance
                     */
                    messaging.InsufficientFunds(message);
                    return;
                }
            } else if(bankAccount.code === 301){
                /**
                 * Code 301 - No bank account
                 * - No bank account may be because the user has not worked or received any money
                 */
                messaging.NoBankAccount(message);
                return;
            } else {
                /**
                 * Unknown error - Should not happen if backend is working as intended
                 */
                messaging.ErrorUnknown(message);
                return;
            }
        } else {
            /**
             * Amount supplied is invalid
             */
            messaging.TransactionInvalidAmount(message);
            return;
        }
    }
    
    /**
     * Set up the amount variable
     */
     debug(['amount',args[0]]);
     const amount = Number(args[0]);
     if(0 >= amount || amount >= 1000000){
         messaging.TransactionInvalidAmount(message);
         return;
     }

    /**
     * Execute transfer
     */
    let transfer = await backend.doBankTransfer(message.guild.id,message.member.id,'wallet',amount).catch((err)=>{messaging.Error(message,err);return;});
    if(!transfer) return;

    debug(transfer);
    if(transfer.code === 0){
        /**
         * Code 0 - Transfer success
         */
        let comment = 'You withdrew :moneybag: ``' + amount.toString() + '`` from your Bank Balance.\rYour new Bank Statement is included below.';
        messaging.BankingBalance(message,transfer.data.bank_account.balance,transfer.data.bank_account.wallet,comment,'Bank Withdrawal Statement');
    } else if(transfer.code === 300)
        messaging.InsufficientFunds(message);
    else
        messaging.ErrorUnknown(message);
    return;
}

module.exports = {
    handle
};