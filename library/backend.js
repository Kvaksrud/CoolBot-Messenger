let Client = require('node-rest-client').Client;
let client = new Client();

const headers = {
    'Authorization': 'Bearer ' + process.env.COOLBOT_BACKEND_API_TOKEN,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}

/*
 * Character Sheet API - Injection/cache
 */
client.registerMethod('characterSheetGet', process.env.COOLBOT_BACKEND_API_URL + '/CharacterSheet/${sheet_id}', 'GET')
client.registerMethod('characterSheetStore', process.env.COOLBOT_BACKEND_API_URL + '/CharacterSheet', 'POST')
function getCharacterSheet(sheetId){
    return new Promise((resolve, reject) => {
        let args = {
            path: {
                'sheet_id': sheetId
            },
            headers: headers,
        }

        let request = client.methods.characterSheetGet(args, function (data, response) {
            resolve(data);
        })

        request.on('error', function(err) {
            console.log('Failed to get character sheet with id ' + sheetId);
            console.log(err);
            reject(err);
        });
    });
}
function storeCharacterSheet(guildId,memberId,content,type = null){
    return new Promise((resolve, reject) => {
        let recordType;
        switch(type) {
            case ('injection'):
                recordType = 'injection';
                break;
            default:
                recordType = 'cache'
        }
        console.log('Storing record type: ' + recordType);

        let args = {
            data:  {
                'member_id': memberId,
                'content': content,
            },
            parameters: {
                'guild_id': guildId,
                'type': recordType,
            },
            headers: headers,
        }

        let request = client.methods.characterSheetStore(args, function (data, response) {
            resolve(data);
        })

        request.on('error', function(err) {
            console.log('Failed to store character sheet');
            console.log(err);
            reject(err);
        });
    });
}

/*
 * Registration API
 */
client.registerMethod('registerGet', process.env.COOLBOT_BACKEND_API_URL + '/DiscordRegistration/${member_id}', 'GET')
client.registerMethod('registerStore', process.env.COOLBOT_BACKEND_API_URL + '/DiscordRegistration', 'POST')
client.registerMethod('registerList', process.env.COOLBOT_BACKEND_API_URL + '/DiscordRegistration', 'GET')
function getRegistration(guildId,memberId){
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
            resolve(data);
        })

        request.on('error', function(err) {
            console.log('Failed to get registration for ' + memberId + ' in guild ' + guildId);
            console.log(err);
            reject(err);
        });
    })
}

function register(guildId,memberId,steamId,username){
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
            resolve(data);
        })

        request.on('error', function(err) {
            console.log('Failed to register for ' + memberId + ' in guild ' + guildId);
            console.log(err);
            reject(err);
        });
    })
}

module.exports = {
    // Character Sheet
    getCharacterSheet: async (sheetId) => { return await getCharacterSheet(sheetId) },
    storeCharacterSheet: async (guildId,memberId,content,type = null) => { return await storeCharacterSheet(guildId,memberId,content,type) },
    
    // Registration
    getRegistration: async (guildId,memberId) => { return await getRegistration(guildId,memberId); },
    register: async (guildId,memberId,steamId,username) => { return await register(guildId,memberId,steamId,username); },
}