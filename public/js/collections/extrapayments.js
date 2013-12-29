var app = app || {};

(function(){
  app.ExtraCollection = Backbone.Collection.extend({
    model: app.ExtraPayment, 

    comparator: function(detail) {
      return detail.get('d');
    }
  });
})();