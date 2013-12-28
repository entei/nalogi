  //extra block
  var ExtraBlockView = Backbone.View.extend({   

    events: {
      'click a#addExtra' : 'addExtraLine',
      'click #rm': 'removeExtraLine'
    },

    initialize: function() {
      _.bindAll(this, 'render');
      this.template = _.template($('#extraBlock-template').html());
      // this.model.extraCollection.bind('add', this.addLine);
      // this.model.extraCollection.bind('remove', this.render);    
    },

    // addLine: function() {
    //  // var model = new ExtraPayment();
    // //  this.model.extraCollection.add([model]);
    //   extraPaymentView = new ExtraPaymentView({model: model});
    //   $('.extraLine').append(extraPaymentView.render().el);
    // },

    render: function() {
      $(this.el).html(this.template());
    },

    addExtraLine: function(){
      var model = new ExtraPayment({id: (new Date()).valueOf()});
      this.model.extraCollection.add([model]);
      extraPaymentView = new ExtraPaymentView({model: model});
      $('.extraLine').append(extraPaymentView.render().el);
    },

    removeExtraLine: function(){
     // model.extraCollection.remove();
    },
  });