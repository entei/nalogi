  //extra Payment view 
  var ExtraPaymentView = Backbone.View.extend({

    initialize: function() {
      _.bindAll(this, 'render');
      this.template = _.template($('#extraItem-template').html());
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
    } 
  });