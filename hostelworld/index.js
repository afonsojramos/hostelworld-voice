// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const rp = require('request-promise');
const { WebhookClient } = require('dialogflow-fulfillment');
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

    function welcome(agent) {
        agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    const getHostels = (city) => {
        console.log(`Getting properties for > ${city} <`);

        return rp({
            method: 'GET',
            uri: `https://api.m.hostelworld.com/2.1/cities/${city.id}/properties/?currency=EUR&page=1&per-page=4&property-num-images=1`,
            headers: {
                'accept': 'application/json',
                'Accept-Language': 'en',
                'User-Agent': 'mobile'
            }
        });
    };

    const getCityId = (city) => {
        if (city !== '') {
            console.log(`Getting id for > ${city} <`);

            return rp({
                method: 'GET',
                uri: `https://api.m.hostelworld.com/2.1/suggestions/?text=${city}`,
                headers: {
                    'accept': 'application/json',
                    'Accept-Language': 'en'
                }
            });
        } 
    };

    function accommodationHandler(agent) {
        const params = agent.context.get('booking-context').parameters;
        let conv = agent.conv();
        console.log(conv);

        return getCityId(params['geo-city'])
            .then((searchResponse) => {
                const parsedSearch = JSON.parse(searchResponse);

                let city;
                for (let i = 0; i < parsedSearch.length; i++) {
                    if (parsedSearch[i].type == "city") {
                        console.log(parsedSearch[i]);
                        city = parsedSearch[i];
                        break;
                    }
                }

                if (!conv.screen) {
                    conv.ask('Sorry, try this on a screen device or select the phone surface in the simulator.');
                    return;
                }

                conv.ask(`I highly recommend you to visit ${city.name}!`);

                return getHostels(city)
                    .then((propertiesResponse) => {
                        const parsedProperties = JSON.parse(propertiesResponse).properties;
                        console.log(parsedProperties);

                        conv.ask(new Carousel({
                            title: `${city.name}'s Top 4`,
                            items: {
                                'OptionOne': {
                                    title: `${parsedProperties[0].name}`,
                                    description: `${parsedProperties[0].overallRating.overall / 10}/10!`,
                                    image: {
                                        url: `https://${parsedProperties[0].images[0].prefix + parsedProperties[0].images[0].suffix}`,
                                        accessibilityText: `${parsedProperties[0].name}`,
                                    },
                                },
                                'OptionTwo': {
                                    title: `${parsedProperties[1].name}`,
                                    description: `${parsedProperties[1].overallRating.overall / 10}/10!`,
                                    image: {
                                        url: `https://${parsedProperties[1].images[0].prefix + parsedProperties[1].images[0].suffix}`,
                                        accessibilityText: `${parsedProperties[1].name}`
                                    },
                                },
                                'OptionThree': {
                                    title: `${parsedProperties[2].name}`,
                                    description: `${parsedProperties[2].overallRating.overall / 10}/10!`,
                                    image: {
                                        url: `https://${parsedProperties[2].images[0].prefix + parsedProperties[2].images[0].suffix}`,
                                        accessibilityText: `${parsedProperties[2].name}`
                                    },
                                },
                                'OptionFour': {
                                    title: `${parsedProperties[3].name}`,
                                    description: `${parsedProperties[3].overallRating.overall / 10}/10!`,
                                    image: {
                                        url: `https://${parsedProperties[3].images[0].prefix + parsedProperties[3].images[0].suffix}`,
                                        accessibilityText: `${parsedProperties[3].name}`
                                    },
                                },
                            },
                        }));

                        agent.add(conv);
                    })
                    .catch((err) => {
                        agent.add("Uh oh, something is wrong TWO *bleeds*" + err);
                        return Promise.resolve(err);
                    });

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