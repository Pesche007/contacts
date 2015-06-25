'use strict';

angular.module('contacts')
.controller('ContactsCtrl', function ($scope, $filter, $modal, cfg, ContactsService, alertsManager) {
	cfg.GENERAL.CURRENT_APP = 'contacts';
	
    //********************* ADRESSBOOK ***************** //	
	$scope.adressbookOPT={adressbookLoaded:0, adressbooks:[], structure:[], selected:[]};	
	//Initial Load
	ContactsService.listAdress().then(function(result) {
		var data = result.data.addressbookModel;
		data.unshift({id:'adressbook-all', name:'Alle', disableEdit:1, disableDelete:1});
		$scope.adressbookOPT.adressbooks=data;
		$scope.adressbookOPT.structure=[
			{ name:'Adressbuch', field: 'name', inputType:'text'}
		];
		$scope.adressbookOPT.adressbookLoaded=1;
	}, function(reason) {//error
		alertsManager.addAlert('Could not get adressbooks. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	}); 
	//Handle Directive Call
	$scope.adressbookFunction=function (action, param, data){
		if(action===2){//Save new
			adressbookNewSave(param);
		}
		if(action===3){//Edit Save
			adressbookEditSave(param);
		}
		if(action===4){//Remove
			adressbookEditRemove(param);
		}	
		if(action===5){//Drop on adressbook
			console.log('id ' + param.drag.entity.id + ' dropped on id ' + param.drop.entity.id);
		}
	};
	//Save Adressbook -> New
	var adressbookNewSave = function(param){
		ContactsService.postAddress(param).then(function(result) {
			$scope.adressbookOPT.adressbooks.push(result.data.addressbookModel);			
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not create adressbook. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});
	};
	//Save Adressbook -> Edit
	var adressbookEditSave = function(param){
		ContactsService.putAddress(param).then(function(result) {
			var index = $scope.adressbookOPT.adressbooks.map(function(e) { return e.id;}).indexOf(param.id);
			$scope.adressbookOPT.adressbooks[index] = result.data.addressbookModel;				
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not update adressbook. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		}); 		
	};
	//Delete Adressbook
	var adressbookEditRemove = function(param) {
		ContactsService.deleteAddress(param.id).then(function(result) {
			var index = $scope.adressbookOPT.adressbooks.map(function(e) { return e.id;}).indexOf(param.id);
			$scope.adressbookOPT.adressbooks.splice(index, 1);	
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not delete adressbook. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
		}); 
	};	
	//Click on Row in Adressbook
	$scope.selectAdressBook=function(row){
		if(row.isSelected){
			var id=row.entity.id;
			$scope.adressbookOPT.selected=row.entity;
			ContactsService.listContacts(id).then(function(result) {				
				var data=result.data.contactModel;
				$scope.contactsOPT.contactsOverview=data;
	   		}, function(reason) {//error
	   			alertsManager.addAlert('Could not load contacts. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
			});
		}
		else {

		}		
	}

	//********************* CONTACT OVERVIEW ***************** //
	$scope.contactsOPT={contactsLoaded:0, contactsOverview:[], structure:[], selected:[]};	
	//Initial Load
	ContactsService.listAdressAll().then(function(result) { //CHANGE WHEN ADDRESSBOOK AND CONTACT DB WORK
		console.log(result)
		var data = result.data.contactModel;		
		//var data=[{id:'1234a', firstName:'Peter', lastName:'Windemann'}, {id:'1234b', firstName:'Bruno', lastName:'Kaiser'}];
		$scope.contactsOPT.contactsOverview=data;
		$scope.contactsOPT.structure=[
			{ name:'Vorname', field: 'firstName', inputType:'text'},
			{ name:'Nachname', field: 'lastName', inputType:'text'},
			{ name:'Firma', field: 'company', inputType:'text'}
		];
		$scope.contactsOPT.contactsLoaded=1;
	}, function(reason) {//error
		alertsManager.addAlert('Could not get adressbooks. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
	}); 	
	//Handle Row Click on Contact
	$scope.selectContact=function (row){
		if(row.isSelected){
			$scope.contactsDetailOPT.contactLoaded=0;
			var id=row.entity.id;
			$scope.contactsOPT.selected=row.entity;
			ContactsService.getContact($scope.adressbookOPT.selected.id, id).then(function(result) {//GET normal contact attributes						
				$scope.contactsDetailOPT.contact=result.data.contactModel;
				ContactsService.getContactAddress($scope.adressbookOPT.selected.id, id).then(function(result) {//GET additional REST attributes
					var data=result.data.addressModel;
					if(data.length){									
						for(var i=0;i<data.length;i++){
							if(!$scope.contactsDetailOPT.contact[data[i].attributeType]){
								$scope.contactsDetailOPT.contact[data[i].attributeType]=[];
							}
							$scope.contactsDetailOPT.contact[data[i].attributeType].push(data[i]);
						}
					}
					$scope.contactsDetailOPT.contactLoaded=1;
					}, function(reason) {//error
	   				alertsManager.addAlert('Could not load contact address. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
				});
	
	   		}, function(reason) {//error
	   			alertsManager.addAlert('Could not load contact. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
			});
		}
		else {
			$scope.contactsDetailOPT.contactLoaded=0;
		}		
	};

	//********************* CONTACT DETAILS ***************** //
	$scope.contactsDetailOPT={contactLoaded:0, edit:0, contact:[], contactSave:[], structure:{}};

	$scope.contactsDetailOPT.structure={
		lastName:{label:'Nachname', inputType:'text', required:1},
		firstName:{label:'Vorname', inputType:'text', required:1},
		company:{label:'Firma', inputType:'text'},
		phone:{label:'Telefon', inputType:'custom-dropdown', dropdownItems:['Arbeit', 'Privat', 'Andere'], dropdownMulti:1, dropdownObj:'phone', fields:[{label:'Telefon', inputType:'text', model:'value'}],  saveTo:'address'},
		email:{label:'Email', inputType:'custom-dropdown', dropdownItems:['Arbeit', 'Privat', 'Andere'], dropdownMulti:1, dropdownObj:'email', fields:[{label:'Email', inputType:'mail', model:'value'}], saveTo:'address'},
		url:{label:'Webseite', inputType:'custom-dropdown', dropdownItems:['Arbeit', 'Privat', 'Andere'], dropdownMulti:1, dropdownObj:'url', fields:[{label:'Webseite', inputType:'url', model:'value'}],  saveTo:'address'},
		address:{label:'Adresse', inputType:'custom-dropdown', dropdownItems:['Arbeit', 'Privat', 'Andere'], dropdownMulti:1, dropdownObj:'address', fields:[{label:'Strasse', inputType:'text', model:'street'}, {label:'PLZ', inputType:'text', model:'postalCode'},  {label:'Ort', inputType:'text', model:'city'},  {label:'Land', inputType:'text', model:'country'}], saveTo:'address'}
	};
	//New
	$scope.newContact=function(){
		$scope.contactsDetailOPT.contact=[];
		$scope.contactsDetailOPT.contactLoaded=1;
		$scope.contactsDetailOPT.edit=1;		

	};
	//Edit
	$scope.editContact=function(){
		$scope.contactsDetailOPT.edit=!$scope.contactsDetailOPT.edit;
		if($scope.contactsDetailOPT.edit){
			$scope.contactsDetailOPT.contactSave=angular.copy($scope.contactsDetailOPT.contact);
		}
		else {
			$scope.contactsDetailOPT.contact=angular.copy($scope.contactsDetailOPT.contactSave);
		}
	};
	//SAve
	$scope.contactSave = function(){
		//loop and filter out empty values
		var contactSave={contact:{}, additional:{}}; //contact => contact attributes / additional => Additional REST attributes
		for (var key in $scope.contactsDetailOPT.contact){
			if($scope.contactsDetailOPT.contact[key]===''){//empty string
				if($scope.contactsDetailOPT.structure[key] && $scope.contactsDetailOPT.structure[key].required){
					alertsManager.addAlert('Nicht alle obligatorischen Felder ausgefüllt. ', 'danger', 'fa-times', 1);
					return false;

				}
				else {
					continue;
				}
			}
			if($scope.contactsDetailOPT.structure[key] && $scope.contactsDetailOPT.structure[key].saveTo) {//additional REST inputs like email, phone etc.
				for(var i=0;i<$scope.contactsDetailOPT.contact[key].length;i++){//loop through all the additional items
					var models = $scope.contactsDetailOPT.structure[key].fields.map(function(e){return e.model;}); //get array of all values than can be set -> eg address -> street, country, etc.
					var isEmpty=true;
					for(var j=0;j<models.length;j++){
						if($scope.contactsDetailOPT.contact[key][i][models[j]]!==''){ //Check if at least one of the possible values is set
							isEmpty=false;
							break;
						}
					}
					if(isEmpty){
						continue;
					}
					if(!contactSave.additional[$scope.contactsDetailOPT.structure[key].saveTo]){
						contactSave.additional[$scope.contactsDetailOPT.structure[key].saveTo]=[];
					}
					contactSave.additional[$scope.contactsDetailOPT.structure[key].saveTo].push(angular.copy($scope.contactsDetailOPT.contact[key][i]));
				}
			}
			else {
				contactSave.contact[key]=angular.copy($scope.contactsDetailOPT.contact[key]);
			}
		}
		contactSave.contact.fn=$scope.contactsDetailOPT.contact.firstName + ' ' + $scope.contactsDetailOPT.contact.lastName; //fn
		ContactsService.saveContact($scope.adressbookOPT.selected.id, contactSave.contact).then(function(result) {	
			var contactData=result.data.contactModel;
			if(Object.getOwnPropertyNames(contactSave.additional).length !== 0) { //http://stackoverflow.com/questions/4994201/is-object-empty
				ContactsService.postmulti($scope.adressbookOPT.selected.id, contactData.id, contactSave.additional).then(function(result) {
					//all saved
					reloadContact(contactData);
					}, function(reason) {//error
   					alertsManager.addAlert('Could not load contact. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
				});	
			}
			else {
				reloadContact(contactData);
			}
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not load contact. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
		});		
	};
	var reloadContact=function(contactData){
		alertsManager.addAlert('Eintrag gespeichert.', 'success', 'fa-check', 1);				
		$scope.selectContact({isSelected:true, entity:{id:contactData.id}});	
		$scope.contactsDetailOPT.edit=0;		
		var index=$scope.contactsOPT.contactsOverview.map(function(e){return e.id}).indexOf(contactData.id);
		if(index!==-1){
			$scope.contactsOPT.contactsOverview[index].firstName=angular.copy(contactData.firstName);
			$scope.contactsOPT.contactsOverview[index].lastName=angular.copy(contactData.lastName);
		}
		else{
			$scope.contactsOPT.contactsOverview.push(contactData);
		}
	};
	$scope.contactDelete=function(){
		ContactsService.deleteContact($scope.adressbookOPT.selected.id, $scope.contactsDetailOPT.contact.id).then(function(result) {				
			var index=$scope.contactsOPT.contactsOverview.map(function(e){return e.id}).indexOf($scope.contactsDetailOPT.contact.id);
			if(index!==-1){
				$scope.contactsOPT.contactsOverview.splice(index, 1);
				$scope.contactsDetailOPT.edit=0;
				$scope.contactsDetailOPT.contactLoaded=0;
				alertsManager.addAlert('Eintrag gelöscht.', 'success', 'fa-check', 1);
			}
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not load contacts. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
		});
	};

	$scope.test=function(){
		console.log($scope.testen)
	}
	$scope.testen=2;
/*

	Addressbooks
	------------------------
	Ohne Selektion -> ALLE -> Alle kommt vom Server über einen call
	Oder ins selektierte AB


	//Contact Structure
	$scope.contactsDetailOPT.structure1={
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
	*/
});