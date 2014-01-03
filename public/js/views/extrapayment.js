var app = app || {};
(function() {
  //extra Payment view 
  app.ExtraPaymentView = Backbone.View.extend({

    events: {
      'change input#money': 'changeMoney'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'changeMoney', 'unrender');
      this.template = _.template($('#extraItem-template').html());
      this.model.bind('remove', this.unrender);
    },

    render: function() {
      model = this.model;
      appmodel = this.options.appmodel;
      var renderedContent = this.template();
      $(this.el).html(renderedContent);
      $(this.el).find('[name="extraDate"]').datepicker({
          startDate: new Date(parseInt(appmodel.get('start'))),
          endDate: new Date(parseInt(appmodel.get('end')) - 86400000)
        }).on('changeDate', function(ev){
          model.set({d: [ev.date.valueOf()]});
      });
      return this;
    },

    unrender: function() {
      $(this.el).remove();
    },

    changeMoney: function(ev) {
      this.model.set({'money': ev.target.value });
    }
  }); 
})();
