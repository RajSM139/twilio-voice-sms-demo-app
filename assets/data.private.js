class Data {
  constructor(context) {
    this.context = context;
  }

  getCurrentTalk() {
    return this.getUpcomingTalks()[0];
  }

  getUpcomingTalks() {
    return [
      {
        title: "Billionaires in Space",
        code: "astronaut",
        startTime: "2024-09-17T12:37:45.502Z",
        speakers: ["<VERIFIED MOBILE NUMBER>"],
      },
      {
        title: "Demo Talk",
        code: "demo",
        startTime: "2024-09-17T12:37:45.502Z",
        speakers: [
          {
            phoneNumber: "<VERIFIED MOBILE NUMBER>",
            name: "<NAME>",
          },
          {
            phoneNumber: "<VERIFIED MOBILE NUMBER>",
            name: "<NAME>",
          },
        ],
      },
    ];
  }

  getTalkByCode(code) {
    const talks = this.getUpcomingTalks();
    return talks.find((talk) => talk.code === code);
  }

  addRegistration(code, phoneNumber) {
    // NOOP
    return true;
  }

  async getRegistrants(talk) {
    //TODO: this needs to come from an external source
    // NOT the messages log
    const clients = this.context.getTwilioClient();
    const messages = await clients.messages.list({
      to: this.context.TWILIO_PHONE_NUMBER,
    });
    return messages
      .filter((msg) => {
        const action = this.parseInput(msg.Body);
        return action.command === "join" && action.code === talk.code;
      })
      .map((msg) => {
        return { phoneNumber: msg.from };
      });
  }

  parseInput(input) {
    // eg: join <code>
    const action = {
      input,
    };

    const normalised = input.trim().toLowerCase();
    const parts = normalised.split(/\s+/);
    if (parts.length === 2) {
      action.command = parts[0];
      action.code = parts[1];
    }
    return action;
  }
}
module.exports = {
  Data,
};
