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
const lang = require('./../../lang/default.js'); // Config
const backend = require('./../../library/backend.js'); // API / Database
const messaging = require('./../../library/messaging.js');
const { debug } = require('./../../library/debug.js');
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
             * Deposit all money in wallet to balance
             * - Start by fetching current bank statement
             */
            let bankAccount = await backend.getBankAccount(message.guild.id,message.member.id).catch((err)=>{messaging.Error(message,err);return;});
            if(!bankAccount) return;

            debug(bankAccount);
            if(bankAccount.code === 0){
                args[0] = bankAccount.data.item.wallet;
                if(bankAccount.data.item.wallet === 0){
                    /**
                     * There is no money in the wallet
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
     * Transfer money
     */
    let transfer = await backend.doBankTransfer(message.guild.id,message.member.id,'balance',amount).catch((err)=>{messaging.Error(message,err);return;});
    if(!transfer) return;

    debug(transfer);
    if(transfer.code === 0) { // OK
        /**
         * Code 0 - Transfer success
         */
        let comment = 'You deposited :moneybag: ``' + amount.toString() + '`` to your Bank Balance.\rYour new Bank Statement is included below.';
        messaging.BankingBalance(message,transfer.data.bank_account.balance,transfer.data.bank_account.wallet,comment,'Bank Deposit Statement');
    } else if(transfer.code === 300) {
        /**
         * Code 300 - Insufficient funds
         */
        messaging.InsufficientFunds(message);
    } else {
        messaging.ErrorMessage(message,'An unknown error occured','Please contact support by creating a ticket with the refrence ``DEP#L96``.')
    }

    return;
}

module.exports = {
    handle
};