const assets = Runtime.getAssets();
const { Data } = require(assets["/data.js"].path);

/*
To bind the TwiML to the phone number, run command:
twilio phone-numbers:update <activated number> --sms-url=<your TwiML Function URL>
*/

exports.handler = (context, event, callback) => {
  //NOTE: to test this from browser rather than actual SMS: http://localhost:3000/incoming-message?Body=join+demo
  const twiml = new Twilio.twiml.MessagingResponse();
  const data = new Data(context);

  const action = data.parseInput(event.Body);
  switch (action.command) {
    case "join":
      const talk = data.getTalkByCode(action.code);
      if (talk !== undefined) {
        data.addRegistration(action.code, event.From);
        twiml.message(
          `You're now registered for ${talk.title}. Don't call us, we will call you!`
        );
      } else {
        twiml.message(`Unable to find upcoming talk with code ${action.code}`);
      }
      break;
    default:
      twiml.message("I dont know what you are trying to do");
      break;
  }
  return callback(null, twiml);
};
