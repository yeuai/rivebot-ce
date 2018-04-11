'use strict';
angular.module('common').directive('textAnnotation', ['$compile', function ($compile) {
    return {
        restrict: 'E',
        scope: {
            config: '=',
            doc: '=',
            multilabel: '@',
            textSelected: '&',
            labelClicked: '&',
        },
        controller: function ($scope, $element) {
            var id = Math.random().toString(36).substring(7);
            var textSelectedCallback = $scope.textSelected || (() => 1);
            var labelClickedCallback = $scope.labelClicked || (() => 1);

            $scope.$watch('doc', function (newValue) {
                // Return if doc is not configured.
                if (!newValue) return;
                var eventRegistered = false;
                var editable = $scope.editable;
                var multilabel = $scope.multilabel;
                var config = $scope.config;
                var doc = $scope.doc;
                $($element).find('#' + id).remove();
                $($element).append('<div id="' + id + '"></div>');
                $($element).find('#' + id).bind('DOMSubtreeModified', function (e) {
                    // register label clicked event.
                    $($element).find('#' + id).find('g.span').off('click').click(function (e) {
                        eventRegistered = true;
                        var rectId = $(this).find('rect').data('span-id');
                        $scope.$apply(function () {
                            labelClickedCallback({
                                id: rectId
                            });
                        })
                    });

                    // register text selected event.
                    $($element).find('#' + id).find('g.text').off('mouseup').on('mouseup', function () {
                        if (window.getSelection) {
                            var sel = window.getSelection();
                            var div = $(this);

                            if (sel.rangeCount) {
                                var range = sel.getRangeAt(0);
                                var textSelected = sel.toString();
                                var precedingRange = document.createRange();
                                precedingRange.setStartBefore(div[0].firstChild);
                                precedingRange.setEnd(range.startContainer, range.startOffset);
                                var textPrecedingSelection = precedingRange.toString();
                                var a = textPrecedingSelection.replace(/\n/g, ' ');
                                var r = a.replace(/^\s+/g, '');
                                var e = r.replace(/\s+$/g, ' ');
                                var startIndex = e.length;
                                var endIndex = e.length + textSelected.length;

                                var listExistEntity = _.filter($scope.doc.entities, function (item) {
                                    var indexItem = item[2];
                                    var indexItemChild = indexItem[0];
                                    return indexItemChild[0] == startIndex && indexItemChild[1] == endIndex;
                                });

                                if (textSelected.trim().length > 0) {
                                    if (multilabel == 'true' || (multilabel == 'false' && listExistEntity.length <= 0)) {
                                        $scope.$apply(function () {
                                            textSelectedCallback({
                                                text: textSelected,
                                                start: startIndex,
                                                end: endIndex
                                            });
                                        })
                                    }
                                }
                            }
                        }
                    });
                });

                //TODO: Rename Util to BratUtil
                Util.embed(id, config, doc, []);
            }, true);
        }
    }
}]);