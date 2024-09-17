const assets = Runtime.getAssets();
const { Data } = require(assets["/data.js"].path);

/*
To bind the TwiML to the phone number, run command:
twilio phone-numbers:update <activated number> --voice-url=<your TwiML Function URL>
*/

exports.handler = (context, event, callback) => {
  const twiml = new Twilio.twiml.VoiceResponse();
  const data = new Data(context);

  const talk = data.getCurrentTalk();

  if (talk !== undefined) {
    twiml.dial().conference(
      {
        muted: true,
        startConferenceOnEnter: false,
      },
      talk.code
    );
  } else {
    //TODO: Build a Voice Representation of upcoming talks
    twiml.say("There is currently no talks. Send us a Text for Upcoming Talks");
  }
  console.log(`Twiml is ${twiml}`);
  return callback(null, twiml);
};
