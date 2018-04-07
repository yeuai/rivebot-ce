'use strict';
const _ = require('lodash');
const async = require('async');
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
        let writeFile = new Promise((resolve, reject) => {
            let stream = fs.createWriteStream(filename);
            console.log('Saving Iob file: ' + filename);
            
            // write only a sentence at one time.
            async.eachLimit(sents, 1, (sent, cb1) => {
                async.each(sent, (token, cb2) => {
                    let data = `${token.join('\t')}\n`;
                    stream.write(data, 'utf8', cb2);
                }, (err) => {
                    // end a sentence.
                    stream.write('\n', 'utf8', cb1);
                });
            }, (err) => {
                stream.end();
            });
        
            stream.on('finish', () => resolve(filename));
            stream.on('error', reject);
        });
        
        return writeFile.then((result) => {
            console.log('Saved IOB done:' + result);
            return result;
        });
    }

    /**
     * generate entities from IOB tags
     *
     * @param tags
     *      each element is an array [token, tag]
     *      each tag is in IOB format: B-NP, I-NP, B-VP, I-VP, O...
     * @returns {Array|*}
     */
    matchEntities(zippedWords) {
        let _tags = _.chain(zippedWords)
            .map((tag) => [tag])
            .reduce(this.mergeIOBTags)
            .map(this.removeIOBPrefix)
            .value()
        // parse entities
        return this.generateEntitiesFromTags(_tags).filter((entity) => entity[1] != 'O')
    }

    generateEntitiesFromTags(tags) {
        let start = 0;
        return _.map(tags, function (tag, i) {
            var entity = [];
            entity[0] = "T" + (i + 1);
            entity[1] = tag[1];
            entity[2] = [
                [start, start + tag[0].length]
            ];
            entity[3] = tag[0];
            start += tag[0].length + 1;
            return entity;
        });
    }

    mergeIOBTags(x, y) {
        var li = x.length - 1; // last index
        var ly = _.last(y); // last element of y
        if (ly[1][0] == "I") {
            x[li][0] = x[li][0] + " " + ly[0];
        } else {
            x.push(ly);
        }
        return x;
    }

    removeIOBPrefix(tag) {
        if (tag[1] != "O") {
            tag[1] = tag[1].slice(2);
        }
        return tag;
    }

}

module.exports = new IobParser();