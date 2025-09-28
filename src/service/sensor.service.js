angular.module('exzotron')
  .factory('SensorService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.getSensorsByObject, {}, {
      'getSensorsByObject': {method: 'GET', url: API.getSensorsByObject, params: {objectId: '@objectId'}, isArray: true},
      'getSensor': {method: 'GET', url: API.getSensor, params: {id: '@id'}, isArray: false},
      'deleteSensor': {method: 'DELETE', url: API.deleteSensor, params: {sensorId: '@sensorId'}, isArray: false},
      'getSensorTypes': {method: 'GET', url: API.getSensorTypes, isArray: true},
      'saveSensor': {method: 'POST', url: API.saveSensor, isArray: false}
    });
  }]);
