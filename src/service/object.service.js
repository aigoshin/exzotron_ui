angular.module('exzotron')
  .factory('ObjectService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.getObjectsForCurrentUser, {}, {
      'getObjectsForCurrentUser': {method: 'GET', url: API.getObjectsForCurrentUser, isArray: true},
      'getObjects': {method: 'GET', url: API.getObjects, isArray: true},
      'getObjectsByProduct': {method: 'GET', url: API.getObjectsByProduct, isArray: true},
      'deleteObjectByImei': {method: 'DELETE', url: API.deleteObjectByImei, params: {imei: '@imei'}, isArray: false},
      'updateObjectName': {
        method: 'PUT',
        url: API.updateObjectName,
        params: {
          imei: '@imei',
          name: '@name',
          licenseDate: '@licenseDate',
          phone: '@phone',
          productId: '@productId',
          divisionId: '@divisionId',
          trkTypeId: '@trkTypeId'
        },
        isArray: false
      },
      'addObject': {method: 'POST', url: API.addObject, params: {imei: '@imei', name: '@name', phone: '@phone'}, isArray: false},
      'getProducts': {method: 'GET', url: API.getProducts, isArray: true},
      'getTrkTypes': {method: 'GET', url: API.getTrkTypes, isArray: true},
      'setDataExchange': {method: 'PUT', url: API.setDataExchange, params: {imei: '@imei', status: '@status'}, isArray: false},
      'mapAllObjectsToRfid': {method: 'PUT', url: API.mapAllObjectsToRfid, params: {mapAllObjects: '@mapAllObjects', rfidId:'@rfidId'}, isArray: false},
      'mapObjectToRfid': {method: 'PUT', url: API.mapObjectToRfid, params: {mapped: '@mapped', rfidId:'@rfidId', objectId:'@objectId'}, isArray: false},
      'getObjectData': {method: 'GET', url: API.getObjectData, params: {imeis: '@imei', startDate: '@startDate', endDate: '@endDate'}, isArray: true},
      'getExpiredLicenses': {method: 'GET', url: API.getExpiredLicenses, isArray: true}
    });
  }]);
