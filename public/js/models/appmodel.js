var app = app || {};

(function() {
  app.AppModel = Backbone.Model.extend({

    defaults: {
      debt: 0,
      start: 0,
      end: 0
    },

    initialize: function() {
      _.bindAll(this, 'recalculate');
      this.extraCollection = new app.ExtraCollection(),
      this.results = new app.Results(),
      this.bind('change', this.recalculate);
      this.extraCollection.bind('change', this.recalculate);
      this.extraCollection.bind('remove', this.recalculate);
    },

    recalculate: function() {
      var model = this;
      var getPenalty = this.getPenalty,
          dateFormat = this.dateFormat,
          getRefRate = this.getRefRate,
          extraCollection = this.extraCollection,
          results = this.results;

      this.results.reset(); //reset results collection

      var debt = parseInt(model.get('debt')), 
          start = model.get('start'),
          end = model.get('end'),
          ref_rate = 0;

      if(debt && start && end){
        if(extraCollection.length != 0)
          extraCollection.each(function(ep) {
            temp_end = ep.get('d');
            extraMoney = ep.get('money');
            if(temp_end && extraMoney){
              extraCollection.sort();
              ref_rate = getRefRate(temp_end); //get ref rate on this date period
              var penalty = (getPenalty(debt, start, temp_end, ref_rate)),
                  result = new app.Result({start_at: dateFormat(start), end_at: dateFormat(temp_end), ref_rate: ref_rate, penalty: penalty});

              results.add([result]); // add result to result collection
              debt -= parseFloat(extraMoney); //new_debt = debt - extraPay
              start = parseInt(temp_end) + 86400000; //new period without start day (in ms)
            }
          });
        // penalty for last period or no extra payments
        end_in_ms = end;
        ref_rate = this.getRefRate(end_in_ms);
        var lastPenalty = (this.getPenalty(debt, start, end, ref_rate)),
            lastInterval = new app.Result({ start_at: this.dateFormat(start), end_at: this.dateFormat(end), ref_rate: ref_rate, penalty: lastPenalty});
        this.results.add([lastInterval]);
      }
    },

    validate: function(attr) {
      if(attr.start > attr.end ){
        return 'wrong date!';
      }
    },

    getRefRate: function(date) {
      var prevD  = 0,
          rr = app.refRatesCollection.models[app.refRatesCollection.length - 1].get('Value');

      var model = (_.find(app.refRatesCollection.models, function(model) {  return model.getMs() >= date }));
      // set refinancing rate if period find
      if (model){
        rr = model.get('Value');
      }
      return rr;
      //return 23.5;
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
})();
