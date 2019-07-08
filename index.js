// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const placesAPIkey = `AIzaSyA_ioaEbPgfOjBB2DWiW-P4RJcCBEpaPP8`
const googleMapsClient = require('@google/maps').createClient({
    key: placesAPIkey,
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
    List,
    Carousel
} = require('actions-on-google');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    //agent.requestSource = agent.ACTIONS_ON_GOOGLE;
    //console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    //console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

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
                return Promise.resolve(response.json.results.slice(0, 4));
            })
            .catch((err) => {
                console.log(Promise.reject(err));
            });
    };

    function activitiesHandler(agent) {
        const params = agent.context.get('booking-context').parameters;
        const city = params['geo-city'];
        //agent.add('My name is Dialogflow!' + city);
        let conv = agent.conv();
        console.log(conv);

        return getNearbyMuseums(city)
            .then((response) => {
                console.log(`This was my response : ${JSON.stringify(response)}`);

                if (!conv.screen) {
                    conv.ask('Sorry, try this on a screen device or select the phone surface in the simulator.');
                    return;
                }
                conv.ask(`I highly recommend you to visit ${response[0].name}, but visiting ${response[1].name} or ${response[2].name} should also be tremendously fun!`);
                conv.ask(new Carousel({
                    title: 'Google Assistant',
                    items: {
                        'OptionOne': {
                            title: `${response[0].name}`,
                            description: `${response[0].rating} stars!`,
                            image: {
                                url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${response[0].photos[0].photo_reference}&key=${placesAPIkey}`,
                                accessibilityText: `${response[0].name}`,
                            },
                        },
                        'OptionTwo': {
                            title: `${response[1].name}`,
                            description: `${response[1].rating} stars!`,
                            image: {
                                url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${response[1].photos[0].photo_reference}&key=${placesAPIkey}`,
                                accessibilityText: `${response[1].name}`
                            },
                        },
                    },
                }));
                agent.add(conv);
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
    if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
        intentMap.set('Activities', activitiesHandler);
    } /* else {
        intentMap.set(null, other);
    } */
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
});