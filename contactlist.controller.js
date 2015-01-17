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
	 };
})
.controller('ContactsListCtrl', function ($scope, $http, $log, cfg, dataService) {
	cfg.GENERAL.CURRENT_APP = 'contacts';
	// $translatePartialLoader.addPart('contacts');
 	$log.log('ContactsListCtrl/cfg = ' + JSON.stringify(cfg));
  
    $scope.contacts = null;
	$scope.contactsOPT={groupSel:null, contactSel:null, contactDisplay:null, contactEdit:false};
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
		return obj.map(function(e) { 
			return e.text;
		}).indexOf($scope.contactsOPT.groupSel)!==-1;
	};
});


