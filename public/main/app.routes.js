angular
    .module('app.main')
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider','$qProvider', function ($stateProvider, $urlRouterProvider, $locationProvider,$qProvider) {

        // Homepage
        $stateProvider
            .state('home', {
                url: '',
                abstract: true,
                template: '<ui-view/>'
            })
            .state('home.chat', {
                url: '/',
                controller: 'chatController',
                templateUrl: '/views/chat/main.html'
            })
            .state('stories', {
                url: '/stories/:id?',
                controller: 'storyController',
                templateUrl: '/views/stories/main.html'
            })
            .state('chatlog', {
                url: '/chatlog',
                controller: 'logController',
                templateUrl: '/views/chatlog/main.html'
            })


        // Public & common routes
        $stateProvider
            .state('error', {
                url: '/error',
                abstract: true,
                template: "<ui-view/>"
            })
            .state('error.404', {
                url: '404',
                template: '<h1>Not Found</h1>'
            });


        // FIX for trailing slashes. 
        // Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
        $urlRouterProvider.rule(function ($injector, $location) {
            if ($location.protocol() === 'file')
                return;

            var path = $location.path()
                // Note: misnomer. This returns a query object, not a search string
                ,
                search = $location.search(),
                params;

            // check to see if the path already ends in '/'
            if (path[path.length - 1] === '/') {
                return;
            }

            // If there was no search string / query params, return with a `/`
            if (Object.keys(search).length === 0) {
                return path + '/';
            }

            // Otherwise build the search string and return a `/?` prefix
            params = [];
            angular.forEach(search, function (v, k) {
                params.push(k + '=' + v);
            });
            return path + '/?' + params.join('&');
        });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        });

        $qProvider.errorOnUnhandledRejections(false);

    }])