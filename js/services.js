var discoveryServices = angular.module('DiscoveryServices', []);

discoveryServices.factory('TagService', [function(){
    var tags = {bikes: {}, cats: {}};
    return {
        addTag: function(key, obj){
            if (Object.prototype.hasOwnProperty.call(tags[key], obj.id)) {
                delete tags[key][obj.id];
            } else {
                tags[key][obj.id] = obj.name;
            }
        },
        countTags: function(key){
            return Object.keys(tags[key]).length;
        },
        isTagged: function(key, obj){
            return Object.prototype.hasOwnProperty.call(tags[key], obj.id);
        },
        getTags: function(){
            return Object.keys(tags);
        },
        addNewTag: function (name) {
            if (!Object.prototype.hasOwnProperty.call(tags, name)) {
                tags[name] = {};
            }
        }
    };
}]);

discoveryServices.service('DropboxService', ['$q', '$http', function($q, $http){

    this.getMetadata = function(path){
        var deferred = $q.defer();
        $http({method:'POST',
            url:'https://api.dropboxapi.com/2/files/get_metadata',
            data: {'path':path, "include_media_info": true}})
            .then(function (resp) {
                    // doSomethingWithData;
                    console.log(resp)
                    deferred.resolve(resp.data);
                },
                function (error) {
                    // doSomethingWithError;
                    console.log(error)
                    deferred.reject(error);
                });
        return deferred.promise;
    };

    this.getPreview = function(path){
        var deferred = $q.defer();
        $http({method:'POST',
            url:'https://content.dropboxapi.com/2/files/get_thumbnail',
            headers: {'Dropbox-API-Arg':'{"path":"'+path+'", "size": "w640h480"}'},
            responseType: "blob"})
            .then(function (resp) {
                    // doSomethingWithData;
                    console.log(resp)
                    deferred.resolve(URL.createObjectURL(resp.data));
                },
                function (error) {
                    // doSomethingWithError;
                    console.log(error)
                    deferred.reject(error);
                });
        return deferred.promise;
    };

    this.preview = function(path){
        var metadata = '';
        var imgUrl = '';
        $http({method:'POST',
            url:'https://api.dropboxapi.com/2/files/get_metadata',
            data: {'path':path, "include_media_info": true}})
            .success(function(data){
                metadata = data;
                if (data.media_info && data.media_info.metadata['.tag'] == 'photo'){
                    $http({method:'POST',
                        url:'https://content.dropboxapi.com/2/files/get_thumbnail',
                        headers: {'Dropbox-API-Arg':'{"path":"'+path+'", "size": "w640h480"}'},
                        responseType: "blob"})
                        .success(function(data){imgUrl = URL.createObjectURL(data);})
                        .error(function(response){console.log(response);});
                }
            })
            .error(function(response){console.log(response);});
        return [metadata, imgUrl];
    };

    this.browsePath = function(path){
        var deferred = $q.defer();
        $http({method:'POST',
            url:'https://api.dropboxapi.com/2/files/list_folder',
            data:{"path": path, "recursive": false, "include_media_info": false}})
            .then(
                function (resp) {
                    // doSomethingWithData;
                    console.log(resp)
                    deferred.resolve(resp.data);
                },
                function (error) {
                    // doSomethingWithError;
                    console.log(error)
                    deferred.reject(error);
                });
        return deferred.promise;
    };
}]);