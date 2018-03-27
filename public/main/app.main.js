angular
    .module('app.main', [
        'ui.router',
        'ngDialog',
        'common',
    ])
    .run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;


    }]);