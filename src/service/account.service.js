angular.module('exzotron')
  .factory('AccountService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.accountData, {}, {
      'get': {method: 'GET', isArray: false},
      'getCurrentAccountData': {method: 'GET', url: API.getCurrentAccountData, isArray: false},
      'moveCount': {
        method: 'PATCH',
        url: API.moveCount,
        params: {idUserTelegram: '@idUserTelegram', rfid: '@rfid', count: '@count', idProduct: '@idProduct'},
        isArray: false,
        transformResponse: function (data) {
          return {data:data};
        }
      },
      'updateCurrentProduct': {method: 'PUT', url: API.updateCurrentProduct, params: {idProduct: '@idProduct'}, isArray: false},
      'updateCurrentDivision': {method: 'PUT', url: API.updateCurrentDivision, params: {divisionId: '@divisionId'}, isArray: false},
      'updateCurrentPartner': {method: 'PUT', url: API.updateCurrentPartner, params: {partnerId: '@partnerId'}, isArray: false}
    });
  }]);
