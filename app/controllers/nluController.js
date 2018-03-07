'use strict';

const config = require('config')
const router = require('express').Router()
const IntentClassifier = require('../core/intentClassifier')
const SequenceLabeler = require('../core/sequenceLabeler')
const storyModel = require('../models/story');

var intentClassifier = new IntentClassifier()
var sequenceLabeler = new SequenceLabeler()

router.get('/train/:id', (req, res, next) => {
    let storyId = req.params.id
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

router.get('/chat/:text', (req, res, next) => {
    let input = req.params.text
    let complete = req.query.complete
    let parameters = []
    let result = {}
    intentClassifier.predict(input)
        .then((intent) => {
            if (!intent) intent = config.get('DEFAULT_FALLBACK_INTENT_NAME')
            return storyModel.findOne({
                intentName: intent
            }).lean()
        })
        .then((story) => {
            if (story.parameters) {
                parameters = story.parameters
            }

            // check fulfill is complete
            result['missingParameters'] = []
            result['extractedParameters'] = {}
            result['parameters'] = []
            // result['complete'] = false
            
            if (typeof complete === 'undefined' || complete == 'true') {
                let storyId = story._id.toString()
                result['intent'] = {
                    name: story.intentName,
                    storyId: storyId,
                }
                let extractedParameters = []
                if (parameters.length > 0) {
                    extractedParameters = sequenceLabeler.predict(storyId, input);


                    result['extractedParameters'] = extractedParameters
                } else {
                    result['complete'] = true
                }
                return result;
            } else {
                return null
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