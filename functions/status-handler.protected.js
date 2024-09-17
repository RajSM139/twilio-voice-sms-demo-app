const assets = Runtime.getAssets();
const { Data } = require(assets["/data.js"].path);

/*
To test it, use URL:
http://localhost:3000/status-handler
*/

exports.handler = async (context, event, callback) => {
  console.log(`Status Callback Event ${event.StatusCallbackEvent}`);
  try {
    switch (event.StatusCallbackEvent) {
      case "participant-leave":
        sendThankYouNote(context, event);
        break;
      case "conference-end":
        //TODO: Can be handled differently
        sendThankYouNote(context, event);
        break;
      default:
        console.log("Unhandled events");
        break;
    }
  } catch (err) {
    console.log(err);
  }
};

const sendThankYouNote = async (context, event) => {
  const data = new Data(context);
  const client = context.getTwilioClient();
  const code = event.FriendlyName;
  const talk = data.getTalkByCode(code);
  console.log(`Sending text for feedback about ${talk.title}`);
  try {
    const call = await client
      .calls(
        event.StatusCallbackEvent === "conference-end"
          ? event.CallSidEndingConference
          : event.CallSid
      )
      .fetch();
    const attendeeNumber =
      call.direction === "outbound-api" ? call.to : call.from;
    //TODO: Can implement NPS Survey here
    const message = await client.messages.create({
      to: attendeeNumber,
      from: context.TWILIO_PHONE_NUMBER,
      body: `Thanks for attending ${talk.title}. Stay tuned for more.`,
    });
    console.log("🚀 ~ sendThankYouNote ~ message:", message);
  } catch (err) {
    console.log("🚀 ~ sendThankYouNote ~ err:", err);
  }
};
