'use strict';

const config = require('config')
const router = require('express').Router()
const IntentClassifier = require('../core/intentClassifier')
const SequenceLabeler = require('../core/sequenceLabeler')
const storyModel = require('../models/story');

var intentClassifier = new IntentClassifier()
var sequenceLabeler = new SequenceLabeler()

function buildCompleteResponse(story, input) {
    let result = {}
    let parameters = []
    if (story.parameters) {
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

        // check required parameters
        result['parameters'] = parameters.map((p) => {
            if (p.required && typeof extractedParameters[p.name] == 'undefined') {
                missingParameters.push(p.name)
            }

            return {
                name: p.name,
                type: p.type,
                required: p.required
            }
        })

        result['extractedParameters'] = extractedParameters
        result['missingParameters'] = missingParameters

        if (missingParameters.length > 0) {
            result['complete'] = false
            result['currentNode'] = missingParameters[0].name
            result['speechResponse'] = missingParameters[0].prompt
        } else {
            result['complete'] = false
            result['parameters'] = extractedParameters
        }
    } else {
        result['complete'] = true
    }
    return Promise.resolve(result)
}

function buildNonCompleteResponse(story, req) {
    let result = {}

    if (story.intentName === 'cancel') {
        result['currentNode'] = ''
        result['missingParameters'] = []
        result['parameters'] = {}
        result['intent'] = {}
        result['complete'] = true
        return Promise.resolve(result)
    } else {
        let storyId = req.param('intent').storyId
        let currentNode = req.param('input')
        let extractedParameters = req.param('extractedParameters', {})
        let missingParameters = req.param('missingParameters', [])
        let currentNodeIndex = missingParameters.indexOf(currentNode)

        extractedParameters['currentNode'] = currentNode
        missingParameters.splice(currentNodeIndex, 1)

        if (missingParameters.length > 0) {
            return storyModel.findById(storyId)
                .lean()
                .then((story) => {
                    result['complete'] = false
                    let missingParameter = missingParameters[0]
                    currentNode = story.parameters.filter((p) => p.name === missingParameter)[0]
                    result['currentNode'] = currentNode.name
                    ressult['speechResponse'] = currentNode.prompt
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

router.all('/chat/:text', (req, res, next) => {
    let input = req.param('text')
    let complete = req.param('complete')
    intentClassifier.predict(input)
        .then((intent) => {
            if (!intent) intent = config.get('modelConfig.DEFAULT_FALLBACK_INTENT_NAME')
            return storyModel.findOne({
                intentName: intent
            }).lean()
        })
        .then((story) => {
            if (typeof complete === 'undefined' || complete == 'true') {
                return buildCompleteResponse(story, input)
            } else {
                // complete == 'false'
                return buildNonCompleteResponse(story, req)
            }
        })
        .then((result) => {
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