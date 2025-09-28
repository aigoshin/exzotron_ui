angular.module('exzotron')
  .factory('StorehouseService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.storehouse, {}, {
      'get': {method: 'GET', isArray: true},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
      'setSensorExist': {url: API.setSensorExist, method: 'PATCH', isArray: false, params: {id: '@id', sensorExists:'@sensorExists'}},
      'setTrueControl': {url: API.setTrueControl, method: 'PATCH', isArray: false, params: {id: '@id', trueControl:'@trueControl'}}
    });
  }]);
