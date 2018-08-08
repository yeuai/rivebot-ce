'use strict';

const config = require('config')
const vntk = require('vntk')
const handlebars = require('handlebars')
const IntentClassifier = require('../core/intentClassifier')
const SequenceLabeler = require('../core/sequenceLabeler')

const intentClassifier = new IntentClassifier()
const sequenceLabeler = new SequenceLabeler()
const tagger = vntk.posTag()
const wordSent = vntk.wordTokenizer()

// load config name
const DEFAULT_WELCOME_INTENT_NAME = config.get('modelConfig.DEFAULT_WELCOME_INTENT_NAME')
const DEFAULT_FALLBACK_INTENT_NAME = config.get('modelConfig.DEFAULT_FALLBACK_INTENT_NAME')

/**
 * NLU Controller
 */
class NLUController {

    constructor(kites) {
        // ensure kites is ready
        kites.ready(() => {
            this.nluService = this.kites.sv.nlu;
        })
    }

    'train/:id' (req, res) {
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
    }


    'pos/:text' (req, res) {
        let text = req.param('text')
        let storyId = req.param('storyId')

        if (storyId) {
            // use pre-trained model
            let pretrained_tags = sequenceLabeler.tag(storyId, text)
            return res.json(pretrained_tags)
        } else {
            let tags = tagger.tag(text).map((tokens) => [tokens[0], tokens[1], 'O'])
            res.json(tags)
        }
    }

    'tok/:text' (req, res) {
        let text = req.param('text')
        let tokens = wordSent.tag(text);
        res.json(tokens)
    }

    'chat/:text' (req, res) {
        let input = req.param('text')
        let complete = req.param('complete')
        let context = req.param('context', {})

        if (input === DEFAULT_WELCOME_INTENT_NAME) {
            return this.kites.db.story.findOne({
                    intentName: DEFAULT_WELCOME_INTENT_NAME
                })
                .lean()
                .then((story) => {

                    if (!story) {
                        return res.notFound('Story: ' + input);
                    }

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
                return this.kites.db.story.findOne({
                    intentName: intent
                }).lean()
            })
            .then((story) => {
                var responseResult;
                // var nluService = this.kites.sv.nlu;
                if (complete === false) {
                    responseResult = this.nluService.buildNonCompleteResponse(story, req)
                } else {
                    responseResult = this.nluService.buildCompleteResponse(story, req)
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
    }

}

module.exports = NLUController;
