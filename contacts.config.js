'use strict';

angular.module('contacts', ['core'])
.config(function ($stateProvider) {
	$stateProvider
	.state('contacts', {
		url: '/contacts',
		templateUrl: 'app/contacts/list.html',
		controller: 'ContactsListCtrl',
		authenticate: true
	});
});
