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
      var renderedContent = this.template();
      $(this.el).html(renderedContent);
      $(this.el).find('[name="extraDate"]').datepicker({
          endDate: new Date()
        }).on('changeDate', function(ev){
           model.set({d: [ev.date.valueOf()]});
          // if(ev.date.valueOf() < start_at.datepicker('getDate').valueOf() || ev.date.valueOf()  > end_at.datepicker('getDate').valueOf()){
          //   $(this).datepicker("update", start_at.datepicker('getDate'));
          // }
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
