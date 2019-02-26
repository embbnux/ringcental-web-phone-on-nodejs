const dotenv = require('dotenv');
const wrtc = require('wrtc');
const RingCentral = require('ringcentral');
const WS = require('ws');
const DOMParser = require('xmldom').DOMParser;

const RingCentralWebPhone = require('./ringcentral-web-phone');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
global.DOMParser = DOMParser;
global.localStorage = {
  getItem: () => null,
  setItem: () => null,
};
global.navigator = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
};
global.window = global;
global.WebSocket = WS;
global.RTCPeerConnection = wrtc.RTCPeerConnection;
global.getUserMedia = wrtc.getUserMedia;
global.navigator.mediaDevices = { getUserMedia: wrtc.getUserMedia };
global.RTCSessionDescription = wrtc.RTCSessionDescription;
global.MediaStream = wrtc.MediaStream;

dotenv.config();
const appKey = process.env.APP_KEY;
const appSecret = process.env.APP_SECRET;
const apiServer = process.env.API_SERVER;
const appVersion = '0.0.1';
const appName = 'Test';
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

const sdk = new RingCentral({
  appKey: appKey,
  appSecret: appSecret,
  appName: appName,
  appVersion: appVersion,
  server: apiServer
});

const platform = sdk.platform();

async function createWebPhone() {
  try {
    const loginResponse = await platform.login({ username, password });
    console.log('login success');
    const sipProvisionResponse = await platform.post('/client-info/sip-provision', {
      sipInfo: [{ transport: 'WSS' }]
    });
    console.log('get sip provision success');
    const webphone = new RingCentralWebPhone(sipProvisionResponse.json(), {
        appKey: appKey,
        appName: appName,
        appVersion: appVersion,
        uuid: loginResponse.json().endpoint_id,
        logLevel: 2,
        audioHelper: {
          true: false,
          // incoming: 'web-phone-1/audio/incoming.ogg',
          // outgoing: 'web-phone-1/audio/outgoing.ogg'
        },
    });
    return webphone;
  } catch (e) {
    console.error(e);
  }
}

async function init() {
  console.log('init');
  const phone = await createWebPhone();
  global.phone = phone;
  console.log('init successfully');
}

init();

const repl = require('repl');
repl.start({
  prompt: '> ',
  useGlobal: true
}).on('exit', () => { process.exit(); });
