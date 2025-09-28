angular.module('exzotron')
  .factory('ReportService', ['$resource', 'API', function ($resource, API) {
    return $resource('', {}, {
      'reportByObjects': {
        method: 'GET',
        url: API.reportByObjects,
        isArray: true,
        params: {
          imeis: '@imeis',
          divisionIds: '@divisionIds',
          dateFrom: '@dateFrom',
          dateTo: '@dateTo',
          showVehicles: '@showVehicles'
        }
      },
      'reportWeightingByObjects': {
        method: 'GET',
        url: API.reportWeightingByObjects,
        isArray: true,
        params: {
          imeis: '@imeis',
          dateFrom: '@dateFrom',
          dateTo: '@dateTo',
          weightTypes: '@weightTypes'
        }
      },
      'reportWeightingByRfid': {
        method: 'GET',
        url: API.reportWeightingByRfid,
        isArray: true,
        params: {
          accounts: '@accounts',
          dateFrom: '@dateFrom',
          dateTo: '@dateTo',
          weightTypes: '@weightTypes'
        }
      },
      'reportByRfid': {
        method: 'GET',
        url: API.reportByRfid,
        isArray: true,
        params: {
          accounts: '@accounts',
          dateFrom: '@dateFrom',
          dateTo: '@dateTo'
        }
      },
      'reportByObjectsIncome': {
        method: 'GET',
        url: API.reportByObjectsIncome,
        isArray: true,
        params: {
          imeis: '@imeis',
          dateFrom: '@dateFrom',
          dateTo: '@dateTo'
        }
      },
      'reportByVehicleIncome': {
        method: 'GET',
        url: API.reportByVehicleIncome,
        isArray: true,
        params: {
          vehicleIds: '@vehicleIds',
          dateFrom: '@dateFrom',
          dateTo: '@dateTo'
        }
      },
      'reportDetailedRfid': {
        method: 'GET',
        url: API.reportDetailedRfid,
        isArray: true,
        params: {
          imeis: '@imeis',
          dateFrom: '@dateFrom',
          dateTo: '@dateTo',
          rfids: '@rfids'
        }
      },
      'reportFuelMovingInternal': {
        method: 'GET',
        url: API.reportFuelMovingInternal,
        isArray: true,
        params: {
          dateFrom: '@dateFrom',
          dateTo: '@dateTo',
        }
      },
      'reportDetailedStorehouse': {
        method: 'GET',
        url: API.reportDetailedStorehouse,
        isArray: false,
        transformResponse: function (data) {
          return {data: data};
        },
        params: {
          byDays: '@byDays',
          control: '@control',
          storehouseIds: '@storehouseIds',
          dateFrom: '@dateFrom',
          dateTo: '@dateTo'
        }
      }
    });
  }]);
