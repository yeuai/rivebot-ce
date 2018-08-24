/**
 * Created by vunb on 2018.03.23
 */
angular.module('app.main')
    .controller('logController', [
        '$scope',
        '$log',
        '$timeout',
        '$http',
        'util',
        function ($scope, $log, $timeout, $http, util) {

            // init conversation
            $scope.payload = {
                "currentNode": "",
                "complete": null,
                "context": {},
                "parameters": [],
                "extractedParameters": {},
                "speechResponse": "",
                "intent": {},
                "input": "init_conversation",
                "missingParameters": []
            }

            $scope.message = "";
            $scope.messages = [];

            var msgTempl = {
                timeReceived: new Date(),
                text: "Xin chào, bạn muốn hỏi gì?",
                fromBot: true
            };

            var sendMsg = $scope.sendMessage = function (msg, append) {
                var userMsg = msg || $scope.message || 'init_conversation';
                var botId = 'coco@yeu.ai';

                var myMsgRequest = {
                    timeReceived: new Date(),
                    text: userMsg,
                    fromBot: false
                };

                var payloadMsg = Object.assign($scope.payload, {
                    input: userMsg,
                    from: null,
                    to: botId,
                    fromBot: false
                })

                $http.get('/api/nlu/chat/' + userMsg, {
                    params: payloadMsg
                }).then(function (res) {
                    var data = res.data;
                    var reply = {
                        timeReceived: new Date(),
                        timeReplied: data.timeReplied,
                        text: data.speechResponse,
                        fromBot: true
                    };
                    $scope.payload = data;
                    $scope.payloadPreview = JSON.stringify(data, null, 4)
                    $scope.messages.push(reply);
                    $log.info('Bot reply:', data);
                    util.scrollToBottom()
                });

                $scope.message = "";
                util.scrollToBottom()

                // add to msg box
                if (append !== false) {
                    $scope.messages.push(myMsgRequest);
                }
            }

            sendMsg('init_conversation', false)

        }
    ]);