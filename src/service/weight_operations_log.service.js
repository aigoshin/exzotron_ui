angular.module('exzotron')
    .factory('WeightOperationsLogService', ['$resource', 'API', function ($resource, API) {
        return $resource(API.weightOperationsLog, {}, {
            'get': {method: 'GET', isArray: true},
            'getById': {method: 'GET', isArray: false, url: API.weightOperationsLog + "/:id"},
            'getPhotos': {method: 'GET', isArray: true, url: API.weightOperationsLog + "/photos"},
            'add': {method: 'POST', isArray: false},
            'save': {method: 'PUT', isArray: false},
            'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
            'toggleReport': {method: 'PATCH', url: API.weightOperationsLog + "/report", isArray: false, params: {id: '@id', enabled: '@enabled'}},
            'toggleMode': {method: 'PATCH', url: API.weightOperationsLog + "/mode", isArray: false, params: {id: '@id', mode: '@mode', vehicleId: '@vehicleId'}},
            'recalculate': {method: 'PATCH', url: API.weightOperationsLog + "/recalculate", isArray: false, params: {id: '@id'}}
        });
    }]);
