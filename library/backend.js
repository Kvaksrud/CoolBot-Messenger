/**
 * Coolbot Messenger -> Coolbot Backend
 * 
 * AUTHOR
 * Patrick Kvaksrud <patrick@kvaksrud.no>
 * https://github.com/Kvaksrud/CoolBot-Messenger
 * 
 * DESCRIPTION
 * This bot was originally made for the TCGC community
 * under MIT licensing to allow re-use of code.
 * 
 * This file has all code for talking to the REST API
 * of the CoolBot Backend system.
 */
let Client = require('node-rest-client').Client;
let client = new Client();
const { debug } = require('./debug.js');

const headers = {
    'Authorization': 'Bearer ' + process.env.COOLBOT_BACKEND_API_TOKEN,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}

/**
 * Registration API
 */
client.registerMethod('registerGet', process.env.COOLBOT_BACKEND_API_URL + '/DiscordRegistration/${member_id}', 'GET')
client.registerMethod('registerStore', process.env.COOLBOT_BACKEND_API_URL + '/DiscordRegistration', 'POST')
client.registerMethod('registerList', process.env.COOLBOT_BACKEND_API_URL + '/DiscordRegistration', 'GET')
async function getRegistration(guildId,memberId){
    return new Promise((resolve, reject) => {
        let args = {
            path: {
                'member_id': memberId
            },
            parameters: {
                'guild_id': guildId,
                'discord_identifier': true,
            },
            headers: headers,
        }

        let request = client.methods.registerGet(args, function (data, response) {
            if(data.message === 'Server Error'){
                debug(['Server Error',data]);
                reject({
                    "code": 500,
                    "message": data.message
                });
            }
            resolve(data);
        })

        request.on('error', function(err) {
            debug('Failed to get registration (code '+err.code+') for ' + memberId + ' in guild ' + guildId);
            console.error(err);
            reject(err);
        });
    })
}
async function register(guildId,memberId,steamId,username){
    return new Promise((resolve, reject) => {
        let args = {
            data:  {
                'member_id': memberId.toString(),
                'steam_id': steamId.toString(),
                'username': username.toString()
            },
            parameters: {
                'guild_id': guildId
            },
            headers: headers,
        }

        let request = client.methods.registerStore(args, function (data, response) {
            if(data.message === 'Server Error')
                reject({
                    "code": 500,
                    "message": data.message
                });
            resolve(data);
        })

        request.on('error', function(err) {
            console.log('Failed to register for ' + memberId + ' in guild ' + guildId);
            console.log(err);
            reject(err);
        });
    })
}

/**
 * Bank Account API
 */
client.registerMethod('bankAccountGet', process.env.COOLBOT_BACKEND_API_URL + '/BankAccount/${member_id}', 'GET');
async function getBankAccount(guildId,memberId){
    return new Promise((resolve, reject) => {
        let args = {
            path: {
                'member_id': memberId
            },
            parameters: {
                'guild_id': guildId,
                'discord_identifier': true,
            },
            headers: headers,
        }

        let request = client.methods.bankAccountGet(args, function (data, response) {
            if(data.message === 'Server Error')
                reject({
                    "code": 500,
                    "message": data.message
                });
            resolve(data);
        })

        request.on('error', function(err) {
            console.log('Failed to get bank account for ' + memberId + ' in guild ' + guildId);
            console.log(err);
            reject(err);
        });
    })
}

/**
 * Bank Transaction API
 * Description: Can be withdawal or deposit. All amounts are positive and converten in backend.
 */
client.registerMethod('bankTransaction', process.env.COOLBOT_BACKEND_API_URL + '/BankTransaction', 'POST');
client.registerMethod('bankTransactionSend', process.env.COOLBOT_BACKEND_API_URL + '/BankTransaction/Send', 'POST');
client.registerMethod('bankTransactionTransfer', process.env.COOLBOT_BACKEND_API_URL + '/BankTransaction/Transfer', 'POST');
client.registerMethod('bankTransactionSearch', process.env.COOLBOT_BACKEND_API_URL + '/BankTransaction/Search', 'GET');
async function doBankTransaction(guildId,memberId,type,target,amount,description,timer = null){
    return new Promise((resolve, reject) => {
        let args = {
            data:  {
                'member_id': memberId.toString(),
                'type': type, // deposit / withdraw
                'target': target, // wallet / balance
                'amount': amount, // Positive amount only
                'description': description, // Description of transaction (gets logged)
                'timer': timer,
            },
            parameters: {
                'guild_id': guildId
            },
            headers: headers,
        }

        let request = client.methods.bankTransaction(args, function (data, response) {
            resolve(data);
        })

        request.on('error', function(err) {
            console.log(`Failed to transfer money from wallet to balance with the amount ${amount} in guild ${guild} for ${member_id}`);
            console.log(err);
            reject(err);
        });
    })
}
async function doBankTransactionSend(guildId,fromMemberId,toMemberId,amount){
    return new Promise((resolve, reject) => {
        let args = {
            data:  {
                'from_member_id': fromMemberId.toString(),
                'to_member_id': toMemberId.toString(),
                'amount': amount
            },
            parameters: {
                'guild_id': guildId
            },
            headers: headers,
        }

        let request = client.methods.bankTransactionSend(args, function (data, response) {
            if(data.message === 'Server Error')
                reject({
                    "code": 500,
                    "message": data.message
                });
            resolve(data);
        })

        request.on('error', function(err) {
            console.log(`Failed to send money from ${fromMemberId} to ${toMemberId} with the amount ${amount} in guild ${guild}`);
            console.log(err);
            reject(err);
        });
    })
}
async function doBankTransfer(guildId,memberId,target,amount){
    return new Promise((resolve, reject) => {
        let args = {
            data:  {
                'member_id': memberId.toString(),
                'target': target,
                'amount': amount
            },
            parameters: {
                'guild_id': guildId
            },
            headers: headers,
        }

        let request = client.methods.bankTransactionTransfer(args, function (data, response) {
            resolve(data);
        })

        request.on('error', function(err) {
            console.log(`Failed to transfer money from ${target} with the amount ${amount} in guild ${guild} for ${memberId}`);
            console.log(err);
            reject(err);
        });
    })
}
async function doBankTransactionSearch(guildId,memberId,type,limit=25,timer=null){
    return new Promise((resolve, reject) => {
        let args = {
            parameters: {
                'guild_id': guildId,
                'member_id': memberId,
                'type': type,
                'limit': limit,
                'timer': timer,
            },
            headers: headers,
        }

        let request = client.methods.bankTransactionSearch(args, function (data, response) {
            if(data.message === 'Server Error')
                reject({
                    "code": 500,
                    "message": data.message
                });
            resolve(data);
        })

        request.on('error', function(err) {
            console.log('Failed to get transaction search for ' + memberId + ' in guild ' + guildId);
            console.log(err);
            reject(err);
        });
    })
}

// Labor
client.registerMethod('doLabor', process.env.COOLBOT_BACKEND_API_URL + '/Labor', 'POST');
async function doLabor(guildId,memberId){
    return new Promise((resolve, reject) => {
        let args = {
            data:  {
                'member_id': memberId.toString(),
            },
            parameters: {
                'guild_id': guildId
            },
            headers: headers,
        }

        let request = client.methods.doLabor(args, function (data, response) {
            if(data.message === 'Server Error')
                reject({
                    "code": 500,
                    "message": data.message
                });
            resolve(data);
        })

        request.on('error', function(err) {
            console.log(`Failed to do labor`);
            console.log(err);
            reject(err);
        });
    })
}

// DinosaurRequest
client.registerMethod('possibleInjections', process.env.COOLBOT_BACKEND_API_URL + '/DinosaurRequest/PossibleInjections', 'POST');
async function possibleInjections(discord_roles){
    return new Promise((resolve, reject) => {
        let args = {
            data:  {
                'discord_roles': discord_roles,
            },
            headers: headers,
        }

        let request = client.methods.possibleInjections(args, function (data, response) {
            if(data.message === 'Server Error')
                reject({
                    "code": 500,
                    "message": data.message
                });
            resolve(data);
        })

        request.on('error', function(err) {
            console.log(`Failed to do get possible injections`);
            console.log(err);
            reject(err);
        });
    })
}
client.registerMethod('possibleTeleports', process.env.COOLBOT_BACKEND_API_URL + '/DinosaurRequest/PossibleTeleports', 'POST');
async function possibleTeleports(discord_roles){
    return new Promise((resolve, reject) => {
        let args = {
            data:  {
                'discord_roles': discord_roles,
            },
            headers: headers,
        }

        let request = client.methods.possibleTeleports(args, function (data, response) {
            if(data.message === 'Server Error')
                reject({
                    "code": 500,
                    "message": data.message
                });
            resolve(data);
        })

        request.on('error', function(err) {
            console.log(`Failed to do get possible locations`);
            console.log(err);
            reject(err);
        });
    })
}
client.registerMethod('requestInjection', process.env.COOLBOT_BACKEND_API_URL + '/DinosaurRequest', 'POST');
async function requestInjection(guild_id,member_id,discord_roles,dinosaur_code,dinosaur_gender,server_json){
    return new Promise((resolve, reject) => {
        let args = {
            data:  {
                'member_id': member_id,
                'discord_roles': discord_roles,
                'request_type': 'dinosaur',
                'dinosaur_code': dinosaur_code,
                'dinosaur_gender': dinosaur_gender,
                'server_json': server_json,
            },
            parameters: {
                'guild_id': guild_id
            },
            headers: headers,
        }

        let request = client.methods.requestInjection(args, function (data, response) {
            if(data.message === 'Server Error')
                reject({
                    "code": 500,
                    "message": data.message
                });
            resolve(data);
        })

        request.on('error', function(err) {
            console.log(`Failed to do injection request`);
            console.log(err);
            reject(err);
        });
    })
}
client.registerMethod('requestTeleport', process.env.COOLBOT_BACKEND_API_URL + '/DinosaurRequest', 'POST');
async function requestTeleport(guild_id,member_id,discord_roles,teleport_code,server_json){
    return new Promise((resolve, reject) => {
        let args = {
            data:  {
                'member_id': member_id,
                'discord_roles': discord_roles,
                'request_type': 'teleport',
                'teleport_code': teleport_code,
                'server_json': server_json,
            },
            parameters: {
                'guild_id': guild_id
            },
            headers: headers,
        }

        let request = client.methods.requestTeleport(args, function (data, response) {
            if(data.message === 'Server Error')
                reject({
                    "code": 500,
                    "message": data.message
                });
            resolve(data);
        })

        request.on('error', function(err) {
            console.log(`Failed to do injection request`);
            console.log(err);
            reject(err);
        });
    })
}
client.registerMethod('updateRequestInjection', process.env.COOLBOT_BACKEND_API_URL + '/DinosaurRequest/${request_id}', 'PUT');
async function updateRequestInjection(request_id,success){
    return new Promise((resolve, reject) => {
        let args = {
            data:  {
                'status': success
            },
            path: {
                'request_id': request_id
            },
            headers: headers,
        }

        let request = client.methods.updateRequestInjection(args, function (data, response) {
            if(data.message === 'Server Error')
                reject({
                    "code": 500,
                    "message": data.message
                });
            resolve(data);
        })

        request.on('error', function(err) {
            console.log(`Failed to do injection request`);
            console.log(err);
            reject(err);
        });
    })
}

/**
 * Labor Suggest
 */
 client.registerMethod('laborSuggest', process.env.COOLBOT_BACKEND_API_URL + '/LaborReply', 'POST');
 async function laborSuggest(guild_id,member_id,text_before,text_after,target){
     return new Promise((resolve, reject) => {
         let args = {
             data:  {
                 'member_id': member_id,
                 'text_before': text_before,
                 'text_after': text_after,
                 'target': target
             },
             parameters: {
                 'guild_id': guild_id
             },
             headers: headers,
         }
 
         let request = client.methods.laborSuggest(args, function (data, response) {
             if(data.message === 'Server Error')
                 reject({
                     "code": 500,
                     "message": data.message
                 });
             resolve(data);
         })
 
         request.on('error', function(err) {
             reject(err);
         });
     })
 }

module.exports = {
    // Character Sheet
    /*getCharacterSheet: async (sheetId) => { return await getCharacterSheet(sheetId) },
    storeCharacterSheet: async (guildId,memberId,content,type = null) => { return await storeCharacterSheet(guildId,memberId,content,type) },*/
    
    // Registration
    getRegistration: async (guildId,memberId) => { return await getRegistration(guildId,memberId); },
    register: async (guildId,memberId,steamId,username) => { return await register(guildId,memberId,steamId,username); },

    // Bank Account
    getBankAccount: async (guildId,memberId) => { return await getBankAccount(guildId,memberId) },
    doBankTransfer: async (guildId,memberId,target,amount) => { return await doBankTransfer(guildId,memberId,target,amount) },
    
    // Bank Transaction
    doBankTransaction: async (guildId,memberId,type,target,amount,description,timer) => { return await doBankTransaction(guildId,memberId,type,target,amount,description,timer) },
    doBankTransactionSend: async (guildId,fromMemberId,toMemberId,amount) => { return await doBankTransactionSend(guildId,fromMemberId,toMemberId,amount) },
    doBankTransactionSearch: async (guildId,memberId,type,limit=25,timer=null) => { return await doBankTransactionSearch(guildId,memberId,type,limit,timer) },

    // Labor
    doLabor: async (guildId,memberId) => { return await doLabor(guildId,memberId) },

    // DinosaurRequest
    possibleInjections: async (discord_roles) => { return await possibleInjections(discord_roles) },
    possibleTeleports: async (discord_roles) => { return await possibleTeleports(discord_roles) },
    requestInjection: async (guild_id,member_id,discord_roles,dinosaur_code,dinosaur_gender,server_json) => {return await requestInjection(guild_id,member_id,discord_roles,dinosaur_code,dinosaur_gender,server_json)},
    requestTeleport: async (guild_id,member_id,discord_roles,teleport_code,server_json) => {return await requestTeleport(guild_id,member_id,discord_roles,teleport_code,server_json)},
    updateRequestInjection: async(request_id,status) => { return await updateRequestInjection(request_id,status) },

    // Labor suggestions
    laborSuggest: async (guild_id,member_id,text_before,text_after,target) => {return await laborSuggest(guild_id,member_id,text_before,text_after,target)},
}