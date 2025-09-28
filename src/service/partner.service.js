angular.module('exzotron')
  .factory('PartnerService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.partner, {}, {
      'get': {method: 'GET', params: {type: '@type'}, isArray: true},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
      'types': {method: 'GET', url: API.partnerTypes, isArray: true}
    });
  }]);
