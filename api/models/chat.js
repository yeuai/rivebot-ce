var mongoose = require("mongoose");

var Schema = mongoose.Schema;

/**
 * Phôi thiết kế dữ liệu lịch sử chat
 */
var ChatSchema = new Schema({
    from: String,   // bot name, user name or user id
    botId: String,
    text: String,
    intent: String,
    tags: Array,
    dateTime: Date
}, {
    timestamps: true,
    collection: 'chat'
});

var ChatModel = mongoose.model("Chat", ChatSchema);

/**
 * Chat logs definition
 * --> Nhật ký trò chuyện
 */
module.exports = {
    define: function () {
        return ChatModel;
    }
};
