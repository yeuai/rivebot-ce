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

            $scope.mouseUp = function (event) {
                var selected = util.getTextSelected()
                if (selected.toString().length > 0) {
                    var selectedText = selected.toString()
                    var range = selected.getRangeAt(0).cloneRange()
                    var editableEl = document.getElementById("sentences")
                    range.collapse(true)
                    range.setStart(editableEl, 0)

                    $scope.namedEntity = selectedText;
                    $scope.userInput = angular.element('<p>').append(range.cloneContents()).text();

                    range = selected.getRangeAt(0);
                    var selectionContents = range.extractContents();
                    var span = document.createElement("span");
                    span.appendChild(selectionContents);
                    span.setAttribute("class", "Highlight");
                    span.style.backgroundColor = "green";
                    span.style.color = "white";
                    range.insertNode(span);
                    angular.element('#tokenLabel').focus()
                }
            }

            $scope.labelEntity = function () {
                var entity = $scope.namedEntity;
                var label = $scope.tokenLabel.toUpperCase();

                if (/^\s+/.test($scope.userInput)) {
                    return alert('Vui lòng chọn lại thực thể có tên!')
                }

                var token1 = $http.get('/api/nlu/tok/' + $scope.userInput)
                var token2 = $http.get('/api/nlu/tok/' + entity)
                Promise.all([token1, token2])
                    .then(function ([res1, res2]) {
                        var startedWords = res1.data
                        var selectedWords = res2.data
                        var startLen = startedWords.length

                        if ((startLen < $scope.posTags.length && $scope.posTags[startLen][0] !== selectedWords[0]) && ($scope.posTags[startLen - 1][0] !== selectedWords[0])) {
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
                var text = angular.element('#sentences').text()
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
                            var tokens = res.data
                            $scope.posTags = tokens
                            $scope.posTagAndLabel = JSON.stringify(tokens)
                            $scope.isPosLabeled = true;
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
                        var story = res.data
                        console.log('Result: ', story)
                        $scope.story.labeledSentences.push({
                            data: $scope.posTags
                        })
                    });
            }

            $scope.removeSentence = function (storyId, sentenceId) {
                $http.delete('/api/stories/' + storyId + '/labeled/' + sentenceId)
                    .then(function (res) {
                        var story = res.data
                        console.log('Result: ', story)
                    });
            }
        }
    ]);