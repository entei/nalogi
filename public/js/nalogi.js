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
      d: '0', 
      money: 0
    }
  });
  
  var ExtraCollection = Backbone.Collection.extend({
    model: ExtraPayment, 

    comparator: function(details) {
      return details.get('d')
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
      start: new Date,
      end: new Date
    },

    initialize: function() {
      _.bindAll(this, 'recalculate');
      this.extraCollection = new ExtraCollection(),
      this.results = new Results(),
      this.bind('change', this.recalculate);//fix it
      this.extraCollection.bind('change', this.recalculate, this);
    },

    recalculate: function() {
      var model = this;
      var getPenalty = this.getPenalty,
          dateFormat = this.dateFormat,
          getRefRate = this.getRefRate,
          results = this.results;

      this.results.reset(); //reset results collection

      var debt = parseInt(model.get('debt')), 
          start = model.get('start'),
          end = model.get('end'),
          ref_rate = 0;

      if(this.extraCollection.length != 0)
        this.extraCollection.each(function(ep) {
          temp_end = ep.get('d');
          extraMoney = ep.get('money');

          ref_rate = 25;
          //ref_rate = getRefRate(temp_end); //get ref rate on this date period
          var penalty = (getPenalty(debt, start, temp_end, ref_rate)),
              result = new Result({start_at: dateFormat(start), end_at: dateFormat(temp_end), ref_rate: ref_rate, penalty: penalty});
          console.log('penalty ' + penalty)
          results.add([result]); // add result to result collection
          debt -= parseFloat(extraMoney); //new_debt = debt - extraPay
          start = temp_end + 86400000; //new period without start day (in ms)
        });

      // penalty for last period
      //ref_rate = this.getRefRate(end.getTime());
      ref_rate = 23.7;
      var lastPenalty = (this.getPenalty(debt, start, end, ref_rate)),
          lastInterval = new Result({ start_at: this.dateFormat(start), end_at: this.dateFormat(end), ref_rate: ref_rate, penalty: lastPenalty});
          //lastInterval = new Result({ start_at: (start), end_at: (end), ref_rate: ref_rate, penalty: lastPenalty});
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
      var d = new Date(parseInt(date));
      return ( d.getMonth() + 1 +  "/" + d.getDate() + "/" + d.getFullYear());
    }
  });
 
  var AppView = Backbone.View.extend({  

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
    
    changeDebt: function(ev) {
      this.model.set({ 'debt': ev.target.value });
    }
  });

  var ApplicationLayout = Backbone.View.extend({
    initialize: function() {
      // создать вьюхи для this.model, this.model.extraPayments, this.model.results
      // и зааппендить их в нужные дивки
      _.bindAll(this, 'render');
      this.appView = new AppView({model: this.model, el: '#details'});
      this.extraBlockView = new ExtraBlockView({ model: this.model , el: '.extra'});
      this.resultBlockView = new ResultBlockView({ model: this.model, el: '#result'});
     },

    render: function() {
      this.appView.render();
      this.extraBlockView.render();
    }
  });
    
 var model = new AppModel();
 new ApplicationLayout({model: model}).render();
 
      $('.numbersOnly').keyup(function () { 
          this.value = this.value.replace(/[^0-9\.]/g,'');
      });

  //    var nowTemp = new Date(),
  //    now = (new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0));


});
