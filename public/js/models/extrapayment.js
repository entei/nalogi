var app = app || {};

(function() {
  app.ExtraPayment = Backbone.Model.extend({
    defaults: {
      d: new Date, 
      money: 0
    }
  });
})();
