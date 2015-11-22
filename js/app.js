angular.module('Discovery', ['ngRoute', 'ui.bootstrap'])
    .config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider, myAppConfig) {
        $httpProvider.defaults.headers.common['Authorization'] = '';
        $routeProvider
            .when('/files', {
                templateUrl: 'templates/pages/files/index.html',
                controller: function($http, $scope, myAppConfig){
                    $scope.path = '';
                    $scope.metadata = '';
                    $scope.imgSrc = '';
                    $scope.newTagValue = '';
                    $scope.tags = {bikes: {}, cats: {}};
                    $scope.handleError = function(response){
                        console.log(response);
                    };
                    $scope.addTag = function(key, obj){
                        if (Object.prototype.hasOwnProperty.call($scope.tags[key], obj.id)) {
                            delete $scope.tags[key][obj.id];
                        } else {
                            $scope.tags[key][obj.id] = obj.name;
                        }
                        console.log($scope.tags[key]);
                    };
                    $scope.countTags = function(key){
                        return Object.keys($scope.tags[key]).length;
                    };
                    $scope.isTagged = function(key, obj){
                        return Object.prototype.hasOwnProperty.call($scope.tags[key], obj.id);
                    };
                    $scope.getTags = function(){
                        return Object.keys($scope.tags);
                    };
                    $scope.addNewTag = function(name){
                        console.log(name);
                        if (!Object.prototype.hasOwnProperty.call($scope.tags, name)){
                            $scope.tags[name] = {};
                            $scope.newTagValue = '';
                        }
                    };
                    $scope.preview = function(path){
                        $scope.loading = true;
                        $scope.metadata = '';
                        $scope.imgSrc = '';
                        $http({method:'POST', url:'https://api.dropboxapi.com/2/files/get_metadata',
                                data: {'path':path, "include_media_info": true}
                            })
                            .success(function(data){
                                $scope.metadata = data;
                                console.log($scope.metadata);
                                if (data.media_info && data.media_info.metadata['.tag'] == 'photo'){
                                    $http({method:'POST',
                                            url:'https://content.dropboxapi.com/2/files/get_thumbnail',
                                            headers: {'Dropbox-API-Arg':'{"path":"'+path+'", "size": "w640h480"}'},
                                            responseType: "blob"
                                        })
                                        .success(function(data){$scope.imgSrc = URL.createObjectURL(data);})
                                        .error(function(response){$scope.handleError(response);});
                                }
                            })
                            .error(function(response){$scope.handleError(response);})
                            .finally(function(){$scope.loading = false;});
                    };
                    $scope.browsePath = function(path){
                        $scope.path = path;
                        $scope.metadata = '';
                        $scope.loading = true;
                        $http({method:'POST',
                                url:'https://api.dropboxapi.com/2/files/list_folder',
                                data:{"path": path, "recursive": false, "include_media_info": false}
                            })
                            .success(function(data){$scope.entries = data.entries;})
                            .error(function(response){$scope.handleError(response);})
                            .finally(function(){$scope.loading = false;});
                    };
                    if ($httpProvider.defaults.headers.common['Authorization'] == '') {
                        console.log('Need to obtain auth token');
                        var client_id=myAppConfig.client_id;
                        var redirect_uri=myAppConfig.redirect_uri;
                        var response_type="token";
                        var url="https://www.dropbox.com/1/oauth2/authorize?client_id="+client_id+"&redirect_uri="+
                            redirect_uri+"&response_type="+response_type;
                        window.location.replace(url);
                    } else {
                        $scope.browsePath('');
                    }
                },
                controllerAs: 'filesCtrl'
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
    }])
    .filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    }
    })
    .filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length))
                length = 30;

            if (end === undefined)
                end = "...";

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length-4) + end + String(text).substring(text.length-4, text.length);
            }

        };
    });