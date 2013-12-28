  var ExtraCollection = Backbone.Collection.extend({
    model: ExtraPayment, 

    comparator: function(details) {
      return details.get('d')
    }
  });