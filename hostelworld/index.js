// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const rp = require('request-promise');
const { WebhookClient } = require('dialogflow-fulfillment');
const placesAPIkey = `AIzaSyA_ioaEbPgfOjBB2DWiW-P4RJcCBEpaPP8`;
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

    const getNearbyMuseums = (params) => {
        console.log(params);
        const city = params['geo-city'];

        if (city != '') {
            console.log(`Getting properties for > ${city} <`);


            return rp({
                method: 'GET',
                uri: 'https://api.m.hostelworld.com',
                path: `/suggestions/?text=${city}`,
                headers: {
                    'accept': 'application/json',
                    'Accept-Language': 'en'
                }
            })
                .then(function (body) {
                    console.log(body);
                    return Promise.resolve(body);
                })
                .catch(function (err) {
                    console.log(Promise.reject(err));
                });
        }

        return googleMapsClient.places({ query: `${city}`, type: 'museum' }).asPromise()
            .then((response) => {
                console.log(response.json.results);
                return Promise.resolve(response.json.results.slice(0, 4));
            })
            .catch((err) => {
                console.log(Promise.reject(err));
            });
    };

    function accommodationHandler(agent) {
        const params = agent.context.get('booking-context').parameters;
        let conv = agent.conv();
        console.log(conv);

        return getNearbyMuseums(params)
            .then((response) => {
                console.log("I got this response!");
                console.log(response);

                if (!conv.screen) {
                    conv.ask('Sorry, try this on a screen device or select the phone surface in the simulator.');
                    return;
                }
                conv.ask(`I highly recommend you to visit ${response[0].name}, but visiting ${response[1].name} or ${response[2].name} should also be tremendously fun!`);
                conv.ask(new Carousel({
                    title: `This is my Top 4`,
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
                                url: `https://maps.googleapis.com/maps/api/place/photo?maxheight=800&photoreference=${response[1].photos[0].photo_reference}&key=${placesAPIkey}`,
                                accessibilityText: `${response[1].name}`
                            },
                        },
                        'OptionThree': {
                            title: `${response[2].name}`,
                            description: `${response[2].rating} stars!`,
                            image: {
                                url: `https://maps.googleapis.com/maps/api/place/photo?maxheight=800&photoreference=${response[2].photos[0].photo_reference}&key=${placesAPIkey}`,
                                accessibilityText: `${response[2].name}`
                            },
                        },
                        'OptionFour': {
                            title: `${response[3].name}`,
                            description: `${response[3].rating} stars!`,
                            image: {
                                url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${response[3].photos[0].photo_reference}&key=${placesAPIkey}`,
                                accessibilityText: `${response[3].name}`
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
        intentMap.set('Hostels', accommodationHandler);
    } /* else {
        intentMap.set(null, other);
    } */
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
});