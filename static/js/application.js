angular.module("myApp", []);

// socket factory to have a singleton on both controllers
angular.module("myApp").factory('socket', function ($location, $log) {
  // communicate with Redis based pubsub server
  var host = $location.host() + ":" + $location.port();
  var inbox = new ReconnectingWebSocket("ws://" + host + "/receive");
  var outbox = new ReconnectingWebSocket("ws://" + host + "/submit");

  inbox.onclose = function () {
    $log.info('inbox closed');
    this.inbox = new WebSocket(inbox.url);
  };

  outbox.onclose = function () {
    $log.info('outbox closed');
    this.outbox = new WebSocket(outbox.url);
  };

  return {
    send: function (data) {
      outbox.send(JSON.stringify(data));
    },
    onMessage: function (callback) {
      inbox.onmessage = callback;
    }
  };
});

// Controller to display messages
angular.module("myApp").controller('ChatMessagesCtrl', function ($scope, $timeout, socket) {
  $scope.messages = [];
  socket.onMessage(function (evt) {
    $timeout(function () {
      $scope.messages.push(JSON.parse(evt.data));
    });
  });
});

// Controller to send messages
angular.module("myApp").controller('InputFormCtrl', function ($scope, $timeout, socket) {
  this.submit = function () {
    socket.send({
      handle: $scope.handle,
      text: $scope.text
    });
    $timeout(function () {
      $scope.text = '';
    });
  };
});
