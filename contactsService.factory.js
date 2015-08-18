'use strict';

/* 
 * a factory providing access to the rates REST service (RatesRS)
 */
angular.module('contacts')
.factory('ContactsService', function($log, $http, $q, cfg) {
	return {
		// list adressbooks
		listAdress: function() {		    
			return $http.get(cfg.contacts.SVC_URI)
			.success(function (data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ContactsService.list() returned with status ' + status);
			});
		},	
		listAdressAll: function(type) {
			var api = type===1 ? 'allContacts' : 'allOrgs';		    
			return $http.get(cfg.contacts.SVC_URI + '/' + api)
			.success(function (data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ContactsService.list() returned with status ' + status);
			});
		},				
		// create
		postAddress: function(addressbook) {			
			var data = {addressbookModel:addressbook};
			return $http.post(cfg.contacts.SVC_URI, data)
			.success(function(data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ContactsService.post() returned with status ' + status);
			});
		},
		// update
		putAddress: function(addressbook) {						
			var data = {addressbookModel:addressbook};
			return $http.put(cfg.contacts.SVC_URI + '/'+addressbook.id, data)
			.success(function(data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ContactsService.put() returned with Status ' + status);
			});
		},
		// delete
		deleteAddress: function(id) {			
			return $http.delete(cfg.contacts.SVC_URI + '/' + id)
			.success(function(data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ContactsService.delete() returned with status ' + status);
			});
		},
		listContacts: function(id, type) {	
			var api = type===1 ? 'contact' : 'org';						   
			return $http.get(cfg.contacts.SVC_URI + '/' + id +'/' + api)
			.success(function (data, status) {				
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ContactsService.list() returned with status ' + status);
			});
		},
		getContact: function(addressbook, id, type) {	
			var api = type===1 ? 'contact' : 'org';			
			return $http.get(cfg.contacts.SVC_URI + '/' + addressbook + '/' + api + '/' + id)
			.success(function(data, status) {

			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ContactsService.get(' + id + ') returned with status ' + status);
			});
		},	
		getContactAddress: function(addressbook, id, type) {			
			var api = type===1 ? 'contact' : 'org';	
			return $http.get(cfg.contacts.SVC_URI + '/' + addressbook + '/' + api + '/' + id + '/address')
			.success(function(data, status) {

			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ContactsService.get(' + id + ') returned with status ' + status);
			});
		},			
		saveContact: function(addressbook, contact, type) {	
			var api = type===1 ? 'contact' : 'org';					
			var data = type===1 ? {contactModel:contact} : {orgModel:contact};
			if(contact.id){
				return $http.put(cfg.contacts.SVC_URI + '/'+addressbook + '/' + api + '/' + contact.id, data)
				.success(function(data, status) {				
				})
				.error(function(data, status, headers, config) {
					$log.log('ERROR: ContactsService.put() returned with Status ' + status);
				});
			}
			else{
				return $http.post(cfg.contacts.SVC_URI + '/'+addressbook + '/' + api, data)
				.success(function(data, status) {				
				})
				.error(function(data, status, headers, config) {
					$log.log('ERROR: ContactsService.post() returned with Status ' + status);
				});
			}

		},
		postmulti:function(addressbook, contact, obj, type){
			console.log('saving', obj)
			var postOBJ=[], save;
			var api = type===1 ? 'contact' : 'org';	
			for(var key in obj){
				for(var i=0;i<obj[key].length;i++){
					save = {addressModel:obj[key][i]};			
					if(obj[key][i].id){
						if(obj[key][i].deleted){
							console.log('delete', save)
							postOBJ.push($http.delete(cfg.contacts.SVC_URI + '/' + addressbook + '/' + api + '/' + contact + '/'+key+'/' + obj[key][i].id));
						}
						else {
							console.log('put', save)
							postOBJ.push($http.put(cfg.contacts.SVC_URI + '/' + addressbook + '/' + api + '/' + contact + '/'+key+'/' + obj[key][i].id, save));
						}
					}
					else {
						console.log('post', save)
						postOBJ.push($http.post(cfg.contacts.SVC_URI + '/' + addressbook + '/' + api + '/' + contact + '/'+key, save));
					}
					
				}

			}
			return $q.all(postOBJ).then(function(data){
				console.log('success', data);
			  }, function(response) {
			    console.log('fail', response);
			});
		},
		deleteContact: function(addressbook, contact, type) {
			var api = type===1 ? 'contact' : 'org';				
			return $http.delete(cfg.contacts.SVC_URI + '/' + addressbook + '/' + api + '/' + contact)
			.success(function(data, status) {
			})
			.error(function(data, status, headers, config) {
				$log.log('ERROR: ContactsService.delete(' + contact + ') returned with status ' + status);
			});
		},				
	};
});