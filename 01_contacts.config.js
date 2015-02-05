'use strict';

angular.module('contacts', ['core'])
.config(function ($stateProvider) {
	$stateProvider
	.state('contacts', {
		url: '/contacts',
		templateUrl: 'app/contacts/list.html',
		controller: 'ContactsListCtrl',
		authenticate: true
	})
	.state('contacts-new', {
	url: '/contacts-new',
	templateUrl: 'app/contacts/list-new.html',
	controller: 'ContactsListNewCtrl',
	authenticate: true
	})
	.state('tasks', {
	url: '/tasks',
	templateUrl: 'app/contacts/tasks/tasks.html',
	controller: 'TasksCtrl',
	authenticate: true
	});
});
