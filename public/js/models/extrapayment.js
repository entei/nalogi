var app = app || {};

(function() {
  app.ExtraPayment = Backbone.Model.extend({
    defaults: {
      d: 0, 
      money: 0
    }
  });
})();
