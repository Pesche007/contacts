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
.controller('ContactsListCtrl', function ($scope, $http, cfg, dataService) {
	cfg.GENERAL.CURRENT_APP = 'contacts';
   
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
		tmpObj.phone.push({type:$scope.itemsOPT.phone.items[0], text:''});
		tmpObj.email.push({type:$scope.itemsOPT.email.items[0], text:''});
		tmpObj.address.push({type:$scope.itemsOPT.address.items[0], street:'', zipCode:'', city:'', country:''});
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
	$scope.checkElement=function(item, optObj, saveObj, index){					
		var itemEmpty=1;
		for (var key in item) {
			if (item.hasOwnProperty(key) && key!=='type') {
				if(item[key]!=='') {
					itemEmpty=0;
					break;
					}
				}
			}
		var lastItem=saveObj.length===(index+1) ? 1 : 0;
		if(itemEmpty) {
			if(!lastItem) {
				$scope.removeElement(saveObj, index);				
				}
			}
		else{//not empty
			if(lastItem) {
				var tmpObj={type:optObj.items[0]};
				angular.forEach(optObj.elements, function(value) {
					tmpObj[value]='';
					});
				saveObj.push(tmpObj);
				}
			}
		};
	$scope.removeElement = function(saveObj, index) {
		saveObj.splice(index, 1);
		};
	$scope.additionalElement=function(item){
		$scope.contactsOPT.contactSave[item.saveObjE]='';
		};	
	$scope.itemsOPT={
		job:{text:'Job Title', saveObjE:'jobTitle', items:[], elements:['text'], selected:null, showNr:0, additional:1},		
		phone:{text:'Phone Number', items:['Mobile', 'Home', 'Work', 'Main', 'Home Fax', 'Work Fax', 'Pager', 'Other'], elements:['text'], selected:null, showNr:'', additional:0},
		email:{text:'Email', items:['Work', 'Home', 'Other'], elements:['text'], selected:null, showNr:'', additional:0},
		address:{text:'Address', items:['Work', 'Home', 'Other'], elements:['street', 'zipCode', 'city', 'country'], selected:null, showNr:'', additional:0}
		};
});