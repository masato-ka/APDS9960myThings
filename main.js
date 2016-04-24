var ConfigFile = require('config');
var request = require('request');
var gestureSensor = require('./APDS9960.js');

var port = 6//I2C port for APDS9960
var adp9960 = new gestureSensor.APDS9960(port);


console.log(ConfigFile.config);


var trigger1 = {
    'uuid': ConfigFile.config.trigger1.uuid,
    'token': ConfigFile.config.trigger1.token
}

var trigger2 = {
    'uuid': ConfigFile.config.trigger2.uuid,
    'token': ConfigFile.config.trigger2.token
}

var trigger3 = {
    'uuid': ConfigFile.config.trigger3.uuid,
    'token': ConfigFile.config.trigger3.token
}
var trigger4 = {
    'uuid': ConfigFile.config.trigger4.uuid,
    'token': ConfigFile.config.trigger4.token
}

var deactivate_uuid = '1c461639-5496-49a5-b5d8-737255ca220d';
//SIM ディアクティベートに使うトリガーのToken
var deactivate_token = 'b770c553';
//SIM アクティベートに使うトリガーのUUID
var acivate_uuid = 'd3460af9-94ca-4b30-8d5a-937e1b2695f9';
//SIM アクティベートに使うトリガーのToken
var acivate_token = '1c04c739';


//ヘッダーを定義
var headers = {
  'meshblu_auth_uuid':'',
  'meshblu_auth_token':''
}

//オプションを定義
var options = {
  url: '',
  method: 'POST',
  headers: headers,
}

//send for myThings via IDCF CLOUD(mshblu)
function sendTrigger(trigger){
    headers.meshblu_auth_token = trigger.token;
    headers.meshblu_auth_uuid = trigger.uuid;
    options.url=ConfigFile.config.contextURL+'/'+trigger;
    options.headers = headers;
    request(options, function (error, response, body) {
        console.log(body);
    });
}


adp9960.callback = function(result){
        if(result === 'UP'){
            console.log('up');
            sendTrigger(trigger1);

        }else if(result === 'DOWN'){
            console.log('DONW');
            sendTrigger(trigger1);
            
        }else if(result === 'LEFT'){
            console.log('LEFT');
            sendTrigger(trigger3);
        }else if(result === 'RIGHT'){
            console.log('RIGHT');
            sendTrigger(trigger4);
        
        }else{
            console.log('NO RECOGNITION')
        }
        
    console.log(result);
}

adp9960.getGesture();





