'use strict';

const config = require('config')
const router = require('express').Router()
const vntk = require('vntk')
const handlebars = require('handlebars')
const IntentClassifier = require('../core/intentClassifier')
const SequenceLabeler = require('../core/sequenceLabeler')
const storyModel = require('../models/story');

const intentClassifier = new IntentClassifier()
const sequenceLabeler = new SequenceLabeler()
const tagger = vntk.posTag()
const wordSent = vntk.wordSent()

// load config name
const DEFAULT_WELCOME_INTENT_NAME = config.get('modelConfig.DEFAULT_WELCOME_INTENT_NAME')
const DEFAULT_FALLBACK_INTENT_NAME = config.get('modelConfig.DEFAULT_FALLBACK_INTENT_NAME')

function buildCompleteResponse(story, req) {
    let input = req.param('input')
    let result = req.body
    let parameters = []
    if (!story) {
        throw new Error('Not found story: ' + input)
    } if (story.parameters) {
        parameters = story.parameters
    }

    // check fulfill is complete
    result['missingParameters'] = []
    result['extractedParameters'] = {}
    result['parameters'] = []
    result['input'] = input;
    // result['complete'] = false

    let storyId = story._id.toString()
    result['intent'] = {
        name: story.intentName,
        storyId: storyId,
    }
    let extractedParameters = []
    let missingParameters = []
    if (parameters.length > 0) {
        extractedParameters = sequenceLabeler.predict(storyId, input);
        console.log('sequenceLabeler predict: ', extractedParameters)

        // check required parameters
        result['parameters'] = parameters.map((p) => {
            if (p.required && typeof extractedParameters[p.name] == 'undefined') {
                missingParameters.push(p)
            }

            return {
                name: p.name,
                type: p.type,
                required: p.required
            }
        })

        result['extractedParameters'] = extractedParameters
        result['missingParameters'] = missingParameters.map((p) => p.name)

        if (missingParameters.length > 0) {
            result['complete'] = false
            result['currentNode'] = missingParameters[0].name
            result['speechResponse'] = missingParameters[0].prompt
        } else {
            result['complete'] = true
            result['parameters'] = extractedParameters
        }
    } else {
        result['complete'] = true
    }
    return Promise.resolve(result)
}

function buildNonCompleteResponse(story, req) {
    let result = req.body

    if (story.intentName === 'cancel') {
        result['currentNode'] = ''
        result['missingParameters'] = []
        result['parameters'] = {}
        result['intent'] = {}
        result['complete'] = true
        return Promise.resolve(result)
    } else {
        let storyId = req.param('intent').storyId
        let currentNode = req.param('currentNode')
        let extractedParameters = req.param('extractedParameters', {})
        let missingParameters = req.param('missingParameters', [])
        let currentNodeIndex = missingParameters.indexOf(currentNode)

        extractedParameters[currentNode] = req.param('input')
        missingParameters.splice(currentNodeIndex, 1)

        if (missingParameters.length > 0) {
            return storyModel.findById(storyId)
                .lean()
                .then((story) => {
                    result['complete'] = false
                    let missingParameter = missingParameters[0]
                    currentNode = story.parameters.filter((p) => p.name === missingParameter)[0]
                    result['currentNode'] = currentNode.name
                    result['speechResponse'] = currentNode.prompt
                    return result
                })
        } else {
            result['complete'] = true
            result['parameters'] = extractedParameters
            return Promise.resolve(result)
        }
    }
}

router.get('/train/:id', (req, res, next) => {
    let storyId = req.param('id')
    intentClassifier.train()
        .then(result => {
            return sequenceLabeler.trainStory(storyId);
        })
        .then((result) => {
            res.json(result)
        })
        .catch(err => {
            res.status(500).end(err)
        })
})

router.get('/pos/:text', (req, res, next) => {
    let text = req.param('text')
    let tags = tagger.tag(text).map((tokens) => [tokens[0], tokens[1], 'O'])

    res.json(tags)
})

router.get('/tok/:text', (req, res, next) => {
    let text = req.param('text')
    let tokens = wordSent.tag(text);
    res.json(tokens)
})

router.all('/chat/:text', (req, res, next) => {
    let input = req.param('text')
    let complete = req.param('complete')
    let context = req.param('context', {})

    if (input === DEFAULT_WELCOME_INTENT_NAME) {
        return storyModel.findOne({
                intentName: DEFAULT_WELCOME_INTENT_NAME
            })
            .lean()
            .then((story) => {
                let result = req.body;
                result['input'] = input
                result['complete'] = true
                result['intent'] = {
                    name: story.storyName,
                    storyId: story._id.toString()
                }
                result['speechResponse'] = story.speechResponse
                res.json(result)
            })
    }


    intentClassifier.predict(input)
        .then((intent) => {
            if (!intent) intent = DEFAULT_FALLBACK_INTENT_NAME
            return storyModel.findOne({
                intentName: intent
            }).lean()
        })
        .then((story) => {
            var responseResult;
            if (complete === false) {
                responseResult = buildNonCompleteResponse(story, req)
            } else {
                responseResult = buildCompleteResponse(story, req)
            }
            return Promise.all([story, responseResult])
        })
        .then(([story, result]) => {

            if (result['complete']) {
                if (story.apiTrigger) {
                    // call api
                }
                var template = handlebars.compile(story.speechResponse)
                result['speechResponse'] = template(result.extractedParameters)
            }

            if (!result) {
                res.json('unknow')
            } else {
                res.json(result)
            }
        })
        .catch((err) => {
            console.error('ERROR: ', err)
            res.status(500).json(err)
        })
})


module.exports = router;