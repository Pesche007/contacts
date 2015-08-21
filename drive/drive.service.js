'use strict';

angular.module('contacts')

    .service('AlfrescoRestService', ['$http', function ($http) {

        var constants = {

            login: 'admin',
            password: 'admin',

            loginUrl: 'http://127.0.0.1:8081/alfresco/service/api/login',//'/alfresco/service/api/login',
            companyhome: "http://127.0.0.1:8081/alfresco/s/slingshot/doclib2/doclist/all/node/alfresco/user/home"
        };

        this.ticket = null;

        this.callAlfresco = function (args, callback) {

            var scope = this;

            var updateTicket = function (data) {

                scope.ticket = data.data.ticket;

                scope._addTicketToServerCall(args, callback);
            };

            if (!this.ticket) {

                this.login(updateTicket);

            } else {

                this._addTicketToServerCall(args, callback);
            }
        };

        this.login = function (callBack) {

            $http.post(constants.loginUrl, {
                "password": constants.password,
                "username": constants.login
            }).success(callBack);
        };


        this._addTicketToServerCall = function (args, callback) {

            args.params.alf_ticket = this.ticket;

            $http(args).success(callback);
        };

        this.init = function () {
            var scope = this;

            this.login(function (data) {
                scope.ticket = data.data.ticket;
            });
        };

    }]);
