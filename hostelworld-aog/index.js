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

app.intent('Hostels - Permission Confirmed', (conv, params, confirmationGranted) => {
    const { name } = conv.user;
    const { location } = conv.device;
    const { date, geo_city, map_sort, hostel_type } = conv.contexts.input[`booking-context`].parameters;

    console.log(location);

    if (confirmationGranted && name && location) {
        conv.ask(`Hello ${name.given}! Nice to meet you! ` +
            `I hope I can find something for you either in ${location.city} or anywhere else in the world!`);

        if (geo_city === '') {
            conv.contexts.input[`booking-context`].parameters.geo_city = location.city;

            return getCityId(location.city)
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

                    conv.ask(`These are my recomendations for ${city.name}!`);

                    return getHostels(city)
                        .then((propertiesResponse) => {
                            const parsedProperties = JSON.parse(propertiesResponse).properties;
                            console.log(parsedProperties);

                            conv.ask(createPropertiesCarousel(city, parsedProperties, conv.screen));
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
        } else {
            conv.ask(`Where are you looking to stay at?`);
            return;
        }

    } else {
        conv.ask(`Looks like I can't get your location`);
    }


});

app.intent('Hostels', (conv, { date, geo_city, map_sort, hostel_type }, confirmationGranted) => {

    if (geo_city === '' && !conv.user.permissions.includes('DEVICE_PRECISE_LOCATION') && !conv.user.permissions.includes('DEVICE_COARSE_LOCATION')) {

        var options;

        if (conv.screen) {
            options = {
                context: 'To address you by name and know your location',
                permissions: ['NAME', 'DEVICE_PRECISE_LOCATION'],
            };
        } else {
            options = {
                context: 'To address you by name and know your location',
                permissions: ['NAME', 'DEVICE_COARSE_LOCATION'],
            };
        }
        conv.ask(new Permission(options));

        return;

    } else if (geo_city === '' && (conv.user.permissions.includes('DEVICE_PRECISE_LOCATION') || conv.user.permissions.includes('DEVICE_COARSE_LOCATION'))) {
        const { location } = conv.device;
        geo_city = location.city;
    }

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

            conv.ask(`These are my recomendations for ${city.name}!`);

            return getHostels(city, map_sort, hostel_type)
                .then((propertiesResponse) => {
                    const parsedProperties = JSON.parse(propertiesResponse).properties;
                    console.log(parsedProperties);

                    conv.ask(createPropertiesCarousel(city, parsedProperties, conv.screen));
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
    if (city) {
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

const createPropertiesCarousel = (city, parsedProperties, screen) => {
    if (screen) {
        return new Carousel({
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
        });
    }
    else {
        return `${city.name}'s Top 4 hostels are comprised of ${parsedProperties[0].name}, ${parsedProperties[1].name}, ${parsedProperties[2].name} and ${parsedProperties[3].name}. Which one are you interested in?`;
    }
};

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);