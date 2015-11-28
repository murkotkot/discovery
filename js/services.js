var discoveryServices = angular.module('DiscoveryServices', []);

discoveryServices.factory('TagService', [function(){
    var tags = {bikes: {}, cats: {}};
    return {
        addTag: function(key, obj){
            if (Object.prototype.hasOwnProperty.call(tags[key], obj.id)) {
                delete tags[key][obj.id];
            } else {
                tags[key][obj.id] = obj.path_lower;
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
        },
        browseTag: function(key){
            return tags[key];
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
                    console.log(resp)
                    deferred.resolve(resp.data);
                },
                function (error) {
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
                    console.log(resp)
                    deferred.resolve(URL.createObjectURL(resp.data));
                },
                function (error) {
                    console.log(error)
                    deferred.reject(error);
                });
        return deferred.promise;
    };

    this.browsePath = function(path){
        var deferred = $q.defer();
        $http({method:'POST',
            url:'https://api.dropboxapi.com/2/files/list_folder',
            data:{"path": path, "recursive": false, "include_media_info": false}})
            .then(
                function (resp) {
                    console.log(resp)
                    deferred.resolve(resp.data);
                },
                function (error) {
                    console.log(error)
                    deferred.reject(error);
                });
        return deferred.promise;
    };

    this.browseList = function(list){
        entries = [];
        for (var key in list) {
            entry = {};
            entry['path_lower'] = list[key];
            entry['name'] = list[key].replace(/^.*[\\\/]/, '');
            entry['.tag'] = "file";
            entries.push(entry);
        };
        return entries;
    };
}]);