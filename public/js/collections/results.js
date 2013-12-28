var app = app || {};
(function() {
  app.Results = Backbone.Collection.extend({
    model: app.Result
  });
})();
