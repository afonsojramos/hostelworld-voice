# Hostelworld Voice Assistant Integration

## Platforms

There are many platforms and tools available at our disposal, some required the whole Natural Language Processing (NLP) to be developed from scratch, others allowed the focus to be on User Experience (UX). 
But what we are truly looking for is a Natural Language Understanding (NLU) library, that can deal with machine reading comprehension, *ie* the post-processing of text. 

### Platform Choices

A few of the best Natural Language Understanding libraries in the market are [Snips NLU](https://snips-nlu.readthedocs.io/en/latest/index.html), which is a Python Open-Source library, [Rasa NLU](https://rasa.com/docs/), which is another great Python Open-Source library. 
Then we have some Closed-Source libraries like [LUIS.ai](https://docs.microsoft.com/en-gb/azure/cognitive-services/luis/what-is-luis) from Microsoft, [Alexa Custom Skills Kit](https://developer.amazon.com/docs/custom-skills) from Amazon and [Dialogflow](http://dialogflow.com/docs/) (previously Api.ai) from Google. 
Other honorable mentions go to [Botpress](https://github.com/botpress/botpress), a platform with built-in natural language processing (NLU), easy-to-use graphical interface and dialog manager, and to [Hubot](https://github.com/hubotio/hubot), a Open-Source javascript library available in the `npm` package manager.

However, since developing platform specific voice assistants is rather troublesome, tedious and repetitive (with additional knowledge required to actually replicate the features), we are reduced to the options that allow to "export" to multiple platforms at once, with Google Assistant support being a major objetive, due to the market of Android being comprised of 2.5 billion users.

We are then reduced to fully using Dialogflow, which obviously has a good integration with Google Assistant, and Rasa, which has a great [tutorial](https://blog.rasa.com/going-beyond-hey-google-building-a-rasa-powered-google-assistant/) to integrate Rasa developed models with Dialogflow, and, in turn, Google Assistant. 
Both of these allow us to parse sentences written in natural language and extract information in a structured way.

### Platform Performance

In August of 2017 an academic article/benchmark called [Evaluating Natural Language Understanding Services for Conversational Question Answering Systems](http://workshop.colips.org/wochat/@sigdial2017/documents/SIGDIAL22.pdf)  by Daniel Braun, Adrian Hernandez-Mendez, Florian Matthes and Manfred Langen and it analysed the [F1 Score](https://en.wikipedia.org/wiki/F1_score) of some platforms to establish a baseline on how to evaluate such platforms. 
In this article, the authors assessed the performance of API.ai (now Dialogflow, Google), Luis.ai (Microsoft), IBM Watson, and Rasa NLU. 
This paper has been referenced several times throughout several other papers and blog posts, and so, later on, [Snips](https://medium.com/snips-ai/an-introduction-to-snips-nlu-the-open-source-library-behind-snips-embedded-voice-platform-b12b1a60a41a) re-used the same evaluation technique to compare their own product with the market, and also used an updated version of Rasa NLU (both in dark blue), [NLP.js](https://chatbotslife.com/evaluating-nlu-for-chatbots-b19ecf5a2124) added tested their own platform and so did [Botfuel](https://medium.com/botfuel/benchmarking-intent-classification-services-june-2018-eb8684a1e55f).

![nlu comparison](https://github.com/snipsco/snips-nlu/raw/develop/.img/benchmarks.png)

Api.ai (now DialogFlow), however, does seem to perform not as well as expected. 
This seems to be because of the threshold: while other systems returns you the best intent (or list of intents) and the score, DialogFlow has a threshold so if the score is not enough, then return the Default Fallback Intent. 
By default this intent is set to 0.5, so if the probability score is lower than that, Default Fallback Intent is returned instead.
However, Dialogflow has since updated their API to version 2, as well as given overall improvements to the final product (like allowing to set the *importance* of an intent, making it possible to adjust the probability score needed), making it truly competitive with Rasa, which we previously mentioned that was our other option.

### Platform Choice Conclusion


## Dialogflow Implementation