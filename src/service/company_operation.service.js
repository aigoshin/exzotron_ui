angular.module('exzotron')
    .factory('CompanyAccountOperationService', ['$resource', 'API', function ($resource, API) {
        return $resource(API.companyAccountOperations, {}, {
            'get': {method: 'GET', isArray: true},
            'getByPartner': {method: 'GET', isArray: true, url: API.companyAccountOperations + "/company"},
            'getById': {method: 'GET', isArray: false, url: API.companyAccountOperations + "/:id"},
            'add': {method: 'POST', isArray: false},
            'save': {method: 'PUT', isArray: false},
            'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}}
        });
    }]);
