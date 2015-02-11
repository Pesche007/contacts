'use strict';

angular.module('contacts')
.service('dataService', function($http, cfg) {
	delete $http.defaults.headers.common['X-Requested-With'];
	this.getData = function() {
		return $http({
			method: 'GET',
			url: cfg.contacts.SVC_URI,
			params: '',
			headers: {}
		 });		 
	 };
	this.getEntry = function(id) {
		return $http({
			method: 'GET',
			url: cfg.contacts.SVC_URI+'/'+id,
			params: '',
			headers: {}
		 });		 
	 };
	this.updateData = function(id, obj) {
		return $http({
			method: 'PUT',
			url: cfg.contacts.SVC_URI+'/'+id,
			data:obj,
			params: '',
			headers: {}
		 });
	};
	this.createData = function(id, obj) {
		return $http({
			method: 'POST',
			url: cfg.contacts.SVC_URI+'/'+id,
			data:obj,
			params: '',
			headers: {}
		 });
	};	
})
.controller('ContactsCtrl', function ($scope, $http, $filter, $log, cfg, dataService) {
	cfg.GENERAL.CURRENT_APP = 'contacts';
	//API   
	$scope.API={};
		
    $scope.contacts = null;	
	$scope.contactsOPT={groupSel:null, contactDisplay:null, contactSave:null,  contactTmp:null, contactEdit:false, contactNew:0, contactNamesDisplay:null};
	$scope.groupOPT={groupAdd:0, addGroupName:'', groups:[{label:'Business'},{label:'Private'}]};
	$scope.sidemenu={m1:1, m2:1};					
		
    dataService.getData().then(function(dataResponse) {
    	$log.log(dataResponse);
        //$scope.contacts = dataResponse.data;
		//$scope.contactsOPT.contactNamesDisplay=$scope.API.getContactNames();				
		//$scope.contactsShow($scope.contacts[0]);		
    	});

	$scope.addElementToGroup=function(e, i){
		$scope.highlightOut(e);
		var groupTarget=JSON.parse(e.target.dataset.options);
		var groupID=groupTarget.id;
		var groupSource=JSON.parse(i.draggable[0].dataset.options);
		var contactID=groupSource.id;
		console.log(groupID, contactID);

	};
	//Highlight D&D
	$scope.highlightOver = function(e){
		var eTarget=e.target;
		angular.element(eTarget).addClass('highlight');
	};
	$scope.highlightOut = function(e){
		var eTarget=e.target;
		angular.element(eTarget).removeClass('highlight');
	};
});