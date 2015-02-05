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
	 },
	this.getEntry = function(id) {
		return $http({
			method: 'GET',
			url: 'api/contacts/'+id,
			params: '',
			headers: {}
		 });		 
	 },	 
	this.updateData = function(id, obj) {
		return $http({
			method: 'PUT',
			url: 'api/contacts/'+id,
			data:obj,
			params: '',
			headers: {}
		 });
	},
	this.createData = function(obj) {
		return $http({
			method: 'POST',
			url: 'api/contacts/',
			data:obj,
			params: '',
			headers: {}
		 });
	}	
})
.controller('ContactsListNewCtrl', function ($scope, $http, $filter, cfg, dataService) {
	cfg.GENERAL.CURRENT_APP = 'contacts';

	//API   
	$scope.API={};
	$scope.API.getContactNames=function(){
		var newOBJ=[];
		angular.forEach($scope.contacts, function(value){
			if(value._id && value.firstName && value.lastName) {
				this.push({_id:value._id, lastName:value.lastName, firstName:value.firstName, company:value.company});
				}
			}, newOBJ);
		return newOBJ;
		};
		
    $scope.contacts = null;	
	$scope.contactsOPT={groupSel:null, contactDisplay:null, contactSave:null,  contactTmp:null, contactEdit:false, contactNew:0, contactNamesDisplay:null};
	$scope.groupOPT={groups:[], groupcount:{}};
	$scope.sidemenu={m1:1, m2:1};					
		
    dataService.getData('GET', '').then(function(dataResponse) {
        $scope.contacts = dataResponse.data;
		$scope.contactsOPT.contactNamesDisplay=$scope.API.getContactNames();		
		$scope.getGroups();
		$scope.contactsShow($scope.contacts[0]);		
    	});
	$scope.getGroups=function(){
		$scope.groups=[];
		$scope.groupOPT.groupcount={};
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
	$scope.groupCheck=function(tid){
		var index = $scope.contacts.map(function(e) { return e.tid}).indexOf(tid);
		return $scope.contacts[index].groups.map(function(e) { return e.text}).indexOf($scope.contactsOPT.groupSel)!==-1;
		};
	$scope.groupContactCheck=function(group){
		if($scope.contactsOPT.contactTmp.groups) {
			return $scope.contactsOPT.contactTmp.groups.map(function(e) { return e.text}).indexOf(group)!==-1;
			}	
		return false;
		};		
	$scope.contactsShow=function(obj){	
		dataService.getEntry(obj._id).then(function(dataResponse) {
       	 	$scope.contactsOPT.contactTmp = dataResponse.data;
			$scope.contactsOPT.contactDisplay=$scope.prepareObj(dataResponse.data);
    		});
	 	/*var objIndex=$scope.contacts.map(function(e) { return e.tid}).indexOf(obj.tid);	
		$scope.contactsOPT.contactTmp=$scope.contacts[objIndex];	
		$scope.contactsOPT.contactDisplay=$scope.prepareObj($scope.contacts[objIndex]);*/
		};
	$scope.prepareObj=function(obj){
		var finalObj=[], tmpObj={}, obj={}, opt={}, optObj={}, save={}, val='', i=0;
		 for (var key in $scope.itemsOPT) {	
		 	obj=$scope.itemsOPT[key];
			save=angular.copy($scope.contactsOPT.contactTmp[key]);					
			if(save && save.constructor === Array && save.length) {//save ist ein Array und hat Werte drin
				tmpObj={label:obj.label, key:key, items:[], sortNr:i};					
				for(var j=0;j<save.length;j++){//Loop durch den Array der Werte
					delete save[j]._id;						
					if(!$scope.itemsOPT[key].items.length) {//Die Feldefinitionen sind Objekte, also Multiple Elemente (bspw. Adresse)
						optObj={type:save[j].type}; //hält die neuen Felder und Werte
						for(var k in $scope.itemsOPT[key].items){//Loop durch alle Felder, die das Element haben müsste
							opt=$scope.itemsOPT[key].items[k]; //Die einzelne Feld-Definition							
							val=save[j][k]?save[j][k]:'';
							optObj[k]=val;
							}
						}
					else {//Simple Array, meaning e.g. mails
						optObj=save[j];
						}	
					tmpObj.items.push(optObj);					
					}
				finalObj.push(tmpObj);
				}
			if(save && typeof save === 'string' && save!=='') {//save ist ein String ist nicht leer
				tmpObj={label:obj.label, key:key, items:[save], sortNr:i};	
				if(obj.dHide) {tmpObj.hide=1;}	
				finalObj.push(tmpObj);
				}										
			i++;		
			}//end for
		return finalObj;
		};
	$scope.addUser = function(){
		$scope.contactsOPT.contactNew=1;
		$scope.contactsOPT.contactEdit=true;
		$scope.contactsOPT.contactDisplay=[
			{label: 'Name', key: 'lastName', items: [''], sortNr: 0, 'hide': 1},
			{label: 'Name', key: 'firstName', items: [''], sortNr: 0, 'hide': 1},
 			 ];
		$scope.contactsOPT.contactTmp={};
		};
	$scope.contactsEdit=function(){	
		$scope.contactsOPT.contactNew=0;	
		$scope.contactsOPT.contactEdit=true;
		};
	$scope.contatcsSave=function(){		
		if($scope.contactsOPT.contactNew){
			$scope.contactsOPT.contactTmp={tid:Math.random().toString(36).substr(2, 9)};
			var newUser=1;
			}		
		else {
			var newUser=0;
			}
		for(var i=0;i<$scope.contactsOPT.contactDisplay.length;i++){
			var obj=$scope.contactsOPT.contactDisplay[i];
			if(obj.items && typeof obj.items[0] === 'string') {
				$scope.contactsOPT.contactTmp[obj.key]=obj.items[0];
				}
			else {
				$scope.contactsOPT.contactTmp[obj.key]=obj.items;
				}
			}
		if(newUser) {
			dataService.createData($scope.contactsOPT.contactTmp).then(function(dataResponse) {						
				$scope.contactsOPT.contactEdit=false;
				});
			}
		else {
			dataService.updateData($scope.contactsOPT.contactTmp._id, $scope.contactsOPT.contactTmp).then(function(dataResponse) {						
				$scope.contactsOPT.contactEdit=false;	
				});
			}		
		};
	$scope.contatcsCancel=function(){
		if($scope.contactsOPT.contactTmp){//Existing User
			$scope.contactsShow($scope.contactsOPT.contactTmp);			
			}
		else {
			$scope.contactsShow($scope.contacts[0]);
			}
		$scope.contactsOPT.contactEdit=false;		
		};
	$scope.setDropdown=function(obj, model){		
		model.type=obj;
		};
	$scope.deleteItem=function(type, e, index){
		for(var i=0;i<$scope.contactsOPT.contactDisplay.length;i++){
			if($scope.contactsOPT.contactDisplay[i].key===e){
				if(type===1) {
					$scope.contactsOPT.contactDisplay.splice(i, 1);
					}
				if(type===2){
					$scope.contactsOPT.contactDisplay[i].items.splice(index, 1);
					}
				break;
				}
			}
		};	
	$scope.addItemDropdown=function(obj){
		var key=obj.key;
		var tmpObj={type:$scope.itemsOPT[key].dropdown[0]};
		if(!$scope.itemsOPT[key].items.length) {//Die Feldefinitionen sind Objekte, also Multiple Elemente (bspw. Adresse)
			for(var k in $scope.itemsOPT[key].items){//Loop durch alle Felder, die das Element haben müsste
				tmpObj[k]='';
				}
			}
		else {//Simple Array, meaning e.g. mails
			tmpObj[$scope.itemsOPT[key].items[0].type]=''
			}
		obj.items.push(tmpObj);
		};
	$scope.addItemGeneric = function(key){
		if(!$scope.isDisplayedKey(key)) {
			var obj=$scope.itemsOPT[key];
			var finalObj={label:obj.label, key:key, items:[], sortNr:$scope.contactsOPT.contactDisplay.length};
			if(obj.hasDropdown){
				finalObj.items.push({type:obj.dropdown[0]});
				if(obj.items.length) {//email-type				
					finalObj.items[0][obj.items[0].type]='';
					}
				else {//Address type
					for(var k in obj.items){
						finalObj.items[0][k]='';
						}
					}		
				}
			else {//String
				finalObj.items[0]='';
				}
			$scope.contactsOPT.contactDisplay.push(finalObj);
			}
		};
	$scope.addToGroup = function(group){
		if(!$scope.groupContactCheck(group)){
			if($scope.contactsOPT.contactTmp.groups) {
				$scope.contactsOPT.contactTmp.groups.push({text:group});
				}
			else {
				$scope.contactsOPT.contactTmp.groups=[{text:group}];
				}
			$scope.getGroups();			
			}
		};	
	$scope.itemsOPT={
		lastName:{label:'Name', items:[{label:'Last Name', type:'text'}], hasDropdown:0, dHide:1, required:1},
		firstName:{label:'Name', items:[{label:'First Name', type:'text'}], hasDropdown:0, dHide:1, required:1},	
		company:{label:'Company', items:[{label:'Company', type:'text'}], hasDropdown:0, dHide:0},		
		jobTitle:{label:'Job Title', items:[{label:'Job Title', type:'text'}], hasDropdown:0, dHide:0},
		email:{label:'Email', items:[{label:'Email', type:'text'}], hasDropdown:1, selected:null, showNr:'', dropdown:['Work', 'Home', 'Other'], dHide:0},
		address:{label:'Address', items:{street:{label:'Street', type:'text'}, zipCode:{label:'ZIP', type:'text', nobr:1}, city:{label:'City', type:'text', nobr:1}, country:{label:'Country', type:'text'}}, 
			hasDropdown:1, selected:null, showNr:'', dropdown:['Work', 'Home', 'Other'],  dHide:0},
		web:{label:'Website', items:[{label:'URL', type:'text'}], hasDropdown:1, selected:null, showNr:'', dropdown:['Work', 'Private', 'Other'], dHide:0},
		dates:{label:'Dates', items:[{label:'Date', type:'dateValue'}], hasDropdown:1, selected:null, showNr:'', dropdown:['Birthday', 'Wedding Day', 'Other'], dHide:0},
		relationship:{label:'Relationship', items:[{label:'Person', type:'text'}], hasDropdown:1, selected:null, showNr:'', dropdown:['Friend', 'Marriage Partner', 'Boss', 'Other'], dHide:0}			
		};
	$scope.notSorted  = function(obj){ //http://stackoverflow.com/questions/19676694/ng-repeat-directive-sort-the-data-when-using-key-value
		return obj? Object.keys(obj) : [];
		};
	$scope.isDisplayedKey = function(key){
		for(var i=0;i<$scope.contactsOPT.contactDisplay.length;i++){
			if($scope.contactsOPT.contactDisplay[i].key===key){
				return true;
				break;
				};
			}
		return false;
		};
	//Letter filter
	$scope.filterOPT={letterSelected:'', searchTerm:''};
	$scope.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
	$scope.letterFilter=function(letter){
		$scope.filterOPT.letterSelected=letter;
		var out=[];
		for(var i=0;i<$scope.contactsOPT.contactNames.length;i++){
			if($scope.contactsOPT.contactNames[i].lastName.charAt(0).toUpperCase()===letter){
				out.push($scope.contactsOPT.contactNames[i]);
				}
			}
		$scope.contactsOPT.contactNamesDisplay = out;		
		};
	//Datepicker
	$scope.opened=[];
	$scope.open = function($event, openid) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened[openid] = true;
		};	
	$scope.formatedate = function (obj){
		obj.dateValue = $filter('date')(obj.dateValue, 'dd.MM.yyyy');
		};
	});