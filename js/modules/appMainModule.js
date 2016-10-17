(function (angular) {
  'use strict';
  var appMain = angular.module('appMain', ['ngRoute', 'taskModule', 'utilsModule']);
  
  // config
  appMain.config(["$routeProvider", function ($routeProvider) {
    $routeProvider.when("/", {
      templateUrl: "templates/taskList.html",
        controller: "appController"
      })
      .when("/description/:taskId", {
        templateUrl: "templates/taskDescription.html",
        controller: "taskDescriptionController"
      });
    
  }]);
  
  // appController
  appMain.controller('appController', [
    '$scope', 'taskCollection', 'Utils', function ($scope, taskCollection, utils) {
      $scope.tasksList = taskCollection.getActiveTasks();

      $scope.rowClick = utils.selectRow;
    }
  ]);

  // taskDescriptionController
  appMain.controller('taskDescriptionController', [
    '$scope', '$routeParams', '$http', 'taskCollection', 'Utils', function($scope, $routeParams, $http, taskCollection, utils) {
      $scope.task = taskCollection.getTaskById($routeParams.taskId);
      $scope.taskCopy = angular.copy($scope.task);

      var arTr = document.querySelectorAll('.dvTableCtnr tr:not(:first-child)');
      angular.element(arTr).bind("click", utils.selectRow);

      $scope.isDataChanged = false;
      $scope.isResetChanges = false;
      $scope.errorMessage = "";

      // updateChanges
      $scope.updateChanges = function() {
        var isDataChanged = false;
        angular.forEach($scope.task, function(value, property) {
          if (value !== $scope.taskCopy[property] && !angular.isArray(value) && property !== '$$hashKey') {
            isDataChanged = true;
          }
        });
        $scope.isDataChanged = isDataChanged;
      };
      // saveChanges
      $scope.saveChanges = function() {
        $scope.errorMessage = "";

        var req = {
          method: 'POST',
          url: "http://testserver.com/",
          data: JSON.stringify($scope.taskCopy)
        };

        $http(req)
          .then(function success(response) {
            $scope.task = response.data;
          }, function error(response) {
            if (response.statusText) {
              $scope.errorMessage = "Error: " + response.statusText;
            } else {
              $scope.errorMessage = "Incorrect request data!";
            }
          });
      };
      // resetChanges
      $scope.resetChanges = function() {
        $scope.isResetChanges = true;
        $scope.taskCopy = angular.copy($scope.task);
        $scope.updateChanges();
      };

      // goBack
      $scope.goBack = function() {
        window.history.back();
      };
    }
  ]);

  // "timeValue" filter
  appMain.filter('timeValue', function () {
    function timeValue(input) {
      if (typeof input == 'undefined') {
        return '';
      }
      var intPart = parseInt(input);
      var floatPart = input - intPart;
      var value = intPart + ' hours';
      if (floatPart > 0) {
        value += ' ' + Math.round(floatPart * 60) + ' minutes';
      }
      return value;
    }
    return timeValue;
  });

  // "editProperty" directive
  appMain.directive('editProperty', function ($timeout) {
    return {
      restrict: 'E',
      scope: {
        value: '=value',
        isReset: '=isreset',
        'updateChanges': '&onClick'
      },
      templateUrl: 'templates/editProperty.html',
      link: function (scope, elem, attrs) {
        scope.isEdit = false;
        scope.inputEdit = elem.find("input")[0];
        scope.editEnable = function () {
          scope.isEdit = true;
          scope.isReset = false;
          $timeout(function () {
            scope.inputEdit.focus();
          });          
        }
        scope.blurEdit = function (event) {
          if (!scope.form.inputValue.$error.required) {
            scope.isEdit = false;
            scope.updateChanges();
          }
        };
      }
    };
  });

})(window.angular);
