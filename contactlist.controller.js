'use strict';

angular.module('contacts')
.service('dataService', function($http) {
	delete $http.defaults.headers.common['X-Requested-With'];
	this.getData = function() {
		return $http({
			method: 'GET',
			url: 'api/contacts',
			params: '',
			headers: {}
		 });
	 }
})
.controller('ContactsListCtrl', function ($scope, $http, AppConfig, dataService) {
	AppConfig.setCurrentApp('Contacts', 'fa-user', 'contacts', 'app/contacts/menu.html');
   
    $scope.contacts = null;
	$scope.contactsOPT={groupSel:null, contactDisplay:null, contactSave:null, contactEdit:false};
	$scope.groupOPT={groups:[], groupcount:{}};
    dataService.getData().then(function(dataResponse) {
        $scope.contacts = dataResponse.data;
		$scope.getGroups();
    	});
	$scope.getGroups=function(){
		$scope.groups=[];
		angular.forEach($scope.contacts, function(value) {
			if(value.groups.length) {				
				angular.forEach(value.groups, function(val) {
					if(!$scope.groupOPT.groupcount[val.text]) {
						$scope.groupOPT.groupcount[val.text]=0;
						}
					if($scope.groupOPT.groups.indexOf(val.text)===-1) {
						$scope.groupOPT.groups.push(val.text);
						}
					$scope.groupOPT.groupcount[val.text]++;
					});
				}
			});
		};	
	$scope.groupCheck=function(obj){
		return obj.map(function(e) { return e.text}).indexOf($scope.contactsOPT.groupSel)!==-1;
		};
	$scope.contactsShow=function(obj){
		$scope.contactsOPT.contactDisplay=obj;		
		$scope.contactsOPT.contactSave=$scope.prepareSaveobj(obj);	
		};
	$scope.prepareSaveobj=function(obj){
		var tmpObj=angular.copy(obj);
		tmpObj.phone.push({type:$scope.phoneOPT.items[0], text:''});
		tmpObj.email.push({type:$scope.emailOPT.items[0], text:''});
		return tmpObj;
		};
	$scope.contactsEdit=function(){		
		$scope.contactsOPT.contactEdit=true;
		};
	$scope.contatcsSave=function(){
		angular.forEach($scope.contactsOPT.contactSave, function(value, key) {
		  this[key]=value;
			}, $scope.contactsOPT.contactDisplay);
		$scope.contactsOPT.contactEdit=false;		
		};
	$scope.contatcsCancel=function(){
		$scope.contactsOPT.contactEdit=false;
		};
	$scope.setDropdown=function(obj, model){		
		model.type=obj;
		};
	$scope.setDropdownCustom=function(){
		
		};
	$scope.addElement=function(txt, type, obj){
		if(txt!=='') {
			obj.push({type:type, text:''})
			}
		};
	$scope.phoneOPT={items:['Mobile', 'Home', 'Work', 'Main', 'Home Fax', 'Work Fax', 'Pager', 'Other'], selected:null, showNr:0};
	$scope.emailOPT={items:['Work', 'Home', 'Other'], selected:null, showNr:0};
})


