'use strict';

const config = require('config')
const handlebars = require('handlebars')

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
            this.nerService = this.kites.sv.ner;
            this.nluService = this.kites.sv.nlu;
            this.intentService = this.kites.sv.intent;
        })
    }

    /**
     * Huấn luyện dữ liệu theo kịch bản được thiết kế bởi Rivebot
     * @param {*} req
     * @param {*} res
     */
    'train/:id'(req, res) {
        let storyId = req.param('id')
        this.intentService.train()
            .then(result => {
                return this.nerService.trainStory(storyId);
            })
            .then((result) => {
                res.json(result)
            })
            .catch(err => {
                res.status(500).end(err)
            })
    }

    /**
     * Hàm lý luận dựa vào dữ kiện kịch bản và ý định của khách hàng
     * Trả về một đoạn văn bản mà khách hàng mong muốn nhận được câu trả lời
     * @param {*} req
     * @param {*} res
     */
    'chat/:text'(req, res) {
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


        this.intentService.predict(input)
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
