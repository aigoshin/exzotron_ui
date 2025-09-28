angular.module('exzotron')
  .factory('VehicleService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.vehicle, {}, {
      'get': {method: 'GET', isArray: true},
      'getById': {method: 'GET', isArray: false, url: API.vehicle + '/:vehicleId'},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'combine': {method: 'POST', url: API.vehicle + '/combine', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
      'setTrueFuelControl': {method: 'PATCH', url: API.setTrueFuelControl, params: {id: '@id', trueFuelControl: '@trueFuelControl'}, isArray: false},
      'getVehicleSensors': {method: 'GET', url: API.getVehicleSensors, params: {id: '@id'}, isArray: true},
      'setVehicleSensor': {method: 'PUT', url: API.setVehicleSensor, params: {id: '@id', sid: '@sid', name: '@name', active: '@active'}, isArray: false},
      'setVehicleMultiplier': {method: 'PUT', url: API.setVehicleMultiplier, params: {id: '@id', multiplier: '@multiplier'}, isArray: false}
    });
  }]);
