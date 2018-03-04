'use strict';

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
            return storyModel.findOne({
                intentName: intent
            }).lean()
        })
        .then((story) => {
            if (story.parameters) {
                parameters = story.parameters
            }

            // check fulfill is complete
            if (typeof complete === 'undefined' || complete == 'true') {
                let storyId = story._id.toString()
                result.intent = {
                    name: story.intentName,
                    storyId: storyId,
                }
                let extractedParameters = []
                if (parameters) {
                    extractedParameters = sequenceLabeler.predict(storyId, input);
                }
                return extractedParameters
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
})


module.exports = router;