var app = app || {};
(function() {
  // ref list from server
  var RefRates = Backbone.Collection.extend({
    model: app.RefRate,
    url: 'http://localhost:2000/api/refinancing_rates'
  });

  app.refRatesCollection = new RefRates();
  app.refRatesCollection.fetch();
})();
