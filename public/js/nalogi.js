$(function(){

  var RefRate = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this, "getMs");
    },

    getMs: function() {
      return (new Date(this.get('Date'))).getTime();
    }
  });

  // ref list from server
  var RefRates = Backbone.Collection.extend({
    model: RefRate,
    url: 'http://localhost:2000/api/refinancing_rates'
  });

  var refRatesCollection = new RefRates();
  refRatesCollection.fetch();

  var ExtraPayment = Backbone.Model.extend({
    defaults: {
      date: '0', 
      money: 0
    }
  });
  
  var ExtraCollection = Backbone.Collection.extend({
    model: ExtraPayment, 

    comparator: function(details) {
      return details.get('date')
    }
  });
  
  var Result = Backbone.Model.extend({
    defaults: {
      start_at: '0/0/0',
      end_at: '0/0/0',
      ref_rate: 25,
      penalty: 0
    }
  });

  var Results = Backbone.Collection.extend({
    model: Result
  });

  //extra block
  var ExtraBlockView = Backbone.View.extend({
    tagName: 'div',
    
    events: {
      'click a#addExtra' : 'addExtraLine',
      'click #rm': 'removeExtraLine'
    },

    initialize: function() {
      _.bindAll(this, 'render');
      this.template = _.template($('#extraBlock-template').html());
    },

    render: function() {
      $(this.el).html(this.template());
    },

    addExtraLine: function(){
      $('<div class="extraPayment"><div class="input-append date" ><input class="span2" type="text" name="extraDate" placeholder="Дата"/><span class="add-on"><i class="icon-calendar"></i></span></div><input type="text" class="numbersOnly" id="money" name="money" placeholder="Сумма"></div>').appendTo($('.extra'));
      
      $('.numbersOnly').keyup(function () { 
          this.value = this.value.replace(/[^0-9\.]/g,'');
      });

      $('[name="extraDate"]').datepicker({
          endDate: now
        }).on('changeDate', function(ev){
          if(ev.date.valueOf() < start_at.datepicker('getDate').valueOf() || ev.date.valueOf()  > end_at.datepicker('getDate').valueOf()){
            $(this).datepicker("update", start_at.datepicker('getDate'));
          }
      });
    },

    removeExtraLine: function(){
      $(this.el).find('.extraPayment').last().remove();
    },
  });

  // 1 interval(result)
  var ResultView = Backbone.View.extend({
    tag: 'li',
    
    initialize: function(){
      _.bindAll(this, 'render');
      this.template = _.template($('#penalty-template').html());
    },

    render: function() {
      var renderedContent = this.template(this.model.toJSON());
      $(this.el).html(renderedContent);
      return this;
    }
  });

  //all section
  var ResultBlockView = Backbone.View.extend({
    tagName: 'section',

    initialize: function() {
      _.bindAll(this, 'render');  
      this.template = _.template($('#result-template').html());
      //render the view each time the result collection changed
      this.model.results.bind('add', this.render, this);
    },

    render: function() {
      var $results, 
          results = this.model.results;

      $(this.el).html(this.template({})); 
      $results = this.$('.results');

      results.each(function (penalty) {
        var view = new ResultView({
          model: penalty,
          collection: results
        });
        $results.append(view.render().el); //append each result line
      });
      return this;
    }
  });

  var AppModel = Backbone.Model.extend({
  
    defaults: {
      debt: 0,
      start: '0/0/0',
      end: '0/0/0'
    },

    initialize: function() {
      _.bindAll(this, 'recalculate');
      this.extraCollection = new ExtraCollection(),
      this.results = new Results(),
      this.bind('change', this.recalculate),
      this.extraCollection.bind('add', this.recalculate, this);
      extraBlockView = new ExtraBlockView({el: '.extra'}).render();
    },

    recalculate: function() {
      var getPenalty = this.getPenalty,
          dateFormat = this.dateFormat,
          getRefRate = this.getRefRate,
          results = this.results;

      results.reset();

      //need add info to result collection
      var debt = this.get('debt'), 
          start = this.get('start'),
          end = this.get('end'),
          ref_rate = 0;

      if(this.extraCollection.length != 0) {
        this.extraCollection.each(function(ep){
          temp_end = ep.get('date');
          extraMoney = ep.get('money');

          ref_rate = getRefRate(temp_end); //get ref rate on this date period

          var penalty = (getPenalty(debt, start, temp_end, ref_rate)),
              result = new Result({start_at: dateFormat(start), end_at: dateFormat(temp_end), ref_rate: ref_rate, penalty: penalty});
          
          results.add([result]); // add result to result collection
          debt -= parseFloat(extraMoney); //new_debt = debt - extraPay
          start = temp_end + 86400000; //new period without start day (in ms)
        });
      }

      // penalty for last period
      ref_rate = this.getRefRate(end.getTime());
      var lastPenalty = (this.getPenalty(debt, start, end, ref_rate)),
          lastInterval = new Result({ start_at: this.dateFormat(start), end_at: this.dateFormat(end), ref_rate: ref_rate, penalty: lastPenalty});
      this.results.add([lastInterval]);
    },

    validate: function(attr) {
      if(attr.start_at > attr.end_at){
        return 'wrong date!';
      }
    },

    getRefRate: function(date) {
      var prevD  = 0,
          rr = refRatesCollection.models[refRatesCollection.length - 1].get('Value');

      var model = (_.find(refRatesCollection.models, function(model) {  return model.getMs() >= date }));
      // set refinancing rate if period find
      if (model){
        rr = model.get('Value');
      }

      return rr;
    },

    getPenalty: function (debt, start_at, end_at, ref_rate) {
      var dd = Math.floor((end_at - start_at) / 86400000) + 1;
      return Math.round(debt * dd * ref_rate/36000);
    }, 

    dateFormat: function (date){
      var d = new Date(date);
      return ( d.getMonth() + 1 +  "/" + d.getDate() + "/" + d.getFullYear());
    }
  });
 
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
      body.html(this.template());
      //valid debt
      $('.numbersOnly').keyup(function () { 
          this.value = this.value.replace(/[^0-9\.]/g,'');
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

      if($('.extraPayment').size() != 0){
        $('.extraPayment').each(function(index){
          var $extraDiv = $(this),
              end_interval = $extraDiv.find('[name="extraDate"]').datepicker('getDate').valueOf(), //getTime(); //end of period
              money = $extraDiv.find('[name="money"]').val();
          if(end_interval != 0 && money != 0 ){
            var extraDetails = new ExtraPayment({date: end_interval, money: money});// create new payment instance
            extraCollection.add([extraDetails]); //add item to collection of extra payment
          }
        });
      }   
    },  
  });

  
  var appModel = new AppModel();
  var resultBlockView = new ResultBlockView({ model: appModel, el: '#result'}),
      appView = new AppView({model: appModel, el: '#details'});
 
  appView.render();
  
  var nowTemp = new Date(),
      now = (new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0));

  var $error = $("#error"),
        start_at = $('#start_at').datepicker({
          endDate: now 
        }).on('changeDate', function(ev){
          if(ev.date.valueOf() > end_at.datepicker('getDate').valueOf()){
            $error.text('Дата погашения должна быть больше даты возникновения задолженности');
            $error.show();
            start_at.datepicker("update", end_at.datepicker('getDate'));
          }
        }),
        end_at = $('#end_at').datepicker({
          endDate: now
        }).on('changeDate', function(ev){
          if(ev.date.valueOf() < start_at.datepicker('getDate').valueOf()){
            $error.text('Дата погашения должна быть больше даты возникновения задолженности');
            $error.show();
            end_at.datepicker("update", start_at.datepicker('getDate'));
          }
        });
});
