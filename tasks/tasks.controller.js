'use strict';

angular.module('contacts')
.controller('TasksCtrl', function ($scope, $modal, cfg) {
	cfg.GENERAL.CURRENT_APP = 'contacts';

	$scope.API={};
	$scope.API.getTaskList=function(){
		return [
			{tid:'t1', label:'Task 1', desc:'This is a text', status:1, due:'', category:{id:'cat1', label:'Sub-Projekt A'}, assigned:{id:'007', lastName:'Windemann', fristName:'Peter'}, updates:[]},
			{tid:'t2', label:'Task 2', desc:'This is an additional text', due:'10.02.2015', status:1, category:{id:'cat2', label:'Projekt B'}, assigned:{id:'007', lastName:'Windemann', fristName:'Peter'}, updates:[]},
			{tid:'t3', label:'Task 3 - Make life easier through Arbalo Apps', desc:'This is another text', due:'24.12.2015', status:2, category:{}, assigned:{}, updates:[]}		
			];
		};
	$scope.API.getStatus=function(){
		return{1:'Open', 2:'In Progress', 3:'Closed'};
		};
	$scope.activeTask={};
	$scope.tasks=$scope.API.getTaskList();
	$scope.status=$scope.API.getStatus();
	$scope.taskOpen = function (task) {	
		$scope.activeTask=task;
		var modalInstance = $modal.open({
			templateUrl: 'myModalContent.html',
			controller: 'ModalInstanceCtrl',
			size:'lg',
			resolve: {
			activeTask: function () {return $scope.activeTask;},
			status: function () {return $scope.status;}
			}
		});
	
	modalInstance.result.then(function (selectedItem) {
		$scope.selected = selectedItem;
		});
	};	
	})
.controller('ModalInstanceCtrl', function($scope, $modalInstance, activeTask, status){
	$scope.activeTask=activeTask;
	$scope.status=status;
	});