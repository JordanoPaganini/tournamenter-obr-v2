(function() {

	var GlobalScorerName = 'ArtisticScorer2025Regional';
	
	angular.module('app.controllers', [])

	.controller('AppCtrl', [
		'$scope', '$location', function($scope, $location) {

			$scope.go = function (path) {
				$location.path(path);
			};

			$scope.isActive = function (pt){
				return $location.path().indexOf(pt) > -1;
			}
		}
	])

	.controller('SaveScoreController',
		function ($scope, $modalInstance, extra, Table){

			$scope.page = 'selectTable';
			$scope.selected = {
				table: null,
				round: null,
				score: null,
				total: extra.total,
				punishment: extra.punishment,
				doNotSave: extra.doNotSave,
				type: extra.type,
			};

			$scope.tables = Table.all(
				function (data){
					$scope.tables = data.filter(function(table) {
						return table.name.toLowerCase().includes('artistica') || table.name.toLowerCase().includes('artística');
					});
				},
				function (){
					$modalInstance.dismiss('cancel');
					window.alert('Falha ao baixar equipes e tabelas. REFAÇA A OPERAÇÃO.');
				}
			);

			$scope.selectTable = function (table){
				$scope.selected.table = table;
				$scope.selected.score = null;
			}

			$scope.pageRedirect = function (){
				if ($scope.selected.type === 0){
					$scope.page = 'selectTeam'
					$scope.selectRound(0)
				} else {
					$scope.page = 'selectRound'
				}
			}

			$scope.selectRound = function (round){
				$scope.selected.round = round;
			}
			
			$scope.selectScore = function (score){
				$scope.selected.score = score;
			}

			$scope.ok = function () {
				var selected = $scope.selected;
				var score = selected.score.scores;

				var isScoredAlready = score[selected.round];
				var isLoading = extra.doNotSave;

				if (!isLoading && isScoredAlready){

					var key = prompt("Parece que esta equipe já possui uma pontuação neste round."+
						"\nConfirme com o código para substituir.");

					if(key != '1235')
						return alert('Código incorreto.');
				};

				$modalInstance.close($scope.selected, $scope.extra);
			};

			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
		}
	)

	.controller('ArtisticScorer', ['$scope', GlobalScorerName, 'stopwatch', '$modal', 'Score',
		function ($scope, Scorer, stopwatch, $modal, Score) {
			var scp = $scope;

			$scope.scorer = Scorer;
			$scope.timer = stopwatch;
			$scope.team = null;

			$scope.scorings = {};
			$scope.scoreData = {};

			$scope.newScore = function (substitute, conf){
				if (conf){
					if (!confirm('Tem certeza de que deseja excluir isto?'))
						return;
				}
				$scope.scoreData = _.deepClone(substitute || Scorer.model);
				$scope.scoreData.type = Scorer.type
				$scope.timer.reset();
				$scope.team = null;
				$scope.compute();
			};

			$scope.compute = function (){
				console.log('Computando o score');
				$scope.scorings = $scope.scorer.score($scope.scoreData);
			};
			$scope.newScore();
			$scope.$watch('scoreData', function (){
				$scope.compute();
			}, true);

			$scope.sumSpecial = function (obj, keys){
				if (keys)
					obj = _.pick(obj, keys);
				return _.reduce(_.values(obj), function (memo, num){ return memo + num; }, 0);
			};

			$scope.getTotalTime = function() {
				if ($scope.scoreData.type === 0) {
					return $scope.scorer.model.interview.max_time * 10;
				} else {
					return $scope.scorer.model.presentation.max_time * 10;
				}
			};

			$scope.formatTime = function(ticks) {
				// ticks está em décimos de segundo
				var totalSeconds = Math.floor(ticks / 10);
				var minutes = Math.floor(totalSeconds / 60);
				var seconds = totalSeconds % 60;
				// Formata com zero à esquerda
				return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
			};

			// Timer de Apresentação - Middle Timer
			$scope.middleTimer = {
				running: false,
				startTick: null,
				value: 0,
				maxTime: $scope.scorer.model.presentation.min_presentation_time * 10 // Em décimos
			};

			// Inicia o cronômetro da apresentação
			$scope.startMiddleTimer = function () {
				$scope.middleTimer.startTick = $scope.timer.data.value;
				$scope.middleTimer.running = true;
				$scope.middleTimer.value = 0;
			};

			// Para o cronômetro da apresentação
			$scope.stopMiddleTimer = function () {
				$scope.middleTimer.running = false;
			};

			// Atualiza automaticamente o valor com base no cronômetro principal
			$scope.$watch('timer.data.value', function (newVal) {
				if ($scope.middleTimer.running && $scope.middleTimer.startTick !== null) {
					var elapsed = newVal - $scope.middleTimer.startTick;
					$scope.middleTimer.value = elapsed;
				}
			});

			$scope.adjustMax = function(key) {
				var type = $scope.scoreData.type === 0 ? 'interview' : 'presentation';
				var max = $scope.scorer.model[type].max_points;
				var val = $scope.scoreData.nota[type][key];

				if (val === null || val === undefined || isNaN(val)) {
					val = 0;
				}

				if (val < 0 || val > max) {
					alert('O valor da nota deve estar entre 0 e ' + max);
					val = 0;
				}

				// Armazena a nota formatada com uma casa decimal
				$scope.scoreData.nota[type][key] = parseFloat(val.toFixed(1));
			};


			$scope.selectScoredTeam = function (doNotSave){
 
				var modalInstance = $modal.open({
					templateUrl: 'views-artistica/modal.html?r=' + Math.random(),
					controller: 'SaveScoreController',
					size: 'lg',

					resolve: {
						extra : function (){
							return {
								total: $scope.scorings.total,
								doNotSave: doNotSave,
								type: doNotSave === true ? null: $scope.scoreData.type,
							}
						}
					}
				});

				modalInstance.result.then(function (selected){
					if (doNotSave && selected && selected.score.id){
						var score = selected.score;
						var index = selected.round;
						var scoreData = score.scores[index];
						var scoreTime = 0;

						var parsedData = JSON.parse(scoreData.data);

						setTimeout(function (){
							scp.scoreData = parsedData;
							scp.timer.data.value = scoreTime * 10
							scp.team = score.team && score.team.name || '<Equipe sem nome>'
							scp.$apply();
						}, 50);
						return;
					}
					
					if (!doNotSave && selected && selected.score.id){
						var number1 = selected.round

						Score.saveScore({
							number: number1,
							id: selected.score.id,
							data: $scope.scoreData,
							value: selected.total,
						}, function (){	
							checkScore();
						}, function (){window.alert('FALHA AO SALVAR #1. REFAÇA A OPERAÇÃO.')});
						
						function checkScore(){
							Score.get({
								id: selected.score.id
							}, function (score){
								if (score.scores[number1].value != selected.total){
									window.alert('FALHA AO SALVAR #2. REFAÇA A OPERAÇÃO.');
								} else {
									window.alert('OK! Salvo com sucesso.');
								}
							}, function (){
								window.alert('FALHA AO SALVAR #3. REFAÇA A OPERAÇÃO.');
							})
						}
					}
				}, function () {});
			};
		}
	]);
}).call(this);