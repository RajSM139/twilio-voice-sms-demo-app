const assets = Runtime.getAssets();
const { Data } = require(assets["/data.js"].path);

/*
To test it, use URL:
http://localhost:3000/start-talk?TalkCode=demo
*/

exports.handler = async (context, event, callback) => {
  /* This block of code is performing the following tasks: */
  const data = new Data(context);
  const client = context.getTwilioClient();
  const code = event.TalkCode;
  const talk = data.getTalkByCode(code);
  const speakerCallSids = [];
  console.log("Calling speakers...");
  /* The code block `let domainName = context.DOMAIN_NAME;
  if (domainName.startsWith("localhost")) {
    domainName = "<YOUR NGROK URL>";
  }` is checking if the `domainName` extracted from `context.DOMAIN_NAME` starts with "localhost".
  If it does, it means that the code is running locally, and in that case, it sets the `domainName`
  variable to "<YOUR NGROK URL>". This is typically done to handle local development environments
  where ngrok is used to expose a local server to the internet for testing webhook callbacks or
  external API integrations. */
  let domainName = context.DOMAIN_NAME;
  if (domainName.startsWith("localhost")) {
    domainName = "<YOUR NGROK URL>";
  }
  /* This block of code is iterating over each speaker in the `talk.speakers` array and initiating a
  call to each speaker using Twilio's `conferences` API. */
  for (const speaker of talk.speakers) {
    const participant = await client
      .conferences(talk.code)
      .participants.create({
        to: speaker.phoneNumber,
        from: context.TWILIO_PHONE_NUMBER,
        label: speaker.name,
        beep: true,
        startConferenceOnEnter: true,
        conferenceStatusCallback: `https://${domainName}/status-handler`,
        conferenceStatusCallbackEvents: ["leave"],
      });

    speakerCallSids.push(participant.callSid);
  }

  /* This block of code is performing the following tasks: */
  const registrants = await data.getRegistrants(talk);
  console.log("Calling registrants....");
  let registrantPhoneNumbers = registrants.map((r) => r.phoneNumber);
  const registrantsPhoneNumbersSet = new Set(registrantPhoneNumbers);
  registrantPhoneNumbers = [...registrantsPhoneNumbersSet];

  /* The `const promises = registrantPhoneNumbers.map(async (registrantPhoneNumber) => { ... }` code
  block is creating an array of promises. */
  const promises = registrantPhoneNumbers.map(async (registrantPhoneNumber) => {
    const participant = await client
      .conferences(talk.code)
      .participants.create({
        to: registrantPhoneNumber,
        from: context.TWILIO_PHONE_NUMBER,
        beep: false,
        startConferenceOnEnter: false,
      });

    return participant.callSid;
  });

  /* This block of code is handling the asynchronous processing of calling registrants by creating an
  array of promises using `registrantPhoneNumbers.map`. Each promise represents the process of
  creating a participant in a conference for a registrant phone number. */
  const results = await Promise.allSettled(promises);
  const registrantCallSids = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
  results
    .filter((result) => result.status === "rejected")
    .forEach((result) => console.error(result.reason));

  console.log(`
        Code: ${event.TalkCode}
        Speakers: ${speakerCallSids.length}
        Registrants: ${registrantCallSids.length}
        Failed Registrant attempts: ${
          registrantPhoneNumbers.length - registrantCallSids.length
        }
    `);
  /* The `callback(null, { talkCode: event.TalkCode, speakerCallSids, registrantCallSids });` statement
  is used to send a response back to the caller of this function. */
  callback(null, {
    talkCode: event.TalkCode,
    speakerCallSids,
    registrantCallSids,
  });
};
