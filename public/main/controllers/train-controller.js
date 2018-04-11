/**
 * Created by vunb on 2018.03.23
 */
angular.module('app.main')
    .controller('trainController', [
        '$scope',
        '$log',
        '$timeout',
        '$http',
        'ngDialog',
        'util',
        function ($scope, $log, $timeout, $http, ngDialog, util) {
            $scope.story = $scope.ngDialogData;
            $scope.tokenLabel = "";
            $scope.sentences = "Tôi muốn mua một chiếc iphone";
            $scope.isPosLabeled = false;

            $scope.clear = function () {
                $scope.isPosLabeled = false;
                $scope.sentences = "";
            }
         
            $scope.pos_tag = {
                config: POSTagBratConfig,
                doc: null
            };

            $scope.textSelected = function (text, start, end) {
                console.log('textSelected: ', text, start, end);
                var listEntities = $scope.pos_tag.doc.entities;
                var entity = _.find(listEntities, (e) => {
                    var range = e[2];
                    return range[0][0] <= start && start <= range[0][1]
                });


                $scope.namedEntity = text;
                $scope.tokenLabel = entity[1];
                angular.element('#tokenLabel').focus().select()
            }

            $scope.labelClicked = function (spanId) {
                console.log('labelClicked: ', spanId)

                var listEntities = $scope.pos_tag.doc.entities;
                var entity = _.find(listEntities, (e) => e[0] === spanId);
                var selected = $scope.pos_tag.doc.text.substring(entity[2][0][0], entity[2][0][1]);

                $scope.namedEntity = selected;
                $scope.tokenLabel = entity[1];
                angular.element('#tokenLabel').focus().select()
            }

            $scope.labelEntity = function () {
                var entity = $scope.namedEntity;
                var label = $scope.tokenLabel.toLowerCase();

                if (!entity && (!$scope.userInput || /^\s+/.test($scope.userInput))) {
                    return alert('Vui lòng chọn lại thực thể có tên!')
                }

                var token1 = !$scope.userInput ? Promise.resolve({
                    data: []
                }) : $http.get('/api/nlu/tok/' + $scope.userInput)
                var token2 = $http.get('/api/nlu/tok/' + entity)
                Promise.all([token1, token2])
                    .then(function ([res1, res2]) {
                        var startedWords = res1.data
                        var selectedWords = res2.data
                        var startLen = startedWords.length

                        if ((startLen < $scope.posTags.length && $scope.posTags[startLen][0] !== selectedWords[0]) && (startLen > 0 && $scope.posTags[startLen - 1][0] !== selectedWords[0])) {
                            startLen -= 1
                        }

                        for (var i = 0; i < selectedWords.length; i++) {
                            let bio = 'B-' + label;
                            if (i > 0) {
                                bio = 'I-' + label;
                            }
                            $scope.posTags[startLen + i][2] = bio;
                        }
                        // update display
                        $timeout(function () {
                            $scope.posTagAndLabel = JSON.stringify($scope.posTags)
                        })
                    });
            }

            $scope.posTag = function () {
                var text = $scope.sentences
                if (!text) {
                    return ngDialog.openConfirm({
                        template: '\
                            <h1>Chú ý!</h1>\
                            <p>Bạn đang để trống. Vui lòng nhập vào mẫu câu!</p>\
                            <div class="ngdialog-buttons">\
                                <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">OK</button>\
                            </div>',
                        plain: true
                    })
                } else {
                    $http.get('/api/nlu/pos/' + text)
                        .then(function (res) {
                            var tags = res.data
                            var tokens = tags.map((tag) => tag[0])
                            var text = tokens.join(' ')
                            var posEntities = generateEntitiesFromTags(tags)

                            $scope.posTags = tags
                            $scope.posTagAndLabel = JSON.stringify(tags)
                            $scope.isPosLabeled = true;

                            $scope.pos_tag.doc = {
                                text: text,
                                entities: posEntities
                            }
                        });
                }
            }

            $scope.buildModel = function (storyId) {
                $http.get('/api/nlu/train/' + storyId)
                    .then(function (res) {
                        var modelPath = res.data
                        alert('Build ok: ' + modelPath)
                    });
            }

            $scope.addToTestSet = function (storyId) {
                var labeledSentence = $scope.posTags
                $http.put('/api/stories/' + storyId + '/labeled', labeledSentence)
                    .then(function (res) {
                        var result = res.data
                        console.log('Result: ', result)
                        $scope.story.labeledSentences = result.labeledSentences
                    });
            }

            $scope.removeSentence = function (storyId, sentenceId, index) {
                $http.delete('/api/stories/' + storyId + '/labeled/' + sentenceId)
                    .then(function (res) {
                        $scope.story.labeledSentences.splice(index, 1);
                        console.log('Delete ok: ', res.data)
                    });
            }
        }
    ]);