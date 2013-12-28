var app = app || {};

(function() {
  app.RefRate = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this, "getMs");
    },

    getMs: function() {
      return (new Date(this.get('Date'))).getTime();
    }
  });
})();
