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
const ftp = require('ftp'); // FTP Client

function getCurrentPlayerConfig(SteamID){
    return new Promise((resolve, reject) => {
        const playerFilePath = process.env.FTP_PLAYER_PROFILE_PATH + SteamID + '.json';
        console.log(playerFilePath);

        var c = new ftp();

        c.on('ready', function() {
            let streamData;
            c.get(playerFilePath, function(err, stream) {
                if (err) {
                    console.error(err)
                    reject(err);
                    return;
                }

                stream.once('close', function() {
                    c.end();
                    resolve(streamData);
                });

                streamToString(stream, (data) => {
                    let objData;
                    try {
                        objData = JSON.parse(data);
                    } catch(err){
                        reject(err);
                    }
                    streamData = objData;  // data is now my string variable
                });
            });
        });
        
        c.on('error', (err) => {
            reject(err);
        });

        // connect to localhost:21 as anonymous
        c.connect({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            port: process.env.FTP_PORT,
            password: process.env.FTP_PASSWORD,
            secure: process.env.FTP_SECURE === "true" ? true : false,
            secureOptions: { rejectUnauthorized: process.env.FTP_ONLY_TRUSTED_CERTIFICATES === "true" ? true : false },
        });
    })
}

function injectCurrentPlayerConfig(SteamID,Content){
    return new Promise((resolve,reject) => {
        console.log('stringify');
        let data;
        try {
            data = JSON.stringify(Content);
        } catch(err){
            console.log('failed to stringify object to json')
            reject(err);
        }
        console.log('inject ' + SteamID + ' ready');

        var c = new ftp();
        c.on('ready', function() {
            c.put(data,process.env.FTP_PLAYER_PROFILE_PATH + SteamID + '.json', function(err) {
                if (err) {
                    console.log('inject ' + SteamID + ' failed');
                    reject(err);
                    return;
                }
                c.end();
                console.log('inject ' + SteamID + ' success');
                resolve(true);
            });
        });

        c.on('error', (err) => {
            reject(err);
        });

        // connect to localhost:21 as anonymous
        c.connect({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            port: process.env.FTP_PORT,
            password: process.env.FTP_PASSWORD,
            secure: process.env.FTP_SECURE === "true" ? true : false,
            secureOptions: { rejectUnauthorized: process.env.FTP_ONLY_TRUSTED_CERTIFICATES === "true" ? true : false }
        });
        
    })
}

function streamToString(stream, cb) {
    const chunks = [];
    stream.on('data', (chunk) => {
      chunks.push(chunk.toString());
    });
    stream.on('end', () => {
      cb(chunks.join(''));
    });
  }

module.exports = {
    currentPlayerData: async (SteamID) => { return await getCurrentPlayerConfig(SteamID); },
    injectPlayerData: async (SteamID,Content) => { return await injectCurrentPlayerConfig(SteamID,Content); }
}