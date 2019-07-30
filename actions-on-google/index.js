'use strict';

// Import the Dialogflow module from the Actions on Google client library.
const { dialogflow, BasicCard, Permission, Button, Carousel } = require('actions-on-google');
const rp = require('request-promise');
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({ debug: true });

app.intent('Dreaming Phase', (conv, { date, geo_city, duration, map_sort, room_type, hostel_type }) => {
    return getIDfromText(geo_city)
        .then(searchResponse => {
            const parsedSearch = JSON.parse(searchResponse);

            const city = parsedSearch.find(element => element.type === 'city');

            console.log(city);

            conv.ask(`I think you will enjoy my picks for ${city.name}!`);

            return getHostels(city, date, map_sort, hostel_type, duration, room_type)
                .then(propertiesResponse => {
                    const parsedProperties = JSON.parse(propertiesResponse).properties;
                    console.log(parsedProperties);

                    conv.ask(createPropertiesCarousel(city, parsedProperties, conv.screen));
                })
                .catch(err => {
                    conv.ask('Uh oh, something bad happened... Please try again later!');
                    console.log(err);
                    return Promise.resolve(err);
                });
        })
        .catch(err => {
            conv.ask('Uh oh, something bad happened... Please try again later!');
            console.log(err);
            return Promise.resolve(err);
        });
});

app.intent('Hostels - Hostel Selection', (conv, params, option) => {
    const { date, duration } = conv.contexts.input[`booking-context`].parameters;
    return getHostel(option)
        .then(detailedPropertyResponse => {
            const detailedProperty = JSON.parse(detailedPropertyResponse);

            const dateFrom = getCurrDate(date, 'dateFrom');
            const dateTo = addDays(date, duration, 'dateTo');
            const URI = `https://www.hostelworld.com/hosteldetails.php/${detailedProperty.id}?${dateFrom + dateTo}number_of_guests=2`;
            console.log(URI);

            conv.ask(
                `${detailedProperty.name} seems like a great choice! Click below to learn more!`,
                new BasicCard({
                    text: detailedProperty.description.substring(0, 256) + '...',
                    subtitle: `${detailedProperty.city.name}, ${detailedProperty.city.country}`,
                    title: detailedProperty.name,
                    buttons: new Button({
                        title: 'Find out more',
                        url: URI
                    }),
                    image: {
                        url: 'https://' + detailedProperty.images[0].prefix + detailedProperty.images[0].suffix,
                        alt: detailedProperty.name
                    }
                })
            );
        })
        .catch(err => {
            conv.ask('Uh oh, something bad happened... Please try again later!');
            console.log(err);
            return Promise.resolve(err);
        });
});

app.intent('Hostels - Permission Confirmed', (conv, params, confirmationGranted) => {
    const { name } = conv.user;
    const { location } = conv.device;
    const { date, map_sort, hostel_type, duration } = conv.contexts.input[`booking-context`].parameters;

    console.log(location);

    if (confirmationGranted && name && location && location.coordinates) {
        conv.ask(`Hello ${name.given}! ` + `I hope I can find something for you either in ${location.city} or anywhere else in the world!`);

        return getCityIdByCoords(location)
            .then(cityResponse => {
                const city = JSON.parse(cityResponse);
                conv.contexts.input[`booking-context`].parameters.geo_city = city.name;

                return getHostels(city, date, map_sort, hostel_type, duration)
                    .then(propertiesResponse => {
                        const parsedProperties = JSON.parse(propertiesResponse).properties;
                        console.log(parsedProperties);

                        if (parsedProperties.length > 0) {
                            conv.ask(`These are my recommendations for ${city.name}!`);
                            conv.ask(createPropertiesCarousel(city, parsedProperties, conv.screen));
                        } else {
                            conv.ask(`I'm sorry but I couldn't find anything near ${city.name}`);
                        }
                    })
                    .catch(err => {
                        conv.ask('Uh oh, something bad happened... Please try again later!');
                        console.log(err);
                        return Promise.resolve(err);
                    });
            })
            .catch(err => {
                conv.ask('Uh oh, something bad happened... Please try again later!');
                console.log(err);
                return Promise.resolve(err);
            });
    } else if (location.city) {
        return getIDfromText(location.city)
            .then(searchResponse => {
                const parsedSearch = JSON.parse(searchResponse);

                const city = parsedSearch.find(element => element.type === 'city');

                console.log(city);

                return getHostels(city, date, map_sort, hostel_type, duration)
                    .then(propertiesResponse => {
                        const parsedProperties = JSON.parse(propertiesResponse).properties;
                        console.log(parsedProperties);

                        if (parsedProperties.length > 0) {
                            conv.ask(`These are my recommendations for ${city.name}!`);
                            conv.ask(createPropertiesCarousel(city, parsedProperties, conv.screen));
                        } else {
                            conv.ask(`I'm sorry but I couldn't find anything near ${city.name}`);
                        }
                    })
                    .catch(err => {
                        conv.ask('Uh oh, something bad happened... Please try again later!');
                        console.log(err);
                        return Promise.resolve(err);
                    });
            })
            .catch(err => {
                conv.ask('Uh oh, something bad happened... Please try again later!');
                console.log(err);
                return Promise.resolve(err);
            });
    } else {
        conv.ask(`Looks like I can't get your location`);
    }
});

app.intent('Hostels', (conv, { date, geo_city, map_sort, hostel_type, duration }, confirmationGranted) => {
    if (geo_city === '') {
        var options;

        if (conv.screen) {
            options = {
                context: 'To address you by name and know your location',
                permissions: ['NAME', 'DEVICE_PRECISE_LOCATION']
            };
        } else {
            options = {
                context: 'To address you by name and know your location',
                permissions: ['NAME', 'DEVICE_COARSE_LOCATION']
            };
        }
        conv.ask(new Permission(options));
    } else {
        return getIDfromText(geo_city)
            .then(searchResponse => {
                const parsedSearch = JSON.parse(searchResponse);

                const city = parsedSearch.find(element => element.type === 'city');

                console.log(city);

                return getHostels(city, date, map_sort, hostel_type, duration)
                    .then(propertiesResponse => {
                        const parsedProperties = JSON.parse(propertiesResponse).properties;
                        console.log(parsedProperties);

                        if (parsedProperties.length > 0) {
                            conv.ask(`These are my recommendations for ${city.name}!`);
                            conv.ask(createPropertiesCarousel(city, parsedProperties, conv.screen));
                        } else {
                            conv.ask(`I'm sorry but I couldn't find anything near ${city.name}`);
                        }
                    })
                    .catch(err => {
                        conv.ask('Uh oh, something bad happened... Please try again later!');
                        console.log(err);
                        return Promise.resolve(err);
                    });
            })
            .catch(err => {
                conv.ask('Uh oh, something bad happened... Please try again later!');
                console.log(err);
                return Promise.resolve(err);
            });
    }
});

const getHostels = (city, date, map_sort, hostel_type, duration, room_type) => {
    console.log(`Getting properties for > ${city.name} <`);
    const dateStart = getCurrDate(date, 'date-start');
    const numNights = duration ? `num-nights=${convertToDays(duration)}&` : 'num-nights=2&';
    const mapSort = map_sort ? 'sort=' + map_sort + '&' : '';
    const hostelType = hostel_type ? 'property-type=' + hostel_type + '&' : '';
    const roomType = room_type ? '&room-type=dorm' + room_type : '';

    const URI = `https://api.m.hostelworld.com/2.1/cities/${city.id}/properties/?${dateStart + numNights + mapSort}currency=EUR&page=1&per-page=4&${hostelType}property-num-images=1${roomType}`;

    console.log(URI);

    return rp({
        method: 'GET',
        uri: URI,
        headers: {
            accept: 'application/json',
            'Accept-Language': 'en',
            'User-Agent': 'mobile'
        }
    });
};

const getHostel = property => {
    const URI = `https://api.m.hostelworld.com/2.1/properties/${property}`;

    return rp({
        method: 'GET',
        uri: URI,
        headers: {
            accept: 'application/json',
            'Accept-Language': 'en'
        }
    });
};

const convertToDays = duration => {
    switch (duration.unit) {
        case 'day':
            return duration.amount;

        case 'wk':
            return duration.amount * 7;

        case 'mo':
            return duration.amount * 30;

        default:
            return false;
    }
};

const getIDfromText = city => {
    if (city) {
        console.log(`Getting id for > ${city} <`);

        return rp({
            method: 'GET',
            uri: `https://api.m.hostelworld.com/2.1/suggestions/?text=${city}`,
            headers: {
                accept: 'application/json',
                'Accept-Language': 'en'
            }
        });
    }
};

const getCityIdByCoords = location => {
    if (location.coordinates.latitude && location.coordinates.longitude) {
        console.log(`Getting id by coords for > ${location.formattedAddress} <`);

        const URI = `https://api.m.hostelworld.com/2.1/cities/?longitude=${location.coordinates.longitude}&latitude=${location.coordinates.latitude}`;

        console.log(URI);

        return rp({
            method: 'GET',
            uri: URI,
            headers: {
                accept: 'application/json',
                'Accept-Language': 'en'
            }
        });
    }
};

const getCurrDate = (date, query) => {
    if (!date) {
        const today = new Date();
        const dateString = `${today.getUTCFullYear()}-${('0' + (today.getUTCMonth() + 1)).slice(-2)}-${('0' + today.getUTCDate()).slice(-2)}`;
        return `${query}=${dateString}&`;
    } else {
        return `${query}=${date.substring(0, 10)}&`;
    }
};

const addDays = (date, duration, query) => {
    var nextDate;
    if (date) {
        nextDate = new Date(date);
    } else {
        nextDate = new Date();
    }
    nextDate.setUTCDate(nextDate.getUTCDate() + (duration ? convertToDays(duration) : 2));
    const dateString = `${nextDate.getUTCFullYear()}-${('0' + (nextDate.getUTCMonth() + 1)).slice(-2)}-${('0' + nextDate.getUTCDate()).slice(-2)}`;
    return `${query}=${dateString}&`;
};

const createPropertiesCarousel = (city, parsedProperties, screen) => {
    if (screen) {
        const items = [];
        parsedProperties.map(prop => {
            const result = {
                optionInfo: {
                    key: `${prop.id}`
                },
                title: `${prop.name}`,
                description: `${prop.overallRating ? prop.overallRating.overall / 10 : '??'}/10!`,
                image: {
                    url: `https://${prop.images[0].prefix + prop.images[0].suffix}`,
                    accessibilityText: `${prop.name}`
                }
            };

            items.push(result);
        });

        return new Carousel({
            items: items
        });
    } else {
        var verbalOutput = `${city.name}'s Top ${parsedProperties.length} properties are comprised of `;

        parsedProperties.map((prop, index) => {
            if (index === parsedProperties.length - 1) {
                verbalOutput += `and ${prop.name}. Which one are you interested in?`;
            } else {
                verbalOutput += ` ${prop.name},`;
            }
        });

        return verbalOutput;
    }
};

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
