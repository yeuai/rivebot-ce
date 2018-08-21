const vntk = require('vntk');
const posTagger = vntk.posTag();
const nerTagger = vntk.ner();
const tokenizer = vntk.wordTokenizer();

class NLPController {

    constructor(kites) {
        kites.ready(() => {
            this.storyModel = this.kites.db.story;
            this.nerService = this.kites.sv.ner;
        })
    }

    /**
     * Hàm làm nhiệm vụ phân tách đơn vị từ
     * @param {Request} req
     * @param {Response} res
     */
    'tok/:text' (req, res) {
        let text = req.param('text');
        let tokens = tokenizer.tag(text);
        res.ok(tokens);
    }

    /**
     * Hàm làm nhiệm vụ phân tích ngữ pháp của từ trong câu
     * Bóc tách thực thể nếu tồn có truyền về thông tin id kịch bản
     * @param {Request} req
     * @param {Response} res
     */
    'pos/:text' (req, res) {
        let text = req.param('text');
        let storyId = req.param('storyId');

        if (storyId) {
            // use pre-trained model
            let pretrained_tags = this.nerService.tag(storyId, text);
            return res.ok(pretrained_tags);
        } else {
            let tags = posTagger.tag(text).map((tokens) => [tokens[0], tokens[1], 'O']);
            res.ok(tags);
        }
    }

    /**
     * Hàm bóc tách thực thể sử dụng mặc định thư viện vntk
     * @param {Request} req
     * @param {Response} res
     */
    'ner/:text' (req, res) {
        let text = req.param('text');
        let tokens = nerTagger.tag(text);
        res.ok(tokens);
    }

}

module.exports = NLPController;
