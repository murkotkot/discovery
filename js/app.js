angular.module('Discovery', ['ngRoute', 'ui.bootstrap', 'DiscoveryControllers', 'DiscoveryFilters', 'DiscoveryServices', 'DiscoveryDirectives'])
    .config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider, myAppConfig) {
        $httpProvider.defaults.headers.common['Authorization'] = '';
        $routeProvider
            .when('/files', {
                templateUrl: 'templates/pages/files/index.html',
                controller: 'FilesListCtrl',
                controllerAs: 'filesCtrl'
            })
            .when('/', {
                template: '',
                controller: function(myAppConfig){
                    if ($httpProvider.defaults.headers.common['Authorization'] == '') {
                        console.log('Need to obtain auth token');
                        var client_id=myAppConfig.client_id;
                        var redirect_uri=myAppConfig.redirect_uri;
                        var response_type="token";
                        var url="https://www.dropbox.com/1/oauth2/authorize?client_id="+client_id+"&redirect_uri="+
                            redirect_uri+"&response_type="+response_type;
                        window.location.replace(url);
                    } else {
                        $location.path("/files");
                    }
                }
            })
            .otherwise({
                template: '',
                controller: function ($location,$rootScope) {
                    var hash = $location.path().substr(1);
                    var splitted = hash.split('&');
                    var params = {};
                    for (var i = 0; i < splitted.length; i++) {
                        var param  = splitted[i].split('=');
                        var key    = param[0];
                        var value  = param[1];
                        params[key] = value;
                        $rootScope.accesstoken=params;
                    }
                    $httpProvider.defaults.headers.common['Authorization'] = 'Bearer '+$rootScope.accesstoken.access_token;
                    $location.path("/files");
                }
            });
    }]);