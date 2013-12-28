var app = app || {};

(function(){
  app.ExtraCollection = Backbone.Collection.extend({
    model: app.ExtraPayment, 

    comparator: function(details) {
      return parseInt(details.get('d'));
    }
  });
})();