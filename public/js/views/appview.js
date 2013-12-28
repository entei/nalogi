var app = app || {};

(function() {
  app.AppView = Backbone.View.extend({  

    events: {
      'change input#debt':  'changeDebt'
    },

    initialize: function(){
      this.extraCollection = this.model.extraCollection;
      this.template = _.template($('#app-template').html());
      _.bindAll(this, 'render', 'changeDebt');
    },

    render: function(){
      var body = $(this.el);
      model = this.model;
      body.html(this.template());
      //valid debt
      $('.numbersOnly').keyup(function () { 
          this.value = this.value.replace(/[^0-9\.]/g,'');
      });

      var $error = $("#error"),
      start_at = $(this.el).find($('#start_at')).datepicker({
          endDate: new Date
        }).on('changeDate', function(ev){
          model.set({start: [ev.date.valueOf()]});
          if(ev.date.valueOf() > end_at.datepicker('getDate').valueOf()){
            $error.text('Дата погашения должна быть больше даты возникновения задолженности');
            $error.show();
            start_at.datepicker("update", end_at.datepicker('getDate'));
          }
        }),
      end_at = $('#end_at').datepicker({
          endDate: new Date
        }).on('changeDate', function(ev){
          model.set({end: [ev.date.valueOf()]});
          if(ev.date.valueOf() < start_at.datepicker('getDate').valueOf()){
            $error.text('Дата погашения должна быть больше даты возникновения задолженности');
            $error.show();
            end_at.datepicker("update", start_at.datepicker('getDate'));
          }
      });
    }, 
    
    changeDebt: function(ev) {
      this.model.set({ 'debt': ev.target.value });
    }
  }); 
})();
