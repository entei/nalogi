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
      var me = this;
      var body = $(this.el);
      model = this.model;
      body.html(this.template());
      //valid debt
      $('.numbersOnly').keyup(function () { 
          this.value = this.value.replace(/[^0-9\.]/g,'');
      });

      var $error = $("#error"),
      errors = [],
      start_at = $(this.el).find($('#start_at')).datepicker({
          endDate: new Date
        }).on('changeDate', function(ev){
          me.hideErrors();
          if(ev.date.valueOf() > end_at.datepicker('getDate').valueOf()){
            errors.push({name: 'start', message: 'Дата погашения должна быть больше даты возникновения задолженности.'});
            me.showErrors(errors);
           // start_at.datepicker("update", end_at.datepicker('getDate'));
          } else model.set({start: [ev.date.valueOf()]}); // wrong ev
        }),
      end_at = $('#end_at').datepicker({
          endDate: new Date
        }).on('changeDate', function(ev){
          me.hideErrors();
          if(ev.date.valueOf() < start_at.datepicker('getDate').valueOf()){
            errors.push({name: 'start', message: 'Дата погашения должна быть больше даты возникновения задолженности.'});
            me.showErrors(errors);
           // end_at.datepicker("update", start_at.datepicker('getDate'));
          } else model.set({end: [ev.date.valueOf()]});
      });
    }, 
    
    changeDebt: function(ev) {
      this.model.set({ 'debt': ev.target.value });
    },

    showErrors: function(errors) {
      console.log('errors');
      _.each(errors, function (error) {
          var controlGroup = this.$('.' + error.name);
          controlGroup.addClass('error');
          //controlGroup.find('.help-inline').text(error.message);
      }, this);
    },

    hideErrors: function () {
      this.$('.control-group').removeClass('error');
     // this.$('.help-inline').text('');
    }
  }); 
})();
