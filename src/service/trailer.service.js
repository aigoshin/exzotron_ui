angular.module('exzotron')
    .factory('TrailerService', ['$resource', 'API', function ($resource, API) {
        return $resource(API.trailer, {}, {
            'get': {method: 'GET', isArray: true},
            'getById': {method: 'GET', isArray: false, url: API.trailer + "/:id"},
            'add': {method: 'POST', isArray: false},
            'save': {method: 'PUT', isArray: false},
            'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
        });
    }]);
