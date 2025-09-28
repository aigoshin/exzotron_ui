angular.module('exzotron')
    .factory('WeightOperationsService', ['$resource', 'API', function ($resource, API) {
        return $resource(API.weightOperations, {}, {
            'get': {method: 'GET', isArray: true},
            'getById': {method: 'GET', isArray: false, url: API.weightOperations + "/:id"},
            'add': {method: 'POST', isArray: false},
            'save': {method: 'PUT', isArray: false},
            'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
            'setStatus': {method: 'PATCH', url: API.weightOperations+"/status", params: {id: '@id', active: '@active'}, isArray: false},
        });
    }]);
