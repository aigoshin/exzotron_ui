angular.module('exzotron')
  .factory('TankService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.tank, {}, {
      'get': {method: 'GET', isArray: true},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
      'log': {
        method: 'GET',
        url: API.tankLog,
        params: {
          byNodes: '@byNodes',
          grouped: '@grouped',
          startDate: '@startDate',
          endDate: '@endDate',
          selectedTanks: '@selectedTanks'
        },
        isArray: false
      },
      'setVisible': {method: 'PATCH', url: API.setVisible, params: {id: '@id', visible: '@visible'}, isArray: false},
      'moveFuel': {method: 'POST', url: API.moveFuel, isArray: false},
      'tankLevels' : {method: 'GET', url: API.tankLevels, isArray: true},
    });
  }]);
