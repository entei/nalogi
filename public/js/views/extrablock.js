var app = app || {};

(function() {
  //extra block
  app.ExtraBlockView = Backbone.View.extend({   

    events: {
      'click a#addExtra' : 'addExtraLine',
      'click #rm': 'removeExtraLine'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'removeExtraLine');
      this.template = _.template($('#extraBlock-template').html()); 
    },

    render: function() {
      $(this.el).html(this.template());
    },

    addExtraLine: function(){
      var model = new app.ExtraPayment({id: (new Date()).valueOf()});
      this.model.extraCollection.add([model]);
      extraPaymentView = new app.ExtraPaymentView({model: model});
      $('.extraLine').append(extraPaymentView.render().el);
    },

    removeExtraLine: function(){
      ec = this.model.extraCollection;
      ec.remove(ec.last());
      ec.pluck('d');
    },
  });
})();
