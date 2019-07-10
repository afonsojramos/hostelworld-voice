# Hostelworld Voice Assistant Integration

![hostelworld](http://www.hostelworldgroup.com/~/media/Images/H/Hostelworld-v2/image-gallery/logos/master-lock-up-light-backgrounds.png)

## Index

1. [Platforms](#Platforms)
    1. [Platform Choices](##Platform-Choices)
    2. [Platform Performance](##Platform-Performance)
    3. [Platform Choice Conclusion](##Platform-Choice-Conclusion)
2. [Dialogflow Implementation](#Dialogflow-Implementation)

# Platforms

There are many platforms and tools available at our disposal, some required the whole Natural Language Processing (NLP) to be developed from scratch, others allowed the focus to be on User Experience (UX). 
But what we are truly looking for is a Natural Language Understanding (NLU) library, that can deal with machine reading comprehension, *ie* the post-processing of text. 

## Platform Choices

A few of the best Natural Language Understanding libraries in the market are [Snips NLU](https://snips-nlu.readthedocs.io/en/latest/index.html), which is a Python Open-Source library, [Rasa NLU](https://rasa.com/docs/), which is another great Python Open-Source library. 
Then we have some Closed-Source libraries like [LUIS.ai](https://docs.microsoft.com/en-gb/azure/cognitive-services/luis/what-is-luis) from Microsoft, [Alexa Custom Skills Kit](https://developer.amazon.com/docs/custom-skills) from Amazon and [Dialogflow](http://dialogflow.com/docs/) (previously Api.ai) from Google. 
Other honorable mentions go to [Botpress](https://github.com/botpress/botpress), a platform with built-in natural language processing (NLU), easy-to-use graphical interface and dialog manager, and to [Hubot](https://github.com/hubotio/hubot), a Open-Source javascript library available in the `npm` package manager.

However, since developing platform specific voice assistants is rather troublesome, tedious and repetitive (with additional knowledge required to actually replicate the features), we are reduced to the options that allow to "export" to multiple platforms at once, with Google Assistant support being a major objetive, due to the market of Android being comprised of 2.5 billion users.

We are then reduced to fully using Dialogflow, which obviously has a good integration with Google Assistant, and Rasa, which has a great [tutorial](https://blog.rasa.com/going-beyond-hey-google-building-a-rasa-powered-google-assistant/) to integrate Rasa developed models with Dialogflow, and, in turn, Google Assistant. 
Both of these allow us to parse sentences written in natural language and extract information in a structured way.

## Platform Performance

In August of 2017 an academic article/benchmark called [Evaluating Natural Language Understanding Services for Conversational Question Answering Systems](http://workshop.colips.org/wochat/@sigdial2017/documents/SIGDIAL22.pdf)  by Daniel Braun, Adrian Hernandez-Mendez, Florian Matthes and Manfred Langen and it analysed the [F1 Score](https://en.wikipedia.org/wiki/F1_score) of some platforms to establish a baseline on how to evaluate such platforms. 
In this article, the authors assessed the performance of API.ai (now Dialogflow, Google), Luis.ai (Microsoft), IBM Watson, and Rasa NLU. 
This paper has been referenced several times throughout several other papers and blog posts, and so, later on, [Snips](https://medium.com/snips-ai/an-introduction-to-snips-nlu-the-open-source-library-behind-snips-embedded-voice-platform-b12b1a60a41a) re-used the same evaluation technique to compare their own product with the market, and also used an updated version of Rasa NLU (both in dark blue), [NLP.js](https://chatbotslife.com/evaluating-nlu-for-chatbots-b19ecf5a2124) added tested their own platform and so did [Botfuel](https://medium.com/botfuel/benchmarking-intent-classification-services-june-2018-eb8684a1e55f).

![nlu comparison](https://github.com/snipsco/snips-nlu/raw/develop/.img/benchmarks.png)

Api.ai (now DialogFlow), however, does seem to perform not as well as expected. 
This seems to be because of the threshold: while other systems returns you the best intent (or list of intents) and the score, DialogFlow has a threshold so if the score is not enough, then return the Default Fallback Intent. 
By default this intent is set to 0.5, so if the probability score is lower than that, Default Fallback Intent is returned instead.
However, Dialogflow has since updated their API to version 2, as well as given overall improvements to the final product (like allowing to set the *importance* of an intent, making it possible to adjust the probability score needed), making it truly competitive with Rasa, which we previously mentioned that was our other option.

## Platform Choice Conclusion

In the end, we ended up with two great options, **Dialogflow** and **Rasa NLU**, both of which have great performance and complete with all the necessary features. 
While Dialogflow is a complete closed source product with a fully functional API and graphical web interface.
Rasa (NLU + Core) are Open-Source Python libraries that require slightly lower level development. But, in the end, both try to abstract some of the difficulty of working with Machine Learning to build a chatbot.

All in all, it comes to the following differences:

***Dialogflow***

* Most complete tool for the creation of a chatbot, doing almost everything you need for most chatbots.
* Handles classification of `intents` and `entities`, and uses what it calls `context` to handle `dialogue`. Allows webhooks for `fulfillment`.
* One thing it does not have that is often desirable for chatbots is some form of end user management.
* It has a robust API, which allows you to define `entities`/`intents`/etc either via the API or their web based interface.
* Cannot be operated on premise. 

***Rasa NLU + Core***

* To get close to the same level of fucntionality as Dialogflow you have to use both Rasa NLU and Rasa Core. Rasa NLU handles `projects`/`intents`/`entities` whereas Rasa Core handles `dialogue` and `fulfillment`.
* Rasa doesn't provide a complete open source GUI leaving most of your interactions with NLU in JSON or markdown. And Rasa Core requires direct python development to customize your bot.
* Also does not directly offer any sort of user info management.
* The Rasa team does not provide hosting (at least outside of their enterprise offerings) and you will be **responsible for hosting** and thus **ownership of the data**.
* Can be operated on premise.

Taking these differences into account, **Dialogflow** is the most complete, and thus, the obvious choice for assistant development.
However, there is a full-featured bot framework called [**Articulate**](https://spg.ai/projects/articulate/) that is being developed on [GitHub](https://github.com/samtecspg/articulate) which: 
* Uses **Rasa NLU** for understanding and custom context based code for dialog, making it work closer to how **Dialogflow** does than **Rasa Core**; 
* Has a `HTTP API` for creating `intents`, `entities`, and interacting with `agents`; 
* Presents itself with a GUI similar to Dialogflow that is fully open source; 
* Data and interface can be hosted in the cloud or on premise. 

It is hard to say what to expect of the future, and impossible to predict which platform will become the best and most complete one, since Articulate, being Open-Source, might overrun Dialogflow, but Dialogflow can also go Open-Source, making the future uncertain. Nevertheless, for now, Dialogflow wins and it will be our pick.

# Dialogflow Implementation

A Dialogflow's "application" is called an `agent`, and to access its full features one must grasp a few key concepts, namely: how to define a good natural language understanding model; how to extract parameters with `entities`, which let you define how data is extracted from user utterances; how to manage states with `contexts`, which lets you maintain a conversation state across throughout a conversation; and how to integrate with the Google Assistant using `agent fullfilment`, which lets you test and deploy your Dialogflow `agent` as `actions` that users can invoke through the Assistant.

First of all we need to [create an account](https://dialogflow.com/docs/getting-started/create-account) and then we can start to [create our first agent](https://dialogflow.com/docs/getting-started/first-agent)!

Afterwards you may want to investigate the following:

* [Agents](https://dialogflow.com/docs/agents)
* [Intents](https://dialogflow.com/docs/intents)
* [Entities](https://dialogflow.com/docs/entities) and [how extract them](https://dialogflow.com/docs/getting-started/extract-entities)
* [Contexts](https://dialogflow.com/docs/agents) and [how to manage states with them](https://dialogflow.com/docs/getting-started/state-contexts)
* [Fulfillment](https://dialogflow.com/docs/fulfillment) and [Fulfillment's inner workings](https://dialogflow.com/docs/integrations/actions/integration)
* Furthermore you should learn [how to configure fulfillment](https://dialogflow.com/docs/fulfillment/configure) and [how to integrate them in Actions on Google](https://dialogflow.com/docs/agents)

When working with **fulfillment** it is also necessary to understand concepts like [Webhooks](https://dialogflow.com/docs/reference/fulfillment-library/webhook-client). While if you want to customise the UI presented at visual assistants you should take a look at [Rich Responses in Dialogflow](https://dialogflow.com/docs/reference/fulfillment-library/rich-responses) and [Actions on Google Reponses](https://developers.google.com/actions/assistant/responses).

I will not try to recreate documentation or articles I've used as research, so I'll just leave them here: [DialogFlow : A Complete Guide with Webhook](https://medium.com/leboncoin-engineering-blog/dialogflow-a-complete-guide-with-webhook-85b8456b4e1d), [Dialogflow web hooks: how to develop locally and deploy to Cloud Functions](https://medium.com/@antonyharfield/dialogflow-web-hooks-how-to-develop-locally-and-deploy-to-cloud-functions-48839919e998) and [Building a voice-enabled Chatbot for a website using Dialogflow, Fulfillment + Firebase cloud functions and jQuery](https://medium.com/byteridge/building-a-voice-enabled-chat-bot-for-a-website-using-dialogflow-firebase-jquery-3a10a3a36e2)

## First Steps

With the knowledge we've gathered above, we can now proceed to do something more meaningful and, as such, I've integrated the Google Places API for [search](https://developers.google.com/places/web-service/search) and for [photo providing](https://developers.google.com/places/web-service/photos).

After understanding the main concepts we can use the `@google/maps` Node.js library available on [GitHub](https://github.com/googlemaps/google-maps-services-js) with further documentation on each methods [here](https://googlemaps.github.io/google-maps-services-js/docs/GoogleMapsClient.html).



