angular.module('DiscoveryControllers', ['DiscoveryServices'])
    .controller('FilesListCtrl', ['$http','$scope','$location','TagService','DropboxService',
        function($http, $scope, $location, TagService, DropboxService){
        $scope.path = '';
        $scope.metadata = '';
        $scope.imgSrc = '';
        $scope.newTagValue = '';
        $scope.handleError = function(response){
            console.log(response);
        };
        $scope.getTags = function(){return TagService.getTags();};
        $scope.countTags = function(key){return TagService.countTags(key);};
        $scope.isTagged = function(key, obj){return TagService.isTagged(key, obj);};
        $scope.addTag = function(key, obj){return TagService.addTag(key, obj);};
        $scope.addNewTag = function(key){
            TagService.addNewTag(key);
            $scope.newTagValue = '';
        };
        $scope.preview = function(path){
            $scope.loading = true;
            $scope.metadata = '';
            $scope.imgSrc = '';
            DropboxService.getMetadata(path)
                .then(function(data){
                    $scope.metadata = data;
                    if (data.media_info && data.media_info.metadata['.tag'] == 'photo'){
                        DropboxService.getPreview(path).then(function(data){$scope.imgSrc = data});
                    }
                })
                .finally(function(){$scope.loading = false;});
        };
        $scope.browsePath = function(path){
            $scope.path = path;
            $scope.metadata = '';
            $scope.loading = true;
            DropboxService.browsePath(path)
                .then(function(data){$scope.entries = data.entries}, function(error){$location.path("/");})
                .finally(function(){$scope.loading = false;});
        };
        $scope.browsePath('');
    }]);