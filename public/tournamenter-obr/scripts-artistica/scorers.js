var URL_CONFIG = '/api/scorer-config';

var interview_judges = null;
var presentation_judges = null;

fetch(URL_CONFIG)
  .then(response => response.json())
  .then(config => {
    interview_judges = config.interview.number_juizes;
    presentation_judges = config.presentation.number_juizes;

    // Carrega o número de juízes dinamicamente conforme configurado em /obr-config
    console.log('Config carregada:', interview_judges, presentation_judges);
  })

var app = angular.module('app.scorers', [])
  
.factory('ArtisticScorer2025Regional', function (){
  var model = {
    nota: { // Prenchido dinamicamente
      interview: {},
      presentation: {}
    },
    interview: {
      'max_time': 600, // Tempo, em segundos, maxímo de entrevista previsto em regulamento
      'max_points': 40, 
      'number_juizes': interview_judges,
    },
    presentation: {
      'max_time': 420, // Tempo, em segundos, maxímo de palco previsto em regulamento
      'max_points': 60,
      'min_presentation_time': 90, // Tempo, em segundos, mínimo de apresentação previsto em regulamento
      'number_juizes': presentation_judges,
    },
  };

  var scorings ={

    nota: function(sub, val, scorings, model){
      return 0;
    },

  };

  // Inicializa notas dinamicamente para entrevista
  for (var i = 0; i < model.interview.number_juizes; i++) {
    model.nota.interview[i] = 0;
  }

  // Inicializa notas dinamicamente para apresentação
  for (var i = 0; i < model.presentation.number_juizes; i++) {
    model.nota.presentation[i] = 0;
  }

  return {
    view: 'views-artistica/artistic_scorer_2025_regional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    type: 0, // Type: 0 = Entrevista; Type: 1 = Apresentação
    score: function (model) {
      var scored = {
        total: 0,
      };

      var typeKey = model.type === 0 ? 'interview' : 'presentation';
      var notas = model.nota[typeKey];

      var soma = 0;
      var count = 0;

      for (var key in notas) {
        var val = notas[key];
        if (typeof val === 'number' && !isNaN(val) && val != 0) {
          soma += val;
          count++;
        } else {
          soma += val;
          count++;
        }
      }

      var media = count > 0 ? soma / count : 0;
      scored.total = Math.round(media);

      return scored;
    }

  }
})  
