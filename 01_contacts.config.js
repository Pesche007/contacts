'use strict';

angular.module('contacts', ['core'])
.config(function ($stateProvider) {
	$stateProvider
	.state('contacts', {
		url: '/contacts',
		templateUrl: 'app/contacts/contacts.html',
		controller: 'ContactsCtrl',
		parent: 'common',
		authenticate: true
	});
});
