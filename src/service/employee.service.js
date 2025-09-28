angular.module('exzotron')
  .factory('EmployeeService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.employee, {}, {
      'get': {method: 'GET', isArray: true},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}}
    });
  }]);
