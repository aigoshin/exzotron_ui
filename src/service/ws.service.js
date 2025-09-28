angular.module('exzotron')
    .service('WebSocketService', ['$rootScope', function ($rootScope) {
        let stompClient = null;

        this.connect = function (callback) {
            const socket = new SockJS('/ws'); // Убедитесь, что этот путь соответствует вашему серверу
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                if (callback) {
                    callback();
                }
            });
        };

        this.subscribe = function (topic, callback) {
            if (stompClient) {
                stompClient.subscribe(topic, function (message) {
                    $rootScope.$apply(function () {
                        callback(message);
                    });
                }, function (error){
                    console.log(error)
                });
            }
        };

        this.send = function (destination, body) {
            if (stompClient) {
                stompClient.send(destination, {}, body);
            }
        };

        this.disconnect = function () {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }]);