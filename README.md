# Demo Twilio Application
This is a Demo Application built based on the Twilio's Learning Path on LinkedIn for **Twilio Programmable Messaging and Voice Professional Certificate** 

Learning Path Link: [LinkedIn Learning](https://www.linkedin.com/learning/paths/twilio-programmable-messaging-and-voice-professional-certificate)

## Commands

* Create a New Project: `twilio serverless:init my-project`
* To start the server: `twilio serverless:start`
* To deploy: `twilio serverless:deploy`

## Pre-requisites

* Twilio CLI
* ngrok
* Twilio Account (Trial Account with positive account balance)

## After deployment, to initiate a conference call, follow the steps:

* Import the Collection and Env from `postman-collection` folder
* Since the endpoint is Protected, need to generate `Twilio Signature` and pass in the header `X-Twilio-Signature`