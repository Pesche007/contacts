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
.controller('ContactsCtrl', function ($scope, $http, $filter, $log, $modal, cfg, dataService, statePersistence) {
	cfg.GENERAL.CURRENT_APP = 'contacts';
	//API   
	$scope.API={};
		
    $scope.contacts = null;	
	$scope.contactsOPT={contactDisplay:null, contactSave:null,  contactTmp:null, contactEdit:false, contactNew:0, contactNamesDisplay:null};
	$scope.groupOPT={groupEdit:0, groupAdd:0, addGroupName:'', groupSel:null, groups:[{id:'abc', label:'Business'},{id:'def', label:'Private'}]};

    dataService.getData().then(function(dataResponse) {
    	$log.log(dataResponse);
        //$scope.contacts = dataResponse.data;
		//$scope.contactsOPT.contactNamesDisplay=$scope.API.getContactNames();				
		//$scope.contactsShow($scope.contacts[0]);		
    	});

    //********************* GROUPS ***************** //

    $scope.addGroup=function(){
    	if($scope.groupOPT.groups.map(function(e){return e.label;}).indexOf($scope.groupOPT.addGroupName)===-1) {
    		$scope.groupOPT.groups.push({label:$scope.groupOPT.addGroupName});
    		}
    	$scope.groupOPT.groupAdd=0;
    	$scope.groupOPT.addGroupName='';
    };
    $scope.removeGroup=function(id){
    	if($scope.groupOPT.groups.map(function(e){return e.id;}).indexOf(id)!==-1) {
    		$scope.groupOPT.groups.splice($scope.groupOPT.groups.map(function(e){return e.id;}).indexOf(id), 1);
    		}
    };
	$scope.addElementToGroup=function(e, i){
		$scope.highlightOut(e);
		var groupTarget=JSON.parse(e.target.dataset.options);
		var groupID=groupTarget.id;
		var groupSource=JSON.parse(i.draggable[0].dataset.options);
		var contactID=groupSource.id;
		console.log(groupID, contactID);
	};
	$scope.selGroup = function(id){
		if(!$scope.groupOPT.groupEdit){
			$scope.groupOPT.groupSel=id;
		}
	};	
	//Highlight D&D
	$scope.highlightOver = function(e){
		angular.element(e.target).addClass('highlight');
	};
	$scope.highlightOut = function(e){
		angular.element(e.target).removeClass('highlight');
	};


	//********************* CONTACT ***************** //
	$scope.contacts = [
		{tid: 'tenantA1', firstName: 'Peter', lastName: 'Windemann', nickName: 'pesche', jobTitle: 'CMO', company: 'Arbalo AG', groups: [	{text:'Friends'},	{text:'Business'}		],		email: [ 			{ type: 'workOld', text: 'peter.windemann@innopunkt.ch' },			{ type: 'work', text: 'peter.windemann@arbalo.ch' }		],		web: [ 			{ type: 'workOld', url: 'www.innopunkt.ch' },			{ type: 'work', url: 'www.arbalo.ch' },			{ type: 'hobby', url: 'www.artoogle.ch' }		],		dates: [			{ type: 'Gründung Arbalo', dateValue: '2014-12-17'}	],relationship: [	{ type: 'boss', text: 'Thomas Huber'},	{ type: 'spouse', text: 'Eva'}	]},
		{tid: 'tenantA2', firstName: 'Bruno', lastName: 'Kaiser',jobTitle: 'CEO', company: 'Arbalo AG',groups: [{text:'Business'}],	phone: [{ type: 'mobile', text: '+41 79 790 8929' }],email: [	{ type: 'work', text: 'bruno@arbalo.ch' },	{ type: 'home', text: 'bruno@bkaiser.ch' },	{ type: 'apple', text: 'bruno.kaiser@mac.com' }],web: [	{ type: 'work', url: 'www.arbalo.ch' },	{ type: 'workOld', url: 'www.adnovum.ch' },	{ type: 'alumni', url: 'www.alumni.ch' }],address: [			{ type: 'home', street: 'Rainstr. 73', zipCode: 'CH-8712', city: 'Stäfa', country: 'Switzerland' },	{ type: 'work', city: 'Hünenberg', country: 'Switzerland' },	{ type: 'work2', street: 'Konradstr. 32', zipCode: 'CH-8005', city: 'Zürich', country: 'Switzerland' }	]},
		{tid: 'tenantA3', firstName: 'Hans', lastName: 'Meier',groups: [{text:'Business'}]},
		{tid: 'tenantA4', firstName: 'Ruedi', lastName: 'Hauer',groups: []}
		];
	$scope.contactsOPT.contactNamesDisplay=[
		{tid:'tenantA1', firstName: 'Peter', lastName: 'Windemann', company: 'Arbalo AG'},
		{tid:'tenantA2', firstName: 'Bruno', lastName: 'Kaiser', company: 'Arbalo AG'},
		{tid:'tenantA3', firstName: 'Hans', lastName: 'Meier'},
		{tid:'tenantA4', firstName: 'Ruedi', lastName: 'Hauer'}
		];

	$scope.contactsShow=function(obj){
		$scope.contactsOPT.contactEdit=false;	
		var objIndex=findIndexbyKeyValue($scope.contacts, 'tid', obj.tid);	
		$scope.contactsOPT.contactTmp=$scope.contacts[objIndex];	
		$scope.contactsOPT.contactDisplay=$scope.prepareObj($scope.contacts[objIndex]);
		};

	$scope.prepareObj=function(){
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
		//var newUser;	
		if($scope.contactsOPT.contactNew){
			$scope.contactsOPT.contactTmp={tid:Math.random().toString(36).substr(2, 9)};
			//newUser=1;
			}		
		else {
			//newUser=0;
			}
		for(var i=0;i<$scope.contactsOPT.contactDisplay.length;i++){
			var obj=$scope.contactsOPT.contactDisplay[i];
			if(obj.animate) {
				delete obj.animate; //clear new field animation
				}
			if(obj.items && typeof obj.items[0] === 'string') {
				$scope.contactsOPT.contactTmp[obj.key]=obj.items[0];
				}
			else {
				$scope.contactsOPT.contactTmp[obj.key]=obj.items;
				}
			}
		$scope.contactsOPT.contactEdit=false;
		$scope.contactsShow({tid:$scope.contactsOPT.contactTmp.tid});
		};
	$scope.contactsDelete=function(){
		console.log('delte:', $scope.contactsOPT.contactTmp);
		var index = findIndexbyKeyValue($scope.contactsOPT.contactNamesDisplay, 'tid', $scope.contactsOPT.contactTmp.tid);
		if(index!==-1){
			$scope.contactsOPT.contactNamesDisplay.splice(index, 1);
			$scope.contactsOPT.contactEdit=false;
			$scope.contactsOPT.contactDisplay=null;
			$scope.contactsOPT.contactTmp=null;
		}
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
			tmpObj[$scope.itemsOPT[key].items[0].type]='';
			}
		obj.items.push(tmpObj);
		};
	$scope.addItemGeneric = function(key){
		if(!$scope.isDisplayedKey(key)) {
			var obj=$scope.itemsOPT[key];
			var finalObj={label:obj.label, key:key, items:[], sortNr:1-($scope.contactsOPT.contactDisplay.length)/1000, animate:1};
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
				}
			}
		return false;
		};
	//Datepicker
	$scope.today = function() {
		$scope.dt = $filter('date')(new Date(), 'yyyy-MM-dd');
		};
	$scope.today();	
	$scope.opened=[];
	$scope.open = function($event, openid) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened[openid] = true;
		};	
	$scope.formatedate = function (obj){	
		obj.dateValue = $filter('date')(obj.dateValue, 'dd.MM.yyyy');
		};		
	//Finds the index in a simple object-arry by key=>value
	var findIndexbyKeyValue = function(obj, key, value){
    	return obj.map(function(e){return e[key];}).indexOf(value);
	}
	//Persistance
    $scope.$on('$destroy', function(){
		statePersistence.setState('contact', {contacts: $scope.contacts, contactsOPT: $scope.contactsOPT, groupOPT: $scope.groupOPT});
		});
    var persVar=statePersistence.getState('contact');
    if(persVar) {
    	for(var key in persVar){
    		$scope[key]=persVar[key];
    	}    	
    }
});