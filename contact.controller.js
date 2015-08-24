'use strict';

angular.module('contacts')
.controller('ContactsCtrl', function ($scope, $filter, $modal, $timeout, cfg, ContactsService, alertsManager) {
	cfg.GENERAL.CURRENT_APP = 'contacts';
	
    //********************* ADRESSBOOK ***************** //	
	$scope.adressbookOPT={adressbookLoaded:0, adressbooks:[], structure:[], selected:[], standard:{}};	
	//Initial Load
	ContactsService.listAdress().then(function(result) {
		var data = result.data.addressbookModel;		
		var index = data.map(function(a){return a.name}).indexOf('AAA');
		if(index !== -1){
			data[index].name='Alle';
			data[index].disableEdit=1;
			data[index].disableDelete=1;
			$scope.adressbookOPT.selected = data[index];
			$scope.adressbookOPT.standard = data[index];
		}
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
			$scope.adressbookDropContact(param.drag.entity.id, param.drop.entity.id);
		}
		if(action===21){//Row Click
			$scope.selectAdressBook(param);			
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
		var contactModel = $scope.contactsOPT.type === 1 ? 'contactModel' : 'orgModel';
		if(row.isSelected){
			var id=row.entity.id;
			$scope.adressbookOPT.selected=row.entity;
		}
		else {
			var id=$scope.adressbookOPT.standard.id;
			$scope.adressbookOPT.selected=$scope.adressbookOPT.standard;
		}		
		ContactsService.listContacts(id,  $scope.contactsOPT.type).then(function(result) {				
			var data=result.data[contactModel];
			$scope.contactsOPT.contactsOverview=data;
			$scope.contactsDetailOPT.contactLoaded=0;
   		}, function(reason) {//error
   			alertsManager.addAlert('Could not load contacts. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);	
		});		
	}
	//Drop Contact on Adressbook
	$scope.adressbookDropContact = function(contactId, adressbookId){
		console.log('add contact ' + contactId + ' to addressbook ' + adressbookId)
	};

	//********************* CONTACT OVERVIEW ***************** //	
	$scope.contactsOPT={contactsLoaded:0, contactsOverview:[], structure:[], selected:[], type:1};

	//Get People
	var loadPersons = function (){
		ContactsService.listAdressAll(1).then(function(result) {
			var data = result.data.contactModel;		
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
	};
 	loadPersons(); //Initial load
 	//Get company
 	var loadCompanys = function(){ 		
		ContactsService.listAdressAll(2).then(function(result) {
			var data = result.data.orgModel;		
			$scope.contactsOPT.contactsOverview=data;
			$scope.contactsOPT.structure=[
				{ name:'Firmenname', field: 'name', inputType:'text'}
			];
			$scope.contactsOPT.contactsLoaded=1;
		}, function(reason) {//error
			alertsManager.addAlert('Could not get adressbooks. '+reason.status+': '+reason.statusText, 'danger', 'fa-times', 1);		
		});	
 	};
	//Handle Directive Call
	$scope.contactFunction=function (action, param, data){
		if(action===21){//Row Click
			$scope.selectContact(param);			
		}		
	};		
	//Handle Row Click on Contact
	$scope.selectContact=function (row){
		if(row.isSelected){
			$scope.contactsDetailOPT.contactLoaded=0;
			var id=row.entity.id;
			var contactModel = $scope.contactsOPT.type === 1 ? 'contactModel' : 'orgModel';
			$scope.contactsOPT.selected=row.entity;
			ContactsService.getContact($scope.adressbookOPT.selected.id, id, $scope.contactsOPT.type).then(function(result) {//GET normal contact attributes						
				$scope.contactsDetailOPT.contact=result.data[contactModel];
				ContactsService.getContactAddress($scope.adressbookOPT.selected.id, id, $scope.contactsOPT.type).then(function(result) {//GET additional REST attributes
					var data=result.data.addressModel;
					if(data.length){									
						for(var i=0;i<data.length;i++){
							if(!$scope.contactsDetailOPT.contact[data[i].addressType]){
								$scope.contactsDetailOPT.contact[data[i].addressType]=[];
							}
							$scope.contactsDetailOPT.contact[data[i].addressType].push(data[i]);
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

	$scope.contactsDetailOPT.personStructure={
		lastName:{label:'Nachname', inputType:'text', required:1},
		firstName:{label:'Vorname', inputType:'text', required:1},
		company:{label:'Firma', inputType:'text'},
		PHONE:{label:'Telefon', inputType:'custom-dropdown', dropdownItems:['HOME', 'WORK', 'OTHER'], dropdownMulti:1, dropdownObj:'PHONE', fields:[{label:'Telefon', inputType:'text', model:'value'}],  saveTo:'address'},
		EMAIL:{label:'Email', inputType:'custom-dropdown', dropdownItems:['HOME', 'WORK', 'OTHER'], dropdownMulti:1, dropdownObj:'EMAIL', fields:[{label:'Email', inputType:'mail', model:'value'}], saveTo:'address'},
		WEB:{label:'Webseite', inputType:'custom-dropdown', dropdownItems:['HOME', 'WORK', 'OTHER'], dropdownMulti:1, dropdownObj:'WEB', fields:[{label:'Webseite', inputType:'url', model:'value'}],  saveTo:'address'},
		POSTAL:{label:'Adresse', inputType:'custom-dropdown', dropdownItems:['HOME', 'WORK', 'OTHER'], dropdownMulti:1, dropdownObj:'POSTAL', fields:[{label:'Strasse', inputType:'text', model:'street'}, {label:'PLZ', inputType:'text', model:'postalCode'},  {label:'Ort', inputType:'text', model:'city'},  {label:'Land', inputType:'country-list', model:'countryCode'}], saveTo:'address'}
	};
	$scope.contactsDetailOPT.companyStructure={
		name:{label:'Firmenname', inputType:'text', required:1},
		PHONE:{label:'Telefon', inputType:'custom-dropdown', dropdownItems:['HOME', 'WORK', 'OTHER'], dropdownMulti:1, dropdownObj:'PHONE', fields:[{label:'Telefon', inputType:'text', model:'value'}],  saveTo:'address'},
		EMAIL:{label:'Email', inputType:'custom-dropdown', dropdownItems:['HOME', 'WORK', 'OTHER'], dropdownMulti:1, dropdownObj:'EMAIL', fields:[{label:'Email', inputType:'mail', model:'value'}], saveTo:'address'},
		WEB:{label:'Webseite', inputType:'custom-dropdown', dropdownItems:['HOME', 'WORK', 'OTHER'], dropdownMulti:1, dropdownObj:'WEB', fields:[{label:'Webseite', inputType:'url', model:'value'}],  saveTo:'address'},
		POSTAL:{label:'Adresse', inputType:'custom-dropdown', dropdownItems:['HOME', 'WORK', 'OTHER'], dropdownMulti:1, dropdownObj:'POSTAL', fields:[{label:'Strasse', inputType:'text', model:'street'}, {label:'PLZ', inputType:'text', model:'postalCode'},  {label:'Ort', inputType:'text', model:'city'},  {label:'Land', inputType:'country-list', model:'countryCode'}], saveTo:'address'}		
	};	
	$scope.contactsDetailOPT.structure = $scope.contactsDetailOPT.personStructure; // INITIAL LOAD

	//New
	var newEntry=function(){
		$scope.contactsDetailOPT.contact=[];
		$scope.contactsDetailOPT.contactLoaded=1;
		$scope.contactsDetailOPT.edit=1;
	};
	//Edit
	$scope.editContact=function(){
		$scope.contactsDetailOPT.edit=!$scope.contactsDetailOPT.edit;
		if($scope.contactCustomHeader[0].active){
			$scope.contactsOPT.type=1;
			$scope.contactsDetailOPT.structure = $scope.contactsDetailOPT.personStructure;
		}
		else {
			$scope.contactsOPT.type=2;
			$scope.contactsDetailOPT.structure = $scope.contactsDetailOPT.companyStructure;
		}		
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
		var contactModel = $scope.contactsOPT.type === 1 ? 'contactModel' : 'orgModel';
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
		if($scope.contactsOPT.type===1){//Attrib fn for Person
			contactSave.contact.fn=$scope.contactsDetailOPT.contact.firstName + ' ' + $scope.contactsDetailOPT.contact.lastName;
		}
		ContactsService.saveContact($scope.adressbookOPT.selected.id, contactSave.contact, $scope.contactsOPT.type).then(function(result) {	
			var contactData=result.data[contactModel];
			if(Object.getOwnPropertyNames(contactSave.additional).length !== 0) { //http://stackoverflow.com/questions/4994201/is-object-empty
				ContactsService.postmulti($scope.adressbookOPT.selected.id, contactData.id, contactSave.additional, $scope.contactsOPT.type).then(function(result) {
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
	//Views
	var viewPerson = function(){
		$scope.contactCustomHeader[0].active=1;
		$scope.contactCustomHeader[1].active=0;
		$scope.contactsOPT.type=1;
		$scope.contactsDetailOPT.structure = $scope.contactsDetailOPT.personStructure;
		$scope.contactsOPT.contactsLoaded = 0;
		$scope.contactsDetailOPT.contactLoaded=0;
	    $timeout(function() {
	    	loadPersons();
	    }, 100);
	};
	var viewCompany = function(){
		$scope.contactCustomHeader[0].active=0;
		$scope.contactCustomHeader[1].active=1;
		$scope.contactsOPT.type=2;
		$scope.contactsDetailOPT.structure = $scope.contactsDetailOPT.companyStructure;
		$scope.contactsOPT.contactsLoaded = 0;
		$scope.contactsDetailOPT.contactLoaded=0;
	    $timeout(function() {
	    	loadCompanys();
	    }, 100);				
	};	
	//CUSOTM HEADER
	$scope.contactCustomHeader=[{icon: 'fa fa-users', active:1, action: viewPerson}, {icon: 'fa fa-industry', active:0, action: viewCompany}, {icon: 'fa fa-plus', action: newEntry}];	
});