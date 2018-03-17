var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var inputParameters = new Schema({
    name: String,
    required: Boolean,
    type: String,
    prompt: String
});

var labeledSentences = new Schema({
    data: Array
});

var StorySchema = new Schema({
    storyName: String,
    intentName: {
        type: String,
        unique: true,
        required: true
    },
    apiTrigger: Boolean,
    speechResponse: String,
    parameters: [inputParameters],
    labeledSentences: [labeledSentences]
}, {
    timestamps: true,
    collection: 'story',
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

var StoryModel = mongoose.model("Story", StorySchema);

module.exports = StoryModel;