  var AppView = Backbone.View.extend({  

    events: {
      'click input#ok': 'addResult',
    },

    initialize: function(){
      this.extraCollection = this.model.extraCollection;
      this.template = _.template($('#app-template').html());
      _.bindAll(this, 'render', 'addResult');
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
          // if(ev.date.valueOf() > end_at.datepicker('getDate').valueOf()){
          //   $error.text('Дата погашения должна быть больше даты возникновения задолженности');
          //   $error.show();
          //   start_at.datepicker("update", end_at.datepicker('getDate'));
          // }
        }),
      end_at = $('#end_at').datepicker({
          endDate: new Date
        }).on('changeDate', function(ev){
          model.set({end: [ev.date.valueOf()]});
          // if(ev.date.valueOf() < start_at.datepicker('getDate').valueOf()){
          //   $error.text('Дата погашения должна быть больше даты возникновения задолженности');
          //   $error.show();
          //   end_at.datepicker("update", start_at.datepicker('getDate'));
          // }
      });
    }, 
    
    addResult: function(){
      var collection = this.model.results,
          extraCollection = this.model.extraCollection,
          $body = $(this.el);
     

      $('#error').hide();
        extraCollection.reset(); //reset extra details collection

        this.model.set({
          debt: $body.find('#debt').val(),
          start: $body.find('#start_at').datepicker('getDate'),
          end: $body.find('#end_at').datepicker('getDate'),
        });

      // if($('.extraPayment').size() != 0){
      //   $('.extraPayment').each(function(index){
      //     var $extraDiv = $(this),
      //         end_interval = $extraDiv.find('[name="extraDate"]').datepicker('getDate').valueOf(), //getTime(); //end of period
      //         money = $extraDiv.find('[name="money"]').val();
      //     if(end_interval != 0 && money != 0 ){
      //       model.extraCollection.set({date: end_interval, money: money});// create new payment instance
      //       extraCollection.add([extraDetails]); //add item to collection of extra payment
      //     }
      //   });
      // }   
    },  
  });