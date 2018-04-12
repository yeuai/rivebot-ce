/**
 * POS Tag config.
 */

window.POSTagBratConfig = {
    entity_types: [],
    relation_types: []
};

var tags = [{
        "subtags": ['N', 'Np', 'Nc', 'Nb', 'Nu', 'Ny'],
        "color": "#b4bbff"
    },
    {
        "subtags": ['P'],
        "color": "#6ec1e2"
    },
    {
        "subtags": ['V'],
        "color": "#adf6a2"
    },
    {
        "subtags": ['A', 'Ab'],
        "color": "#f98fff"
    },
    {
        "subtags": ['M'],
        "color": "#fc6"
    },
    {
        "subtags": ['C', 'Cc', 'R', 'L', 'E', 'T', 'X'],
        "color": "#cc9"
    },
    {
        "subtags": ['CH'],
        "color": "#aaa"
    }
];

_.each(tags, function (tagCategory) {
    var color = tagCategory["color"];
    _.each(tagCategory["subtags"], function (tag) {
        var entity = {
            type: tag,
            labels: [tag],
            bgColor: color,
            borderColor: 'darken'
        };
        window.POSTagBratConfig["entity_types"].push(entity);
    });
});

/**
 * POS Tag Utilities
 */
function generateEntitiesFromTags(tags) {
    window.start = 0;
    return _.map(tags, function (tag, i) {
        var entity = [];
        entity[0] = "T" + (i + 1);
        entity[1] = tag[1];
        entity[2] = [
            [window.start, window.start + tag[0].length]
        ];
        window.start += tag[0].length + 1;
        return entity;
    });
}

function mergeIOBTags(x, y) {
    var li = x.length - 1; // last index
    var ly = _.last(y); // last element of y
    if (ly[1][0] == "I") {
        x[li][0] = x[li][0] + " " + ly[0];
    } else {
        x.push(ly);
    }
    return x;
}

function removeIOBPrefix(tag) {
    if (tag[1] != "O") {
        tag[1] = tag[1].slice(2);
    }
    return tag;
}

/**
 * generate entities from IOB tags
 *
 * @param tags
 *      each element is an array [token, tag]
 *      each tag is in IOB format: B-NP, I-NP, B-VP, I-VP, O...
 * @returns {Array|*}
 */
function generateEntitiesFromIOBTags(tags) {
    var tags = _.chain(tags)
        .map(function (tag) {
            return [tag]
        })
        .reduce(mergeIOBTags)
        .map(removeIOBPrefix)
        .value();
    var entities = generateEntitiesFromTags(tags);
    entities = _.filter(entities, function (entity) {
        return entity[1] != "O";
    });
    return entities;
}