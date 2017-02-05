(function() {
	'use strict';

	angular.module('appModule').service('appService',appService);

	appService.$inject = ['$http'];

	function appService($http) {
		let vm = this;

		vm.getData = function() {
			let subject = new Rx.Subject();
			let observable = subject.asObservable();

			///cosume "server sent event""
			let source = new EventSource('http://localhost:3000/stream');
			source.addEventListener('message', function(msg) {
				let msgJson = JSON.parse(msg.data);
				subject.next(msgJson);
				
			}, false);

			return observable;
		}
	}
})();

