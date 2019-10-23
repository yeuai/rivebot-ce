/**
 * Created by vunb on 2018.03.23
 */
angular.module('app.main')
  .controller('chatController', [
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

      var botui = new BotUI('rivebot-chat');

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

        $http.post('/api/nlu/chat/' + userMsg, payloadMsg).then(function (res) {
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
          botui.message.bot(reply.text);
          $log.info('Bot reply:', data);

          botui.action.text({
            delay: 1000,
            action: {
              size: 30,
              icon: 'send-o',
              // value: address, // show the saved address if any
              placeholder: 'Type here'
            }
          }).then((res) => {
            sendMsg(res.value, false);
          })
          // util.scrollToBottom()
        });

        $scope.message = "";
        // util.scrollToBottom()

        // add to msg box
        if (append !== false) {
          $scope.messages.push(myMsgRequest);
          botui.message.human({
            delay: 500,
            content: myMsgRequest.text
          })
        }
      }

      botui.message.bot('Hello!').then(() => {
        sendMsg('init_conversation', false);
      });
    }
  ]);
