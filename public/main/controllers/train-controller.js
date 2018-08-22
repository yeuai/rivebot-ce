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
                $scope.tokenLabel = entity[1].replace(/^[bi]-/i, '');
                $scope.entityRange = [start, end];
                angular.element('#tokenLabel').focus().select()
            }

            $scope.labelClicked = function (spanId) {
                console.log('labelClicked: ', spanId)

                var listEntities = $scope.pos_tag.doc.entities;
                var entity = _.find(listEntities, (e) => e[0] === spanId);
                var selected = $scope.pos_tag.doc.text.substring(entity[2][0][0], entity[2][0][1]);

                $scope.namedEntity = selected;
                $scope.tokenLabel = entity[1].replace(/^[bi]-/i, '');
                $scope.entityRange = entity[2][0];
                angular.element('#tokenLabel').focus().select()
            }

            $scope.labelEntity = function () {
                var entity = $scope.namedEntity;
                var label = ($scope.tokenLabel || '').toLowerCase();

                if (!entity && typeof entity !== 'string') {
                    return alert('Vui lòng chọn lại thực thể có tên!')
                } else if (!label || /^\s+/.test(label)) {
                    // alert to user knows
                    alert('Xóa tên thực thể!')
                }

                var listEntities = $scope.pos_tag.doc.entities;
                var entityStart = $scope.entityRange[0];
                var entityEnd = $scope.entityRange[1];
                var entitySpan = false;
                var lastEntity = _.find(listEntities, (e) => {
                    let range = e[2][0];
                    if (range[0] <= entityStart && entityStart <= range[1] && entityEnd > range[1]) {
                        e[1] = label ? 'B-' + label : 'O';
                        entitySpan = true;
                        return false;
                    } else if (entitySpan && entityEnd >= range[1]) {
                        e[1] = label ? 'I-' + label : 'O';
                        entitySpan = true;
                        return false;
                    } else if (range[0] <= entityStart && entityEnd <= range[1]) {
                        e[1] = label ? 'B-' + label : 'O';
                        entitySpan = false;
                        return true;
                    } else if (entitySpan && entityEnd <= range[1]) {
                        if (entityEnd > range[0]) {
                            e[1] = label ? 'I-' + label : 'O';
                        }
                        entitySpan = false;
                        return true;
                    }
                    // search next item
                    return false;
                })

                // check after tagging break like [b-label1, i-label2]
                var checkLastEntityFound = false
                _.find(listEntities, (e) => {
                    if (lastEntity[0] === e[0]) {
                        checkLastEntityFound = true
                    } else if (checkLastEntityFound && /^I-/.test(e[1])) {
                        e[1] = 'O';
                    } else if (checkLastEntityFound === true) {
                        // break search
                        return true;
                    }
                })

                // Generate posTags with NER tags
                _.each(listEntities, (e, i) => {
                    $scope.posTags[i][2] = /^[bi]-/i.test(e[1]) ? e[1] : 'O';
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
                    $http.get('/api/nlp/pos/' + text + '?storyId=' + $scope.story._id)
                        .then(function (res) {
                            var tags = res.data
                            $scope.updatePosTags(tags)
                        });
                }
            }

            $scope.updatePosTags = function (tags) {
                var tokens = tags.map((tag) => tag[0])
                var text = tokens.join(' ')
                var posEntities = generateEntitiesFromTags(tags)

                _.each(tags, (tag, i) => {
                    if (tag[2] !== 'O') {
                        posEntities[i][1] = tag[2]
                    }
                })

                $scope.posTags = tags
                $scope.posTagAndLabel = JSON.stringify(tags)
                $scope.isPosLabeled = true;

                $scope.pos_tag.doc = {
                    text: text,
                    entities: posEntities
                }
            }

            $scope.buildModel = function (storyId) {
                $http.post('/api/nlu/train/' + storyId)
                    .then(function (res) {
                        var modelPath = res.data
                        alert('Build ok: ' + modelPath)
                    })
                    .catch((err) => {
                        console.error('ERROR:', err)
                        alert('ERROR: ' + err)
                    })
            }

            $scope.addToTestSet = function (storyId) {
                var labeledSentence = $scope.posTags
                $http.put('/api/story/' + storyId + '/labeled', labeledSentence)
                    .then(function (res) {
                        var result = res.data
                        console.log('Result: ', result)
                        $scope.story.labeledSentences = result.labeledSentences
                    });
            }

            $scope.removeSentence = function (storyId, sentenceId, index) {
                $http.delete('/api/story/' + storyId + '/labeled/' + sentenceId)
                    .then(function (res) {
                        $scope.story.labeledSentences.splice(index, 1);
                        console.log('Delete ok: ', res.data)
                    });
            }

            $scope.editSentence = function (story, label, index) {
                $scope.updatePosTags(label.data)
            }
        }
    ]);
