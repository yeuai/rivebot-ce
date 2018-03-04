'use strict';
const fs = require('fs');
const path = require('path');

class IobParser {

    constructor() {
    }

    fromFile(fn) {
        let data = fs.readFileSync(fn, 'utf8');
        let sents = data.split('\n\n');
        let iobSents = [];
        for (let i = 0; i < sents.length; i ++) {
            let sent = sents[i].split('\n');
            // \t or space
            let tokens = sent.map((word) => word.split('\t'));
            iobSents.push(tokens);
        }
        return iobSents;
    }

    saveFile(sents, filename) {
        // save to file
    }

}

module.exports = new IobParser();