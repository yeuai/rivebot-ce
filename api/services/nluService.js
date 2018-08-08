/**
 * NLU Service Definition
 */
class NLUService {

    constructor(kites) {
        // make sure kites is ready
        kites.ready(() => {
            this.logger.info('NLU Service is ready!');
        });
    }

    /**
     * Xây dựng câu trả lời với trạng thái hoàn tất
     * Người dùng đã nhập đủ thông tin yêu cầu
     * @param {Object} story
     * @param {Request} req
     */
    buildCompleteResponse(story, req) {
        let input = req.param('input');
        let result = req.body;
        let parameters = [];
        if (!story) {
            throw new Error('Not found story: ' + input);
        }
        if (story.parameters) {
            parameters = story.parameters
        }

        // check fulfill is complete
        result['missingParameters'] = [];
        result['extractedParameters'] = {};
        result['parameters'] = [];
        result['input'] = input;
        // result['complete'] = false

        let storyId = story._id.toString();
        result['intent'] = {
            name: story.intentName,
            storyId: storyId,
        }
        let extractedParameters = [];
        let missingParameters = [];
        if (parameters.length > 0) {
            extractedParameters = sequenceLabeler.predict(storyId, input);
            this.kites.info('sequenceLabeler predict: ', extractedParameters);

            // check required parameters
            result['parameters'] = parameters.map((p) => {
                if (p.required && typeof extractedParameters[p.name] == 'undefined') {
                    missingParameters.push(p);
                }

                return {
                    name: p.name,
                    type: p.type,
                    required: p.required
                }
            })

            result['extractedParameters'] = extractedParameters;
            result['missingParameters'] = missingParameters.map((p) => p.name);

            if (missingParameters.length > 0) {
                result['complete'] = false;
                result['currentNode'] = missingParameters[0].name;
                result['speechResponse'] = missingParameters[0].prompt;
            } else {
                result['complete'] = true;
                result['parameters'] = extractedParameters;
            }
        } else {
            result['complete'] = true;
        }
        return Promise.resolve(result);
    }

    /**
     * Xây dựng câu trả lời với trạng thái chưa hoàn tất
     * Chờ người dùng nhập đủ thông tin yêu cầu
     * @param {Object} story
     * @param {Request} req
     */
    buildNonCompleteResponse(story, req) {
        let result = req.body;

        if (story.intentName === 'cancel') {
            result['currentNode'] = '';
            result['missingParameters'] = [];
            result['parameters'] = {};
            result['intent'] = {};
            result['complete'] = true;
            return Promise.resolve(result);
        } else {
            let storyId = req.param('intent').storyId;
            let currentNode = req.param('currentNode');
            let extractedParameters = req.param('extractedParameters', {});
            let missingParameters = req.param('missingParameters', []);
            let currentNodeIndex = missingParameters.indexOf(currentNode);

            extractedParameters[currentNode] = req.param('input');
            missingParameters.splice(currentNodeIndex, 1);

            if (missingParameters.length > 0) {
                return this.kites.db.story.findById(storyId)
                    .lean()
                    .then((story) => {
                        result['complete'] = false;
                        let missingParameter = missingParameters[0];
                        currentNode = story.parameters.filter((p) => p.name === missingParameter)[0];
                        result['currentNode'] = currentNode.name;
                        result['speechResponse'] = currentNode.prompt;
                        return result;
                    })
            } else {
                result['complete'] = true;
                result['parameters'] = extractedParameters;
                return Promise.resolve(result);
            }
        }
    }

}

/**
 * Exports NLU Service
 */
module.exports = NLUService;
