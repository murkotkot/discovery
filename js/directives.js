angular.module('DiscoveryDirectives', [])
    .directive('gameCanvas', function($injector) {
        var linkFn = function($scope, ele, attrs) {
            createGame($scope, $scope.entities, $scope.mapId, $injector);
        };

        return {
            template: '<div id="gameCanvas"></div>',
            link: linkFn
        }
    });