const vntk = require('vntk');
const tagger = vntk.posTag();
const tokenizer = vntk.wordTokenizer();

class NLPController {

    constructor(kites) {
        kites.ready(() => {
            this.storyModel = this.kites.db.story;
        })
    }

    'pos/:text' (req, res) {
        let text = req.param('text');
        let storyId = req.param('storyId');

        if (storyId) {
            // use pre-trained model
            let pretrained_tags = this.nerService.tag(storyId, text);
            return res.ok(pretrained_tags);
        } else {
            let tags = tagger.tag(text).map((tokens) => [tokens[0], tokens[1], 'O']);
            res.ok(tags);
        }
    }

    'tok/:text' (req, res) {
        let text = req.param('text');
        let tokens = tokenizer.tag(text);
        res.ok(tokens);
    }

}

module.exports = NLPController;
