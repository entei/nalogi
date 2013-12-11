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
  refRatesCollection.fetch({
    success: function(){
      console.log('success fetching');
    },

    error: function() {
      console.log('fetching error');
    }
  });

  var ExtraPayment = Backbone.Model.extend({
    defaults: {
      date: '0', 
      money: 0
    }
  });
  
  var ExtraCollection = Backbone.Collection.extend({
    model: ExtraPayment
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

  // 1 interval
  var ResultView = Backbone.View.extend({
    tag: 'li',
    
    initialize: function(){
      _.bindAll(this, 'render');
      this.template = _.template($('#penalty-template').html())
    },

    render: function() {
      var renderedContent = this.template(this.model.toJSON());
      $(this.el).html(renderedContent);
      return this;
    }
  });

  var ResultPenaltyView = ResultView.extend({
  });

  //all section
  var ResultBlockView = Backbone.View.extend({
    tagName: 'section',

    initialize: function() {
      _.bindAll(this, 'render');  
      this.template = _.template($('#result-template').html());
      //render the view each time the result collection changed
      this.collection.bind('add', this.render, this);
    },

    render: function() {
      var $results, 
          collection = this.collection;

      $(this.el).html(this.template({})); 
      $results = this.$('.results');

      collection.each(function (penalty) {
        var view = new ResultPenaltyView({
          model: penalty,
          collection: collection
        });
        $results.append(view.render().el); //append each result line
      });
      return this;
    }
  });


  var Details = Backbone.Model.extend({});
  
  var DetailsList = Backbone.Collection.extend({
    model: Details
  });

  var AppModel = Backbone.Model.extend({
    defaults: {
      'start_at': '',
      'end_at': '',
      'debt': ''
    },

   validate: function(attr) {
      if(attr.start_at > attr.end_at){
        return 'wrong date!';
      }
   }
  });
 
  var AppView = Backbone.View.extend({  
  
    events: {
      'click a#addExtra': 'addExtraLine',
      'click input#ok': 'addResult',
      'click #rm': 'removeExtraLine'
    },

    initialize: function(){
      this.template = _.template($('#app-template').html());
      _.bindAll(this, 'render', 'addExtraLine', 'addResult', 'addToExtra', 'getPenalty', 'getRefRate' ,  'dayDiff', 'dateFormat');
    },

    render: function(){
      var body = $(this.el);
      body.html(this.template());
      //valid debt
      $('.numbersOnly').keyup(function () { 
          this.value = this.value.replace(/[^0-9\.]/g,'');
      });
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
            console.log('wrong extra date!');
            $(this).datepicker("update", start_at.datepicker('getDate'));
          }
        });
    },

    removeExtraLine: function(){
      $(this.el).find('.extraPayment').last().remove();
    },

    addResult: function(){
      var collection = this.collection,
          getPenalty = this.getPenalty,
          dateFormat = this.dateFormat,
          getRefRate = this.getRefRate,
          $body = $(this.el);

      
      $('#error').hide();
        collection.reset();//reset result collection
        extraCollection.reset(); //reset extra details collection

        //if extra details present
      if($('.extraPayment').size != 0){
   
        this.addToExtra();//call function

        var debt = $body.find('#debt').val(),
            start = $body.find('#start_at').datepicker('getDate'),
            end = $body.find('#end_at').datepicker('getDate'),
            ref_rate = 0; 
        //alert(extraCollection.pluck('money'));

        extraCollection.each(function(ep){
          temp_end = ep.get('date');
          extraMoney = ep.get('money');
          
          ref_rate = getRefRate(temp_end); //get ref rate on this date period

          var penalty = (getPenalty(debt, start, temp_end, ref_rate)),
              result = new Result({start_at: dateFormat(start), end_at: dateFormat(temp_end), ref_rate: ref_rate, penalty: penalty});

          collection.add([result]); // add result to collection
          debt -= parseFloat(extraMoney); //new_debt = debt - extraPay 
          start = temp_end + 86400000; //new period without start day (in ms)
        });
      }

      // penalty for last period
      ref_rate = getRefRate(end.getTime());
      var lastPenalty = (getPenalty(debt, start, end, ref_rate)),
          lastInterval = new Result({ start_at: dateFormat(start), end_at: dateFormat(end), ref_rate: ref_rate, penalty: lastPenalty});
      collection.add([lastInterval]);
    },  

    addToExtra: function() {
      $('.extraPayment').each(function(index){
        var $extraDiv = $(this),
            end_interval = $extraDiv.find('[name="extraDate"]').datepicker('getDate').valueOf(), //getTime(); //end of period
            money = $extraDiv.find('[name="money"]').val();
        if(end_interval != 0 && money != 0 ){
          // console.log('Date -> ' + end_interval + ' money -> ' +  money);
          var extraDetails = new ExtraPayment({date: end_interval, money: money});// create new payment instance
          extraCollection.add([extraDetails]); //add item to collection of extra payment 
        }
      });
    },

    getPenalty: function (debt, start_at, end_at, ref_rate) {
      return Math.round(debt * this.dayDiff(start_at, end_at) * ref_rate/36000);
    },

    dayDiff: function(start, end) {
      // ms per day
      return Math.floor((end - start) / 86400000) + 1;
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

    dateFormat: function (date){
      var d = new Date(date);
      return ( d.getMonth() + 1 +  "/" + d.getDate() + "/" + d.getFullYear());
    }

  });


  var results = new Results(); //collection
  
  var extraCollection = new ExtraCollection();
 
  extraCollection.comparator = function(details) {
    return details.get('date');
  };

  var resultBlockView = new ResultBlockView({ collection: results, el: '#result'}),
      appView = new AppView({collection: results, extraCollection: extraCollection, el: '#details'});
  
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
