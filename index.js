// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyA_ioaEbPgfOjBB2DWiW-P4RJcCBEpaPP8',
    Promise: Promise
});
const {
    dialogflow,
    SimpleResponse,
    BasicCard,
    Suggestions,
    Permission,
    UpdatePermission,
    RegisterUpdate,
    Carousel
} = require('actions-on-google');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
        agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    const getNearbyMuseums = (city) => {
        console.log("> getNearbyMuseums City: " + city);

        return googleMapsClient.places({ query: `${city}`, type: 'museum' }).asPromise()
            .then((response) => {
                console.log(response.json.results);
                return Promise.resolve(response.json.results.slice(0, 3));
            })
            .catch((err) => {
                console.log(Promise.reject(err));
            });
    };

    function activitiesHandler(agent) {
        const params = agent.getContext('booking-context').parameters;
        const city = params['geo-city'];
        //agent.add('My name is Dialogflow!' + city);

        return getNearbyMuseums(city)
            .then((response) => {
                agent.add(response);
                return Promise.resolve(response);
            })
            .catch((err) => {
                agent.add("Uh oh, something is wrong *bleeds*" + err);
                return Promise.resolve(err);
            });
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Activities', activitiesHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
});