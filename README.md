# Hostelworld Voice Assistant Integration

![hostelworld](http://www.hostelworldgroup.com/~/media/Images/H/Hostelworld-v2/image-gallery/logos/master-lock-up-light-backgrounds.png)

This project was made over around 4 weeks, where after those 4 weeks I worked on a project for the HostelWorld API where speeds were increased on up to 20x.

## Index

1. [Platforms](#Platforms)
   1. [Platform Choices](##Platform-Choices)
   2. [Platform Performance](##Platform-Performance)
   3. [Platform Choice Conclusion](##Platform-Choice-Conclusion)
2. [Dialogflow Implementation](#Dialogflow-Implementation)

# Platforms

There are many platforms and tools available at our disposal, some required the whole Natural Language Processing (NLP) to be developed from scratch, others allowed the focus to be on User Experience (UX). But what we are truly looking for is a Natural Language Understanding (NLU) library, that can deal with machine reading comprehension, _ie_ the post-processing of text.

## Platform Choices

A few of the best Natural Language Understanding libraries in the market are [Snips NLU](https://snips-nlu.readthedocs.io/en/latest/index.html), which is a Python Open-Source library, [Rasa NLU](https://rasa.com/docs/), which is another great Python Open-Source library. Then we have some Closed-Source libraries like [LUIS.ai](https://docs.microsoft.com/en-gb/azure/cognitive-services/luis/what-is-luis) from Microsoft, [Alexa Custom Skills Kit](https://developer.amazon.com/docs/custom-skills) from Amazon and [Dialogflow](http://dialogflow.com/docs/) (previously Api.ai) from Google. Other honourable mentions go to [Botpress](https://github.com/botpress/botpress), a platform with built-in natural language processing (NLU), easy-to-use graphical interface and a dialog manager, and to [Hubot](https://github.com/hubotio/hubot), a Open-Source javascript library available in the `npm` package manager.

However, since developing platform specific voice assistants is rather troublesome, tedious and repetitive (with additional knowledge required to actually replicate the features), we are reduced to the options that allow to "export" to multiple platforms at once, with Google Assistant support being a major objective, due to the market of Android being comprised of 2.5 billion users.

We are then reduced to fully using Dialogflow, which obviously has a good integration with Google Assistant, and Rasa, which has a great [tutorial](https://blog.rasa.com/going-beyond-hey-google-building-a-rasa-powered-google-assistant/) to integrate Rasa developed models with Dialogflow, and, in turn, Google Assistant. Both of these allow us to parse sentences written in natural language and extract information in a structured way.

## Platform Performance

In August of 2017 an academic article/benchmark called [Evaluating Natural Language Understanding Services for Conversational Question Answering Systems](http://workshop.colips.org/wochat/@sigdial2017/documents/SIGDIAL22.pdf) by Daniel Braun, Adrian Hernandez-Mendez, Florian Matthes and Manfred Langen and it analysed the [F1 Score](https://en.wikipedia.org/wiki/F1_score) of some platforms to establish a baseline on how to evaluate such platforms. In this article, the authors assessed the performance of API.ai (now Dialogflow, Google), Luis.ai (Microsoft), IBM Watson, and Rasa NLU. This paper has been referenced several times throughout several other papers and blog posts, and so, later on, [Snips](https://medium.com/snips-ai/an-introduction-to-snips-nlu-the-open-source-library-behind-snips-embedded-voice-platform-b12b1a60a41a) re-used the same evaluation technique to compare their own product with the market, and also used an updated version of Rasa NLU (both in dark blue), [NLP.js](https://chatbotslife.com/evaluating-nlu-for-chatbots-b19ecf5a2124) added tested their own platform and so did [Botfuel](https://medium.com/botfuel/benchmarking-intent-classification-services-june-2018-eb8684a1e55f).

![nlu comparison](https://github.com/snipsco/snips-nlu/raw/master/.img/benchmarks.png)

Api.ai (now Dialogflow), however, does seem to perform not as well as expected. This seems to be because of the threshold: while other systems returns you the best intent (or list of intents) and the score, Dialogflow has a threshold so if the score is not enough, then return the Default Fallback Intent. By default this intent is set to 0.5, so if the probability score is lower than that, Default Fallback Intent is returned instead. However, Dialogflow has since updated their API to version 2, as well as given overall improvements to the final product (like allowing to set the _importance_ of an intent, making it possible to adjust the probability score needed), making it truly competitive with Rasa, which we previously mentioned that was our other option.

## Platform Choice Conclusion

In the end, we ended up with two great options, **Dialogflow** and **Rasa NLU**, both of which have great performance and complete with all the necessary features. While Dialogflow is a complete closed source product with a fully functional API and graphical web interface. Rasa (NLU + Core) are Open-Source Python libraries that require slightly lower level development. But, in the end, both try to abstract some of the difficulty of working with Machine Learning to build a chatbot.

All in all, it comes to the following differences:

**_Dialogflow_**

- Most complete tool for the creation of a chatbot, doing almost everything you need for most chatbots.
- Handles classification of `intents` and `entities`, and uses what it calls `context` to handle `dialogue`. Allows webhooks for `fulfillment`.
- One thing it does not have that is often desirable for chatbots is some form of end user management.
- It has a robust API, which allows you to define `entities`/`intents`/etc either via the API or their web based interface.
- Cannot be operated on premise.

**_Rasa NLU + Core_**

- To get close to the same level of functionality as Dialogflow you have to use both Rasa NLU and Rasa Core. Rasa NLU handles `projects`/`intents`/`entities` whereas Rasa Core handles `dialogue` and `fulfillment`.
- Rasa doesn't provide a complete open source GUI leaving most of your interactions with NLU in JSON or markdown. And Rasa Core requires direct python development to customize your bot.
- Also does not directly offer any sort of user info management.
- The Rasa team does not provide hosting (at least outside of their enterprise offerings) and you will be **responsible for hosting** and thus **ownership of the data**.
- Can be operated on premise.

Taking these differences into account, **Dialogflow** is the most complete, and thus, the obvious choice for assistant development. However, there is a full-featured bot framework called [**Articulate**](https://spg.ai/projects/articulate/) that is being developed on [GitHub](https://github.com/samtecspg/articulate) which:

- Uses **Rasa NLU** for understanding and custom context based code for dialogue, making it work closer to how **Dialogflow** does than **Rasa Core**;
- Has a `HTTP API` for creating `intents`, `entities`, and interacting with `agents`;
- Presents itself with a GUI similar to Dialogflow that is fully open source;
- Data and interface can be hosted in the cloud or on premise.

It is hard to say what to expect of the future, and impossible to predict which platform will become the best and most complete one, since Articulate, being Open-Source, might overrun Dialogflow, but Dialogflow can also go Open-Source, making the future uncertain. Nevertheless, for now, Dialogflow wins and it will be our pick.

# Dialogflow Implementation

A Dialogflow's "application" is called an `agent`, and to access its full features one must grasp a few key concepts, namely: how to define a good natural language understanding model; how to extract parameters with `entities`, which let you define how data is extracted from user utterances; how to manage states with `contexts`, which lets you maintain a conversation state across throughout a conversation; and how to integrate with the Google Assistant using `agent fulfilment`, which lets you test and deploy your Dialogflow `agent` as `actions` that users can invoke through the Assistant.

First of all, let's try to understand some of the concepts:

- [Agents](https://cloud.google.com/dialogflow/docs/agents-overview)
- [Intents](https://cloud.google.com/dialogflow/docs/intents-overview)
- [Entities](https://cloud.google.com/dialogflow/docs/entities-overview)
- [Contexts](https://cloud.google.com/dialogflow/docs/contexts-input-output)
- [Events](https://cloud.google.com/dialogflow/docs/events-overview)
- [Fulfillment](https://cloud.google.com/dialogflow/docs/fulfillment-overview)

When working with **fulfillment** it is also necessary to understand concepts **Webhooks**. A Webhook (also called a web callback or HTTP push API) is a way for an app to provide other applications with real-time information. A webhook delivers data to other applications as it happens, meaning you get data immediately. Unlike typical APIs where you would need to poll for data very frequently in order to get it real-time. This makes webhooks much more efficient for both provider and consumer. The only drawback to webhooks is the difficulty of initially setting them up, but in this case we have the [WebhookClient](https://dialogflow.com/docs/reference/fulfillment-library/webhook-client) class that handles the communication with Dialogflow's webhook fulfillment API with support for rich responses across the 8 supported platforms. While if you want to customise the UI presented at visual assistants you should take a look at [Rich Responses in Dialogflow](https://dialogflow.com/docs/reference/fulfillment-library/rich-responses) and [Actions on Google Responses](https://developers.google.com/actions/assistant/responses).

## First Steps

If you're trying to build a Dialogflow Agent yourself, before reading about my implementation I suggest that you start by reading their tutorial on [how to build an agent](https://cloud.google.com/dialogflow/docs/tutorials/build-an-agent/), [how to customise it](https://cloud.google.com/dialogflow/docs/tutorials/build-an-agent/create-customize-agent), [how to add parameters to an intent](https://cloud.google.com/dialogflow/docs/tutorials/build-an-agent/create-intent-with-parameters) and [how to implement fulfillment using webhooks](https://cloud.google.com/dialogflow/docs/tutorials/build-an-agent/create-fulfillment-using-webhook).

Now you can read how my journey went! 👷

## My Implementation

With the knowledge we've gathered above, we can now proceed to do something more meaningful and, as such, I've integrated the Google Places API for [search](https://developers.google.com/places/web-service/search) and for [photo providing](https://developers.google.com/places/web-service/photos).

After understanding the main concepts we can use the `@google/maps` Node.js library available on [GitHub](https://github.com/googlemaps/google-maps-services-js) with further documentation on each methods [here](https://googlemaps.github.io/google-maps-services-js/docs/GoogleMapsClient.html) I was quickly able to implement an Action that gathered the top 4 Museums of a given location. However, looking back, this was a good implementation of an initial agent with limited functionality, but it was flawed. All the information had to come from speech, and there wasn't a clear distinction of the use of the Dialogflow API and Actions on Google API, which would end up being troublesome when requesting for some [permissions](https://developers.google.com/actions/reference/rest/Shared.Types/Permission) with the help of [helper intents](https://developers.google.com/actions/assistant/helpers#helper_intents).

My next step was starting to use the Hostelworld API and learning its intricacies, defining what I wanted from it, and understanding the possibilities of the calls I was going to use. At first, I started with an initial implementation replicating the google maps one which was done with ease, despite some minor problems, but they were quickly solved and the next challenge showed up: **permissions to access user location**, to, for example, ask "Where can I stay around here?", without defining user location.

### Location

To clarify what must happen, one needs to ask for the user's location permissions first, and if the user gives the permission, their location will be made available in the request JSON. Two different kinds of location can be asked for, _DEVICE_PRECISE_LOCATION_ will give you their exact latitude and longitude, only available on mobile, and _DEVICE_COARSE_LOCATION_ will provide you with broader location information, which is also available on, for example, Google Home. This way, we can support all kinds of devices! With this informations, using the coordinates, I can query the Hostelworld API to get the closest location to the coordinates (if it is a phone), or query the city name to get the first city that appears from the search, if it's a Google Home. Note that the event _actions_intent_PERMISSION_ needs to be attached to any Intent that uses the information the user authorized to be sent and handled by the defined Intent through the webhook.

### Dynamic Carousel

Actions on Google Documentation is good, but it falls short in some aspects, like explaining how to create a Dynamic Carousel. But through fire and flames, I have created a dynamic carousel that displays at most 4 options, and it only took a day of frustration due to the elements' keys being discarded and attributed new ones, which was due to `items` being initialized as an object instead of a array. This was important because with this I could save the property ID to use after the user selected its option! At first, I was handling the clicks by recognizing the hostel name of the click and identifying it by using an entity which had all the hostels, but this quickly demonstrated to be a highly bad implementation.

### Conclusion

This implementation was highly multi-faced, both with the understanding of the Dialogflow platform and the Webhook development. My presence in a team that mostly develops and follows a functional programming javascript paradigm has also led me to get rid of all for loops and gave me quite an insight into the design pattern! Furthermore, a lot of bugs showed up, many that would go unnoticed in most cases, which required a big awareness of every single detail, even one where the "today's" Date was giving the API a past date, since the Google Cloud Function was running on a US server, ie, a different timezone. Other abnormalities that occurred were location data would sometimes come without a city, but always came with a formatted address and coordinates, so I had to take that into consideration, even if it wasn't something that is present in any documentation. Regarding the Hostelworld API there weren't many mishaps, just some (lesser known) cities that came with no properties, stays couldn't be longer than 31 and dates that had to be in a specific format and thus led me to create a function just to build dates to feed the API.

Finally, even though I already knew the concept behind Daily Scrums, I only had Weekly Scrums due to University time limitations, and they were incredibly useful to fully create a synergy between all team members. However, the most enriching "project management" activity was the brainstorm meeting with Hostelworld's Head of Engineering to develop a sort of IntentMap to structure the possible paths that a user could take while using this Action.
