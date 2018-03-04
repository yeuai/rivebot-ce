'use strict';

const router = require('express').Router()
const IntentClassifier = require('../core/intentClassifier')
const SequenceLabeler = require('../core/sequenceLabeler')

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
    intentClassifier.predict(input)
        .then((result) => {
            if (!result) {
                res.json('unknow')
            } else {
                res.json(result)
            }
        })
})


module.exports = router;