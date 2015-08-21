'use strict';

var constants = {
    servicesPath: "http://127.0.0.1:8081/alfresco/s",
    companyhome: "http://127.0.0.1:8081/alfresco/s/slingshot/doclib2/doclist/all/node/alfresco/user/home{{path}}?libraryRoot=alfresco://company/home"
};

angular.module('contacts')
    .directive("docListItem", function () {

        return {
            restrict: 'E',
            scope:{
                folder:'=',
                preventTopnav:'@'
            },
            templateUrl: 'app/contacts/drive/drive.template-list.html',
            controller: ['$scope', '$http', '$interpolate', 'AlfrescoRestService', function ($scope, $http, $interpolate, rest) {
                $scope.drawClass = function(name){
                    var ending = name.split('.').pop().toLowerCase();
                    if(ending === 'txt') {return 'fa fa-file-text-o margin-right-M';}
                    else if(ending === 'pdf') {return 'fa fa-file-pdf-o margin-right-M';}
                    else if(ending === 'doc' || ending ==='docx') {return 'fa fa-file-word-o margin-right-M';}
                    else if(ending === 'xls' || ending ==='xlsx') {return 'fa fa-file-excel-o margin-right-M';}
                    else {return 'fa fa-file-o margin-right-S';}
                }
                var store = this;

                store.docLib = [];

                store.path = $scope.folder ? $scope.folder : '';

                store.urlTemplate = $interpolate(constants.companyhome);

                this.goIntoFolder = function (item) {

                    this.path += "/" + item.location.file;

                    this.openFolder(this.getFolderUrl());
                };

                this.goBack = function () {

                    var endIndex = this.path.lastIndexOf("/");

                    this.path = this.path.substring(0, endIndex);

                    this.openFolder(this.getFolderUrl());
                };

                this.openFolder = function (path) {

                    rest.callAlfresco({
                        method: 'GET',
                        url: path,
                        params: {}
                    }, function (data) {
                        store.docLib = data;
                    });

                };

                this.clickLink = function (item) {

                    if (item.node.isContainer) {

                        this.goIntoFolder(item);

                    } else {

                        window.open(this.getDownloadUrl(item), "_blank");
                    }
                };

                this.getFolderUrl = function () {
                    return this.urlTemplate({path: this.path});
                };

                this.getDownloadUrl = function (item) {

                    return constants.servicesPath + item.node.contentURL + "?alf_ticket=" + rest.ticket;
                };

                this.openFolder(this.getFolderUrl());

            }],

            controllerAs: "docLibCtrl"
        }
    })
.directive('uploadFile', function () {
       return {
            restrict: 'E',
            templateUrl: 'app/contacts/drive/drive.template-upload.html',
            scope: {
                siteid: "@",
                folder: "@",
                uploader: "=",
                imgUrl: "=",
                width: "@",
                height: "@",
                transform: "@",
                exactlysize:"@"
            },
            controller: ['$scope', 'Upload', 'AlfrescoRestService', '$interpolate', function ($scope, Upload, rest, $interpolate) {

                // init alf_ticket
                rest.init();

                // setup url templates
                var imageTemplate = $interpolate("http://127.0.0.1:8081/alfresco/s/slingshot/node/content/{{nodeRef}}/{{name}}?alf_ticket={{ticket}}"),
                    thumbnailTemplate = $interpolate("http://127.0.0.1:8081/alfresco/s/api/node/{{nodeRef}}/content/thumbnails/imgpreview?c=force&alf_ticket={{ticket}}"),
                    uploadTemplate = $interpolate("http://127.0.0.1:8081/alfresco/s/api/upload?alf_ticket={{ticket}}"),
                    uploadAndTransform = $interpolate("http://127.0.0.1:8081/alfresco/s/rest/scaleImage?alf_ticket={{ticket}}");

                // init uploader
                $scope.uploadFiles = function(file) {
                    $scope.f = file;
                    if (file && !file.$error) {
                        file.upload = Upload.upload({
                            url: uploadTemplate({ticket: rest.ticket}),
                            fields: {siteid: $scope.siteid, uploaddirectory: $scope.folder || "/", containerid: "documentLibrary"},
                            file: file,
                            fileFormDataName:'filedata',
                            withCredentials:true
                        });

                        file.upload.then(function (response) {
                            $timeout(function () {
                                file.result = response.data;
                            });
                        }, function (response) {
                            if (response.status > 0) {
                                $scope.errorMsg = response.status + ': ' + response.data;
                            }
                        });

                        file.upload.progress(function (evt) {
                            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        });
                        file.upload.error(function(data, status, headers, config) {
                            console.log(data, status, headers, config)
                        });
                        file.upload.xhr(function(xhr){
                            console.log(xhr)
                        });
                    }   
                }

                $scope.upload = function (file) {
                    Upload.upload({
                        url: uploadTemplate({ticket: rest.ticket}),
                        fields: {siteid: $scope.siteid, uploaddirectory: $scope.folder || "/", containerid: "documentLibrary"},
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    }).error(function (data, status, headers, config) {
                        console.log('error status: ' + status, data, headers, config);
                    })
                };
        }]
    }

})
/*.directive('uploadFile', function () {

        return {
            restrict: 'E',
            templateUrl: 'app/contacts/drive/drive.template-upload.html',
            scope: {
                siteid: "@",
                folder: "@",
                uploader: "=",
                imgUrl: "=",
                width: "@",
                height: "@",
                transform: "@",
                exactlysize:"@"
            },
            controller: ['$scope', 'FileUploader', 'AlfrescoRestService', '$interpolate', function ($scope, FileUploader, rest, $interpolate) {

                // init alf_ticket
                rest.init();

                // setup url templates
                var imageTemplate = $interpolate("http://127.0.0.1:8081/alfresco/s/slingshot/node/content/{{nodeRef}}/{{name}}?alf_ticket={{ticket}}"),
                    thumbnailTemplate = $interpolate("http://127.0.0.1:8081/alfresco/s/api/node/{{nodeRef}}/content/thumbnails/imgpreview?c=force&alf_ticket={{ticket}}"),
                    uploadTemplate = $interpolate("http://127.0.0.1:8081/alfresco/s/api/upload?alf_ticket={{ticket}}"),
                    uploadAndTransform = $interpolate("http://127.0.0.1:8081/alfresco/s/rest/scaleImage?alf_ticket={{ticket}}");

                // init uploader
                $scope.uploader = new FileUploader({
                    alias: 'filedata',                    
                    autoUpload: true, 
                    formData: [{
                        siteid: $scope.siteid,
                        uploaddirectory: $scope.folder || "/",
                        containerid: "documentLibrary"
                    }]
                });

                $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {

                    // Convert nodeRef to string value that can be used in the url.
                    // For example from workspace://SpacesStore/deef1dde-abbf-4c4d-964f-6e3739b3f90a
                    // to workspace/SpacesStore/deef1dde-abbf-4c4d-964f-6e3739b3f90a
                    var stringNode = response.nodeRef.replace(":/", "");

                    // set tOptions
                    var options = {
                        nodeRef: stringNode,
                        name: response.name,
                        ticket: rest.ticket
                    };

                    // display image or thumbnail of file
                    $scope.imgUrl = (fileItem.file.type.indexOf("image/") != -1) ? imageTemplate(options) : thumbnailTemplate(options);
                };

                // set ticket before upload item to have ability to call upload REST API
                $scope.uploader.onBeforeUploadItem = function (item) {

                    // if you want to transform image we need to set additional params
                    if ($scope.transform == "true") {

                        item.url = uploadAndTransform({ticket: rest.ticket});

                        if ($scope.width !== undefined) {

                            item.formData.push({width: $scope.width});
                        }

                        if ($scope.height !== undefined) {

                            item.formData.push({height: $scope.height});

                        }

                        if ($scope.exactlysize !== undefined) {

                            item.formData.push({exactlysize: $scope.exactlysize});

                        }
                    } else {

                        item.url = uploadTemplate({ticket: rest.ticket});
                    }
                };

                $scope.uploader.onCompleteItem  = function(item, response, status, headers) {
                    console.info('onCompleteItem', item, response, status, headers);
                };
                $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
                    console.info('onErrorItem', fileItem, response, status, headers);
                    //alert(response.message);
                };
            }]
        }
    });
*/