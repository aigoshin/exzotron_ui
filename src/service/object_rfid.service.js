angular.module('exzotron')
  .factory('ObjectRfidService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.getObjectsRfidForCurrentUser, {}, {
      'getObjectsRfidForCurrentUser': {method: 'GET', url: API.getObjectsRfidForCurrentUser, isArray: true},
      'addRfid': {
        method: 'POST', url: API.addRfid, isArray: false,
        transformResponse: function (data) {
          return {data: data};
        }
      },
      'lockRfid': {
        method: 'PATCH',
        url: API.lockRfid,
        params: {idUserTelegram: '@idUserTelegram', rfid: '@rfid'},
        isArray: false
      },
      'unlockRfid': {
        method: 'PATCH',
        url: API.unlockRfid,
        params: {idUserTelegram: '@idUserTelegram', rfid: '@rfid'},
        isArray: false
      },
      'updateRfidName': {
        method: 'PUT',
        url: API.updateRfidName,
        params: {
          idUserTelegram: '@idUserTelegram',
          rfid: '@rfid',
          name: '@name',
          limit: '@limit',
          status: '@status',
          rfidType: '@rfidType',
          storehouseId: '@storehouseId',
          pinCode: '@pinCode',
          employeeId: '@employeeId',
          vehicleId: '@vehicleId',
          divisionId: '@divisionId',
          limitTypeId: '@limitTypeId',
          partnerId: '@partnerId'
        },
        isArray: false,
        transformResponse: function (data) {
          return {data: data};
        }
      },
      'deleteRfid': {method: 'DELETE', url: API.deleteRfid, params: {rfid: '@rfid'}, isArray: false},
      'getObjectRfidType': {method: 'GET', url: API.getObjectRfidType, isArray: true},
      'getRfidObjects': {method: 'GET', url: API.getRfidObjects, isArray: true},
      'getLimitTypes': {method: 'GET', url: API.getLimitTypes, isArray: true},
      'recalculateRfid': {method: 'GET', url: API.recalculateRfid, isArray: false}
    });
  }]);
