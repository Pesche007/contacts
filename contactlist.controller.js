'use strict';

angular.module('contacts')
.controller('ContactsListCtrl', function ($scope, AppConfig) {
	AppConfig.setCurrentApp('Contacts', 'fa-user', 'contacts', 'app/contacts/menu.html');

});

