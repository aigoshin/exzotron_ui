angular.module('exzotron')
  .factory('FuelMovingService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.fuelMoving, {}, {
      'get': {method: 'GET', isArray: true},
      'getById': {method: 'GET', isArray: false, url: API.fuelMoving + '/:id'},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
      'changeStatus': {method: 'PATCH', isArray: false, params: {id: '@id', status: '@status'}},
    });
  }]);
