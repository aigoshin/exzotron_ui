angular.module('exzotron')
  .factory('ProductOperationService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.productOperation, {}, {
      'getIncome': {method: 'GET', url: API.productOperationIncome, isArray: true},
      'getMoving': {method: 'GET', url: API.productOperationMoving, isArray: true},
      'getInventory': {method: 'GET', url: API.productOperationInventory, isArray: true},
      'saveInventory': {method: 'POST', url: API.productOperationInventory, isArray: false},
      'deleteInventory': {method: 'DELETE', url: API.productOperationInventory, isArray: false},
      'setStatus': {method: 'PATCH', url: API.productOperationInventoryStatus, isArray: false, params: {id: '@id', status: '@status'}},
      'getInventoryBalance': {method: 'GET', url: API.productOperationInventoryBalance, isArray: false}
    });
  }]);
