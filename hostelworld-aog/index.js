'use strict';

// Import the Dialogflow module from the Actions on Google client library.
const { dialogflow,
    SimpleResponse,
    BasicCard,
    Suggestions,
    Permission,
    UpdatePermission,
    RegisterUpdate,
    List,
    Carousel } = require('actions-on-google');
const rp = require('request-promise');
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({ debug: true });

// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
app.intent('Hostels', (conv, { date, geo_city, map_sort, hostel_type }) => {
    const params = conv.contexts.get('booking-context').parameters;
    console.log(params);
    console.log(date, geo_city, map_sort, hostel_type);

    return getCityId(geo_city)
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
                })
                .catch((err) => {
                    conv.ask("Uh oh, something is wrong TWO *bleeds*" + err);
                    return Promise.resolve(err);
                });

        })
        .catch((err) => {
            conv.ask("Uh oh, something is wrong *bleeds*" + err);
            return Promise.resolve(err);
        });
});

const getHostels = (city) => {
    console.log(`Getting properties for > ${city.name} <`);

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
        console.log(`Getting id for > ${city} <`);

        return rp({
            method: 'GET',
            uri: `https://api.m.hostelworld.com/2.1/suggestions/?text=${city}`,
            headers: {
                'accept': 'application/json',
                'Accept-Language': 'en'
            }
        });
};

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);