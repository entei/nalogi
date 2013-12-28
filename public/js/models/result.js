var app = app || {};

(function() {
  app.Result = Backbone.Model.extend({
    defaults: {
      start_at: '0/0/0',
      end_at: '0/0/0',
      ref_rate: 25,
      penalty: 0
    }
  });
})();
