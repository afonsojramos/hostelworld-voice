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
                return Promise.resolve(response.json.results.slice(0, 3));
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
                console.log(2);

                conv.ask(`I highly recommend you to visit ${response[0].name}, but visiting ${response[1].name} or ${response[2].name} should also be tremendously fun!`);
                console.log(3);
                /* conv.ask(new Carousel({
                    items: {
                        'OptionOne': {
                            title: `${response[0].name}`,
                            description: `${response[0].rating} stars!`,
                            image: {
                                url: `${response[0].icon}`,
                                alt: `${response[0].name}`,
                            },
                        },
                        'OptionTwo': {
                            title: `${response[1].name}`,
                            description: `${response[1].rating} stars!`,
                            image: {
                                url: `${response[1].icon}`,
                                alt: `${response[1].name}`,
                            },
                        },
                        'OptionThree': {
                            title: `${response[2].name}`,
                            description: `${response[2].rating} stars!`,
                            image: {
                                url: `${response[2].icon}`,
                                alt: `${response[2].name}`,
                            },
                        },
                    },
                })); */
                /* conv.ask(new List({
                    title: 'List Title',
                    items: {
                        'OptionOne': {
                            title: `${response[0].name}`,
                            description: `${response[0].rating} stars!`,
                            image: {
                                url: `${response[0].icon}`,
                                alt: `${response[0].name}`,
                            },
                        },
                        'OptionTwo': {
                            title: `${response[1].name}`,
                            description: `${response[1].rating} stars!`,
                            image: {
                                url: `${response[1].icon}`,
                                alt: `${response[1].name}`,
                            },
                        },
                        'OptionThree': {
                            title: `${response[2].name}`,
                            description: `${response[2].rating} stars!`,
                            image: {
                                url: `${response[2].icon}`,
                                alt: `${response[2].name}`,
                            },
                        },
                    },
                })); */
                console.log(4);
                agent.add(conv);
                console.log(5);
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