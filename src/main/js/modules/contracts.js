(function() {
    var module = angular.module('app.contracts', []);
    module.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/"); //if someone messes up the url, go back home
        $stateProvider
	        .state('viewContracts', {
	            url: '/contracts',
	            templateUrl: 'contracts/contracts.html',
	            controller: 'viewContracts'
	        })
	        .state('viewContract', {
	            url: '/contracts/view/:id',
	            templateUrl: 'contracts/contract.html',
	            controller: 'viewContract'
	        })
		    .state('editContract', {
		        url: '/contracts/edit/:id',
		        templateUrl: 'contracts/contract-form.html',
		        controller: 'editContract'
		    })
		    .state('addContract', {
		        url: '/contracts/add',
		        templateUrl: 'contracts/contract-form.html',
		        controller: 'addContract'
		    });
    });


    // 'contracts' state controller function
    module.controller('viewContracts', function($scope, Contract,$http, $rootScope, $state, User) {
        isUserConnected($http, $rootScope, $scope, $state, User);
    	//TODO: do some of this with configHeader:
    	$scope.app.configHeader({back: false, title: 'Contracts', contextButton: 'addContract'});

    	$scope.contracts = [];
    	$scope.contracts = Contract.query(); //Fetch contracts, thanks to restApi.js
    	//The bindings with contracts.html will display them automatically
    });

    // 'View contract' state controller function

    module.controller('viewContract',  function($scope,$window, $http, $stateParams, Contract, $rootScope, $state, User,Message,Oboe) {
        isUserConnected($http, $rootScope, $scope, $state, User);

			$scope.app.configHeader({back: true, title: 'View contract', contextButton: 'editContract', contextId: $stateParams.id});

			$scope.exchanges = [];
	  	var contract = Contract.get({id: $stateParams.id}, function() {
	    	//Just load the contract and display it via the bindings with contract.html
	    	$scope.contract = contract;
				// this variable help to get all information about contract
		    $scope.title = contract.title
	    	$scope.clauses = contract.clauses;
		    $scope.canceled = contract.canceled;
		    $scope.modality = contract.modality;
		    $scope.exchangeClause=contract.exchange;
				$scope.impModalities = contract.implementing;
				$scope.termModalities = contract.termination;
				$scope.parties = contract.partiesNames; //partiesNames is a hashmap
				$scope.exchangesStr = contract.exchange;
				buildExchanges($scope);
        /** Actually Exchange clause is Array<String> content all information about this exchange with string */
        $scope.Exchange=[];
        ex=contract.exchange;

        for (i=0; i<ex.length; i++){
        exchange=ex[i];
        console.log("Ex="+exchange);
        $scope.myarrays=[];
        $scope.myarrays=exchange.split('*');
        $scope.Exchange.push({
					'from':$scope.myarrays[0],
					'to':$scope.myarrays[1],
					'item':$scope.myarrays[2],
					'when':$scope.myarrays[3],
					'how':$scope.myarrays[4],
					'details':$scope.myarrays[5]});
        }

		    // Get parties from the hashmap of names and id (to identify exactly a user)
		      $scope.nameParties=contract.partiesNames;
          		    $scope.bodyparties=[];

          		    $scope.Implementing=contract.implementing;
          		    $scope.bodyImplementing=[];

                      $scope.Termination=contract.termination;
          		    $scope.bodyTermination=[];

          		    	$scope.nameParties.forEach(function(ex){
                              $scope.bodyparties.push(ex.value);
          		    	});

          		    	$scope.exchangeStrpdf=[];
          		    	$scope.exchangepdf=[];
          		    	$scope.exchangeStrpdf=contract.exchange;

          		        $scope.exchangeStrpdf.forEach(
          		        function(ex){
          		      	var splitedEx = ex.split('#'); // the separator used between parameters is #
               	        $scope.exchangepdf.push({
                                         			from : splitedEx[0],
                                         			what : splitedEx[1],
                                         			to : splitedEx[2],
                                         			when : splitedEx[3],
                                         			how : splitedEx[4],
                                         			details : splitedEx[5]
          		        });
                        console.log("RES="+$scope.exchangepdf);
          		        });

          		    	$scope.Implementing.forEach(function(ex){
                                          $scope.bodyImplementing.push(ex);
                      		    	});

                         	$scope.Termination.forEach(function(ex){
                                             $scope.bodyTermination.push(ex);
                         		    	});




	  	});

	  	$scope.pdfMake = $window.pdfMake;

	  	$scope.modify = function(){
		  	$state.go("editContract", {id : contract.id});
	  	};

	  	$scope.sign = function(){
		  	$http.put(RESTAPISERVER + '/api/contracts/sign/:id', contract.id);
		  	$state.go('viewContracts');
	  	};

		  $scope.decline = function(){
			  $http.put(RESTAPISERVER + '/api/contracts/cancel/:id', contract.id);
			  $state.go('viewContracts');
		  };

			// fonction to generate Pdf about one Contrat
		  	$scope.getPdf = function(){

    	  		console.log($scope.body);
          	var pdfMake = $scope.pdfMake;
             $scope.i=0;
          	var teste = $scope.test;
          	var docDefinition = {
              content: [
                { text: "Exchange Agreement", style: 'header' },
                { text:"1 . PREAMBLE :", style:'title' },
              	" The exchange agreement of items is non-profit."+" There is no exchange of money between "
                 +" parties, each of them giving to the other his items defined below for free and definitively." ,
                { text:" 2 . Exchange contract between:", style:'title' },
                 $scope.bodyparties,
                 { text:" 3 . TERMS OF THE CONTRACT ", style:'title' },
                 { text:" 3.1 . The exchange ", style:'title' },
                  table($scope.exchangepdf, ['from', 'to','what','when','how','details']),
                 { text:" 3.2 . The implementing modalities ", style:'title' },
                 $scope.Implementing,
                 { text:" 3.3 . The termination modalities ", style:'title' },
                 $scope.Termination,

                { text:" Done on :"+1+"             at:"+3 },
                { text:" 4 . signatory of the contract ", style:'title' },
                   $scope.bodyparties,

              ],

          styles: {
	         	header: {
	       			fontSize: 18,
	       			bold: true,
	       			margin: [200, 0, 0, 50]
	         	},
	         	title: {
		          fontSize: 14,
		          bold: true,
		          margin: [10, 20, 0, 20]
	          }
          }
        };
        pdfMake.createPdf(docDefinition).open();
        //   pdfMake.createPdf(docDefinition).download('optionalName.pdf');

    	}
        var currentUser = User.get({
            id: $scope.app.userid
        });
        $scope.addForum = function (contract,messageContent){
            var ids = [];
            var nicks = [];

            for (var i = 0; i<contract.partiesNames.length;i++){
                nicks.push(contract.partiesNames[i].value);
            }

            nicks.push(currentUser.nick);

            var message = new Message({
                receivers: contract.parties,
                receiversNicks: nicks,
                messageContent: messageContent,
                chatGroup: false,
                contractID : contract.id
            });
            console.log(message);
            Oboe({
                url: RESTAPISERVER + "/api/messages/",
                method: 'POST',
                body: message,
                withCredentials: true,
                headers: {'Auth-Token': $http.defaults.headers.common['Auth-Token']},
                start: function (stream) {
                    // handle to the stream
                    $scope.stream = stream;
                    $scope.status = 'started';
                    $scope.sendMessage = true;
                },
                done: function (parsedJSON) {
                    $scope.status = 'done';
                    $scope.sendMessage = false;
                }
            }).then(function () {

            }, function (error) {
                $scope.sendMessage = false;
                console.log("erreur lors de l'envoie du message");
            }, function (node) {
                if (node != null && node.length != 0) {
                    $scope.sendMessage = false;
                    console.log(node);
                    $state.go('messages');
                }
            });


        }
        $scope.form = false;
        $scope.forum = function () {
            $scope.form = !$scope.form;
        }
        $scope.checkClass = function () {
            switch (contract.status) {
                case 'NOWHERE':
                    return "panel-warning";
                case 'SIGNING':
                    return "panel-success";
                case 'FINALIZED':
                    return "panel-success";
                case 'CANCELLED':
                    return "panel-danger";
                case 'RESOLVING':
                    return "panel-default";
                default:
                    return "panel-warning";
            }

        };
		});


    module.controller('editContract', function($rootScope, $scope, $stateParams, Contract, $state, $http,User){

			//this function manages the disconnection because if the session expresses the return to the connection page
      isUserConnected($http, $rootScope, $scope, $state, User);

			$scope.app.configHeader({back: true, title: 'Edit contracts', contextId: $stateParams.id});
			$scope.action = 'edit';

			/****** Initialising the scope variables necessary to deal with the contract ******/
			$scope.form = {
				title : "",
				addParty : "",
				addFrom : "",
				addWhat : "",
				addTo : "",
				addWhen : "",
				addHow : "",
				addDetails : "",
				addImpModality : "",
				addTermModality : ""
			};
			//$scope.partiesList = []; // object array
			$scope.parties = []; // string array
    	$scope.exchanges = []; // object array
			//$scope.exchangesStr = []; // string array
      $scope.usersList = []; // object array
			$scope.users = []; // string array
			getUsers($http, $scope); // fill usersList and users
			$scope.itemsList = []; // will be filled with the items of the "from" user
			$scope.items = []; // string array
			/***********************************************/

			/****** Getting back the informations about the contract ******/
			var contract = Contract.get({id: $stateParams.id}, function() {
				//First, load the item and display it via the bindings with item-form.html
  			$scope.form.title = contract.title;
  			$scope.exchangesStr = contract.exchange;
				$scope.partiesList = contract.partiesNames; //partiesNames is a hashmap
        $scope.impModalities = contract.implementing;
				$scope.termModalities = contract.termination;
				$scope.partiesList.forEach(function(party) {
					$scope.parties.push(party.value + " - " + party.key);
				}); // build $scope.parties from $scope.partiesList
				buildExchanges($scope); // build $scope.exchanges from $scope.exchangesStr
			});
			/*******************************************************************/


			/****** Initialising the exchange modes ******/
			$scope.exchangeModes = [];
			$scope.exchangeModes[0] = "electronically";
			$scope.exchangeModes[1] = "delivery";
			$scope.exchangeModes[2] = "in person";
			/***********************************************/

			/****** Indicators for the modification of an implementing and termination modality ******/
			$scope.modifImpMod = {
				toModify : false, // indicate wheter a modality has to be modified
				index : -1 // modifying modality's index
			};
			$scope.modifTermMod = {
				toModify : false, // indicate wheter a modality has to be modified
				index : -1 // modifying modality's index
			};

			 /****** All the functions to add, delete or modify informations about the contract ******/
			$scope.updateParties = function() {updateParties($scope)};
			$scope.updateExchanges = function() {updateExchanges($scope)};
			$scope.updateImpModalities = function() {updateImpModalities($scope)};
			$scope.updateTermModalities = function() {updateTermModalities($scope)};

			$scope.deleteParty = function(p) {deleteParty($scope,p)};
			$scope.deleteExchange = function(c) {deleteExchange($scope,c)};
			$scope.deleteImpModality = function(m) {deleteImpModality($scope, m)};
			$scope.deleteTermModality = function(m) {deleteTermModality($scope, m)};

			$scope.modifyImpModality = function(m) {modifyImpModality($scope,m)};
			$scope.modifyTermModality = function(c) {modifyTermModality($scope,c)};
			$scope.cancelImpModality = function() {cancelImpModality($scope)};
			$scope.cancelTermModality = function() {cancelTermModality($scope)};
			$scope.validateImpModality = function() {validateImpModality($scope)};
			$scope.validateTermModality = function() {validateTermModality($scope)};

			$scope.updateItems = function() {updateItems($http, $scope)};
			/*******************************************************************/

			/****** Submit button function ******/
    	$scope.submit = function() {

				// isOK is a boolean indicating wether the user has entered all the mandatory informations about the contract
				var isOK = checkClauses($scope);
				if (isOK)
				{
          var partiesId = [];
          $scope.partiesList.forEach(function(party) {
            partiesId.push(party.key);
          });

					$scope.exchanges = [];
					buildExchangesStr($scope);
					buildExchanges($scope);

      		if ($scope.form.addParty != null && $scope.form.addParty.length>2){updateParties($scope);}
          if ($scope.form.addImpModality != null && $scope.form.addImpModality.length>2){updateImpModalities($scope);}
          if ($scope.form.addTermModality != null && $scope.form.addTermModality.length>2){updateTermModalities($scope);}

					//Contract is available thanks to restApi.js
      		contract.title = $scope.form.title;
					contract.parties = partiesId;
					contract.exchange = $scope.exchangesStr;
					contract.implementing = $scope.impModalities;
					contract.termination = $scope.termModalities;

      		contract.$update(function() {
      			$state.go('viewContracts');
      	  });
				}
    	};
			/*******************************************************************/

			/****** Delete button function ******/
    	$scope.delete = function(){
    		contract.$delete(function(){
    			 $state.go('viewContracts');
    		})
    	};
			/*******************************************************************/

    });

    module.controller('addContract', function($rootScope, $scope, Contract, Item, $state, $http,User){

      //this function manages the disconnection because if the session expresses the return to the connection page
      isUserConnected($http, $rootScope, $scope, $state, User);

    	$scope.app.configHeader({back: true, title: 'Add contracts'}); //Add Title
    	$scope.action = 'add';

			/****** Initialising the scope variables necessary to deal with the contract ******/
			$scope.form = {
				title : "",
				addParty : "",
				addFrom : "",
				addWhat : "",
				addTo : "",
				addWhen : "",
				addHow : "",
				addDetails : "",
				addImpModality : "",
				addTermModality : ""
			};
			$scope.partiesList = []; // object array
			$scope.parties = []; // string array
    	$scope.exchanges = []; // object array
			$scope.exchangesStr = []; // string array
			$scope.usersList = []; // object array
			$scope.users = []; // string array
			getUsers($http, $scope); // fill usersList and users
			$scope.itemsList = []; // will be filled with the items of the "from" user
			$scope.items = []; // string array
			/***********************************************/

			/****** Initialising the exchange modes ******/
			$scope.exchangeModes = [];
			$scope.exchangeModes[0] = "electronically";
			$scope.exchangeModes[1] = "delivery";
			$scope.exchangeModes[2] = "in person";
			/***********************************************/

			/****** Initialising the default implementing modalities ******/
			$scope.impModalities = [];
			$scope.impModalities[0] = "Parties must check the items before executing the exchange.";
			$scope.impModalities[1] = "Parties must provide an item corresponding to the description.";
			$scope.impModalities[2] = "Parties must inform the other signatories of any alterations.";
				+ "or modifications of the item they possess making it different from the description.";
			$scope.impModalities[3] = "Parties must provide a document as a proof of their identity.";
			$scope.impModalities[4] = "Parties are not responsible for any malfunctions or non-conformity "
				+ "of the item they gave for the execution of the contract.";
			/***********************************************/

			/****** Initialising the default termination modalities ******/
			$scope.termModalities = [];
			$scope.termModalities[0] = "Parties can refuse to execute the exchange at any time "
				+ "before any items has been exchanged."
			/***********************************************/

			/****** Indicators for the modification of an implementing and termination modality ******/
			$scope.modifImpMod = {
				toModify : false, // indicate wheter a modality has to be modified
				index : -1 // modifying modality's index
			};
			$scope.modifTermMod = {
				toModify : false, // indicate wheter a modality has to be modified
				index : -1 // modifying modality's index
			};

			 /****** All the functions to add, delete or modify informations about the contract ******/
			$scope.updateParties = function() {updateParties($scope)};
			$scope.updateExchanges = function() {updateExchanges($scope)};
			$scope.updateImpModalities = function() {updateImpModalities($scope)};
			$scope.updateTermModalities = function() {updateTermModalities($scope)};

			$scope.deleteParty = function(p) {deleteParty($scope,p)};
			$scope.deleteExchange = function(c) {deleteExchange($scope,c)};
			$scope.deleteImpModality = function(m) {deleteImpModality($scope, m)};
			$scope.deleteTermModality = function(m) {deleteTermModality($scope, m)};

			$scope.modifyImpModality = function(m) {modifyImpModality($scope,m)};
			$scope.modifyTermModality = function(c) {modifyTermModality($scope,c)};
			$scope.cancelImpModality = function() {cancelImpModality($scope)};
			$scope.cancelTermModality = function() {cancelTermModality($scope)};
			$scope.validateImpModality = function() {validateImpModality($scope)};
			$scope.validateTermModality = function() {validateTermModality($scope)};

			$scope.updateItems = function() {updateItems($http, $scope)};
			/*******************************************************************/

			/****** Submit button function ******/
    	$scope.submit = function() {

				// isOK is a boolean indicating wether the user has entered all the mandatory informations about the contract
				var isOK = checkClauses($scope);
				if (isOK)
				{
					var partiesId = [];
					$scope.partiesList.forEach(function(party) {
						partiesId.push(party.key);
					});

					buildExchangesStr($scope);

					if ($scope.form.addParty != null && $scope.form.addParty.length>2){updateParties($scope);}
					if ($scope.form.addTermModality != null && $scope.form.addTermModality.length>2){updateTermModalities($scope);}
					if ($scope.form.addImpModality != null && $scope.form.addImpModality.length>2){updateImpModalities($scope);}

	    		var contract = new Contract({
		    		title : $scope.form.title,
						parties : partiesId,
						exchange : $scope.exchangesStr,
						termination : $scope.termModalities,
	    			implementing : $scope.impModalities
					});

	      	// Create the contract in the database thanks to restApi.js
	    		contract.$save(function() {
						$state.go('viewContracts');
					});
				}
    	};
    });


  //directives define new html tags or attributes; think of them as macros.
  module.directive('contract', function() {
    return {
      restrict: 'E',
      templateUrl: 'contracts/one-contract.html' //TODO: rename this to item-one
    };
  });
  module.directive('party', function() {
    return {
      restrict: 'E',
      templateUrl: 'contracts/party.html'
    };
  });
  module.directive('exchange', function() {
	    return {
	      restrict: 'E',
	      templateUrl: 'contracts/exchange.html'
	    };
	  });

})();


/****** Functions to handle the modification of an implementing or termination modality ******/
function modifyImpModality($scope, m){
	$scope.form.addImpModality = m;
	$scope.modifImpMod.toModify = true;
	$scope.modifImpMod.index = $scope.impModalities.indexOf(m);
}
function modifyTermModality($scope, m){
	$scope.form.addTermModality = m;
	$scope.modifTermMod.toModify = true;
	$scope.modifTermMod.index = $scope.termModalities.indexOf(m);
}
function cancelImpModality($scope){
  endModifImpMod($scope, false);
}
function cancelTermModality($scope){
  endModifTermMod($scope, false);
}
function validateImpModality($scope){
	endModifImpMod($scope, true);
}
function validateTermModality($scope){
	endModifTermMod($scope, true);
}
function endModifImpMod ($scope, toValidate){
	if (toValidate == true)
	{
		var mod = $scope.form.addImpModality;
		console.log(mod);
		var index = $scope.modifImpMod.index;
		if (index != -1)
		{
			$scope.impModalities[index] = mod;
		}
	}
	$scope.form.addImpModality = "";
	$scope.modifImpMod.toModify = false;
	$scope.modifImpMod.index = -1;
}
function endModifTermMod ($scope, toValidate){
	if (toValidate == true)
	{
		var mod = $scope.form.addTermModality;
		var index = $scope.modifTermMod.index;
		if (index != -1)
		{
			$scope.termModalities[index] = mod;
		}
	}
	$scope.form.addTermModality = "";
	$scope.modifTermMod.toModify = false;
	$scope.modifTermMod.index = -1;
}
/*****************************************************************************/

/****** Functions to handle the deleting of a clause : party, exchange, implementing modality, termination modality ******/
function deleteImpModality($scope, m){
	var index = $scope.impModalities.indexOf(m);
	if (index > -1){
		$scope.impModalities.splice(index, 1);
	}
}
function deleteTermModality($scope, c){
	var index = $scope.termModalities.indexOf(c);
	if (index > -1){
		$scope.termModalities.splice(index, 1);
	}
}
function deleteExchange($scope, e){
	var index = $scope.exchanges.indexOf(e);
	if (index > -1){
		$scope.exchanges.splice(index, 1);
		$scope.exchangesStr.splice(index, 1);
	}
}
function deleteParty($scope, p){
	var index = $scope.partiesList.findIndex(party => party.key === p.key);
	if (index > -1){
		$scope.partiesList.splice(index, 1);
		$scope.parties.splice(index, 1);
	}
}
/*****************************************************************************/

/****** Functions to handle the adding of a clause : party, exchange, implementing modality, termination modality ******/
function updateParties($scope){
	var addParty = $scope.form.addParty.split(" - ");
  var newParty = {value : addParty[0], key : addParty[1]};
  var index = $scope.partiesList.findIndex(party => party.key === newParty.key);
	if (newParty.key != undefined && index == -1){
    $scope.partiesList.push(newParty);
		$scope.parties.push(newParty.value + ' - ' + newParty.key);
		$scope.form.addParty = "";
	}
}

function updateTermModalities($scope){
	var mod = $scope.form.addTermModality;
	var index = $scope.termModalities.indexOf(mod);
	if (index == -1){
		$scope.termModalities.push(mod);
		$scope.form.addTermModality = "";
	}
}

function updateImpModalities($scope){
	var mod = $scope.form.addImpModality;
	var index = $scope.impModalities.indexOf(mod);
	console.log(index);
	if (index == -1){
		$scope.impModalities.push(mod);
		$scope.form.addImpModality = "";
	}
}

function updateExchanges($scope){
	if (checkExchanges($scope) == true)
	$scope.exchanges.push({
		from : $scope.form.addFrom,
		what : $scope.form.addWhat,
		to : $scope.form.addTo,
		when : $scope.form.addWhen,
		how : $scope.form.addHow,
		details : $scope.form.addDetails
	});
}
/*****************************************************************************/

/****** Function to get all the users from the database ******/
function getUsers($http, $scope){
	$http.get(RESTAPISERVER + "/api/users/").then(
		function(response){
			var allUsers = response.data; // users in the database
			$scope.usersList = [];
			for(i = 0; i < allUsers.length; i++){
				if (allUsers[i].nick != ""){
					$scope.usersList[i] = { 'name' : allUsers[i].nick
							, 'id' : allUsers[i].id };
					$scope.users[i] = allUsers[i].nick + ' - ' + allUsers[i].id;
				}
			}
		}
	);
}

/****** Function to update the items according to the user selected in the From field ******/
function updateItems($http, $scope){
	$scope.items = []; // empty the items to then populate with only the new "From" user items
	$scope.itemsList = [];
	if ($scope.form.addFrom != undefined && $scope.form.addFrom != "")
	{
		var currentFromUser = $scope.form.addFrom.split(" - ")[1];
		if (currentFromUser != undefined && currentFromUser != "")
		{
			$http.get(RESTAPISERVER + "/api/items/all").then(
				function(response){
					var allItems = response.data;
					$scope.itemsList = [];
					for(i = 0; i < allItems.length; i++){
						if (allItems[i].nick != "" & allItems[i].userid == currentFromUser){
							$scope.itemsList[i] = { 'name' : allItems[i].title, 'id' : allItems[i].id};
							$scope.items[i] = allItems[i].title + ' - ' + allItems[i].id;
						}
					}
				}
			);
		}
	}
}

/****** Functions to build the arrays containing the exchanges ******/
function buildExchanges($scope){
	$scope.exchangesStr.forEach(function(ex){
		var splitedEx = ex.split('#'); // the separator used between parameters is #
		$scope.exchanges.push({
			from : splitedEx[0],
			what : splitedEx[1],
			to : splitedEx[2],
			when : splitedEx[3],
			how : splitedEx[4],
			details : splitedEx[5]
		});
	});
}
function buildExchangesStr($scope){
	$scope.exchanges.forEach(function(ex){
		$scope.exchangesStr.push(
			ex.from + "#" +
			ex.what + "#" +
			ex.to + "#" +
			ex.when + "#" +
			ex.how + "#" +
			ex.details + "#"
		);
	});
}

/****** Function to generate PDF contrat ******/
function buildTableBody(data, columns) {
    var body = [];

    body.push(columns);

    data.forEach(function(row) {
        var dataRow = [];

        columns.forEach(function(column) {
            dataRow.push(row[column].toString());
        })

        body.push(dataRow);
    });

    return body;
}

function table(data, columns) {
    return {
        table: {
            headerRows: 1,
            body: buildTableBody(data, columns)
        }
    };
}
/*****************************************************************************/

/****** Function to check whether the user filled out all the mandatory information about the contract ******/
function checkClauses($scope){

	var isOK = true;

	// Contract name
	if ($scope.form.title == null || $scope.form.title == "")
	{
		$scope.errorName = true;
		isOK = false;
	}
	else
	{
		$scope.errorName = false;
	}
	// Parties
	if ($scope.parties.length == 0)
	{
		$scope.errorParty = true;
		isOK = false;
	}
	else
	{
		$scope.errorParty = false;
	}
	// Exchanges
	if ($scope.exchanges.length == 0)
	{
		$scope.errorExchange = true;
		isOK = false;
	}
	else
	{
		$scope.errorExchange = false;
	}
	// Implementing modalities
	if ($scope.impModalities.length == 0)
	{
		$scope.errorImpModality = true;
		isOK = false;
	}
	else
	{
		$scope.errorImpModality = false;
	}
	// Termination modalities
	if ($scope.termModalities.length == 0)
	{
		$scope.errorTermModality = true;
		isOK = false;
	}
	else
	{
		$scope.errorTermModality = false;
	}

	return isOK;
}

function checkExchanges($scope){

	var isOK = true;

	// From field
	var newFromID = $scope.form.addFrom.split(' - ')[1];
	if (newFromID != undefined && $scope.partiesList.filter(party => party.key == newFromID).length > 0)
	{
		$scope.errorFrom = false;
	}
	else
	{
		$scope.errorFrom = true;
		isOK = false;
	}

	// What field
	var newWhatID = $scope.form.addWhat.split(' - ')[1];
	if (newWhatID != undefined && $scope.itemsList.filter(item => item.id == newWhatID).length > 0)
	{
		$scope.errorWhat = false;
	}
	else
	{
		$scope.errorWhat = true;
		isOK = false;
	}

	// To field
	var newToID = $scope.form.addTo.split(' - ')[1];
	if (newToID != undefined && $scope.partiesList.filter(party => party.key == newToID).length > 0)
	{
		$scope.errorTo = false;
	}
	else
	{
		$scope.errorTo = true;
		isOK = false;
	}

	// How field
	if ($scope.form.addHow != "" && $scope.exchangeModes.includes($scope.form.addHow))
	{
		$scope.errorHow = false;
	}
	else
	{
		$scope.errorHow = true;
		isOK = false;
	}

	return isOK;
}
/************************************************************/
