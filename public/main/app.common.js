'use strict';

Date.prototype.format = function getCurrentTime() {
    var h = this.getHours(),
        m = this.getMinutes();
    var now = (h > 12) ? (h - 12 + ':' + m + ' PM') : (h + ':' + m + ' AM');
    return now;
}

angular.module('common', [
        'ngSanitize'
    ])
    .directive('contenteditable', ['$sce', function ($sce) {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return; // do nothing if no ng-model

                // Specify how UI should be updated
                ngModel.$render = function () {
                    element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
                    read(); // initialize
                };

                // Listen for change events to enable binding
                element.on('blur keyup change', function () {
                    scope.$evalAsync(read);
                });

                // Write data to the model
                function read() {
                    var html = element.html();
                    // When we clear the content editable the browser leaves a <br> behind
                    // If strip-br attribute is provided then we strip this out
                    if (attrs.stripBr && html == '<br>') {
                        html = '';
                    }
                    ngModel.$setViewValue(html);
                }
            }
        };
    }])
    .directive('keyboardEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.keyboardEnter);
                    });
    
                    event.preventDefault();
                }
            });
        };
    })    
    .factory('util', ['$q', '$timeout', function ($q, $timeout) {

        return {
            scrollToBottom: function () {
                $timeout(() => {
                    $(".chat")[0].scrollTop = $(".chat")[0].scrollHeight;
                }, 300)
            },
            getTextSelected: function () {
                var t = '';
                if (window.getSelection) {
                    t = window.getSelection()
                } else if (document.getSelection) {
                    t = document.getSelection()
                } else if (document.selection) {
                    t = document.selection.createRange().text
                }
                return t
            }
        }
    }]);