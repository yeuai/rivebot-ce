/**
 * Created by vunb on 2018.03.23
 */
angular.module('app.main')
    .controller('storyController', [
        '$scope',
        '$log',
        '$timeout',
        '$http',
        'ngDialog',
        'util',
        function ($scope, $log, $timeout, $http, ngDialog, util) {

            //init
            $scope.stories = []
            $scope.story = {}

            var loadStories = $scope.loadStories = function () {
                $http.get('/api/stories')
                    .then(function (res) {
                        $scope.stories = res.data;
                    });
            }

            $scope.removeStory = (storyId, index) => {
                if (!storyId) return false;
                
                $http.delete('/api/stories/' + storyId)
                    .then(function (res) {
                        $scope.story = {}
                        $scope.stories.splice(index, 1)
                        alert('Delete ok!')
                    })
                    .catch(function (err) {
                        return alert('ERROR: ' + err);
                    })
            }

            $scope.createNew = () => {
                $scope.story = {}
            }

            $scope.editStory = function (story) {
                $scope.story = story
            }

            $scope.saveStory = function (story) {
                if (!story._id) {
                    $http.post('/api/stories', story)
                        .then(function (res) {
                            var data = res.data
                            story._id = data._id
                            $scope.stories.push(data);
                        });
                } else {
                    $http.put('/api/stories/' + story._id, story)
                        .then(function (res) {
                            Object.assign(story, res.data);
                        });
                }
            }

            $scope.addParameter = function () {
                $scope.story.parameters = $scope.story.parameters || []
                $scope.story.parameters.push($scope.storyParam)
                $scope.storyParam = {}
                $scope.storyParam.type = 'freeText'
            }

            $scope.buildModel = function (story) {
                $http.post('/api/nlu/train/' + story._id)
                    .then(function (res) {
                        var modelPath = res.data
                        console.log('Build model ok: ', res.data)
                        alert('Build ok: ' + modelPath)
                    })
                    .catch((err) => {
                        console.error('ERROR:', err)
                        alert('ERROR: ' + err)
                    })
            }

            loadStories()

            // train models dialog
            $scope.openTrainDialog = function (story) {
                ngDialog.open({
                    template: '/views/train/main.html',
                    className: 'ngdialog-theme-default',
                    appendClassName: 'ngdialog-vntk-chatbot',
                    controller: 'trainController',
                    data: story,
                    preCloseCallback: function (value) {
                        var nestedConfirmDialog = ngDialog.openConfirm({
                            template: '\
                                <p>Bạn chắc chắn muốn đóng cửa sổ lại không?</p>\
                                <div class="ngdialog-buttons">\
                                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">KHÔNG</button>\
                                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">OK</button>\
                                </div>',
                            plain: true,
                            // scope: $scope
                        });

                        return nestedConfirmDialog;
                    }
                });

            }

            $scope.exportStory = function () {
                $http.post('/api/stories/exports')
                    .then(function (res) {
                        var modelPath = res.data
                        console.log('Download ok: ', res.data)
                    })
                    .catch((err) => {
                        console.error('ERROR:', err)
                        alert('ERROR: ' + err)
                    })
            }

            $scope.importStory = function () {
                ngDialog.open({
                    template: '/views/stories/import.html',
                    className: 'ngdialog-theme-default',
                    appendClassName: 'ngdialog-vntk-chatbot',
                    controller: ['$scope', function ($scope) {
                        // must select file
                        $scope.fileInputChange = function () {
                            $scope.$apply(function () {
                                $scope.fileSelected = true
                            })
                        }

                        $scope.uploadFile = function () {
                            var fd = new FormData();
                            fd.append('datafile', $scope.dataFile);
                            
                            $http.post('/api/stories/imports', fd, {
                                transformRequest: angular.identity,
                                headers: {'Content-Type': undefined}
                            })
                            .then(function (res) {
                                var data = res.data
                                alert('ok!')
                            })
                        }

                    }]
                });
            }
        }
    ]);