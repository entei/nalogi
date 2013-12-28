  var RefRate = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this, "getMs");
    },

    getMs: function() {
      return (new Date(this.get('Date'))).getTime();
    }
  });

  // ref list from server
  var RefRates = Backbone.Collection.extend({
    model: RefRate,
    url: 'http://localhost:2000/api/refinancing_rates'
  });