requirejs.config({
  paths: {
    'underscore': 'lodash'
  },
  shim: {
    'backbone': {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    'jquery-actual': {
      deps: ['jquery'],
      exports: 'jQuery.fn.actual'
    }
  }
});

define(['logout'], function() {});
