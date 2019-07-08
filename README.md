# Hostelworld Voice Assistant Integration

## Platforms

There are many platforms and tools available at our disposal, some required the whole Natural Language Processing (NLP) to be developed from scratch, others allowed the focus to be on User Experience (UX). But what we are truly looking for is a Natural Language Understanding (NLU) library, that can deal with machine reading comprehension, *ie* the post-processing of text. 

### Platform Choices

A few of the best Natural Language Understanding libraries in the market are [Snips NLU](https://snips-nlu.readthedocs.io/en/latest/index.html), which is a Python Open-Source library, [Rasa NLU](https://rasa.com/docs/), which is another great Python Open-Source library. Then we have some Closed-Source libraries like [LUIS.ai](https://docs.microsoft.com/en-gb/azure/cognitive-services/luis/what-is-luis) from Microsoft, [Alexa Custom Skills Kit](https://developer.amazon.com/docs/custom-skills) from Amazon and [Dialogflow](http://dialogflow.com/docs/) (previously Api.ai) from Google. Other honorable mentions go to [Botpress](https://github.com/botpress/botpress), a platform with built-in natural language processing (NLU), easy-to-use graphical interface and dialog manager, and to [Hubot](https://github.com/hubotio/hubot), a Open-Source javascript library available in the `npm` package manager.

However, since developing platform specific voice assistants is rather troublesome, tedious and repetitive (with additional knowledge required to actually replicate the features), we are reduced to the options that allow to "export" to multiple platforms at once, with Google Assistant support being a major objetive, due to the market of Android being comprised of 2.5 billion users.

We are then reduced to fully using Dialogflow, which obviously has a good integration with Google Assistant, and Rasa, which has a great [tutorial](https://blog.rasa.com/going-beyond-hey-google-building-a-rasa-powered-google-assistant/) to integrate Rasa developed models with Dialogflow, and, in turn, Google Assistant. Both of these allow us to parse sentences written in natural language and extract information in a structured way.