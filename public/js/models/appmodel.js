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
      this.bind('change', this.recalculate);
      this.extraCollection.bind('change', this.recalculate, this);
    },

    recalculate: function() {
      var model = this;
      var getPenalty = this.getPenalty,
          dateFormat = this.dateFormat,
          getRefRate = this.getRefRate,
          results = this.results;

      //need add info to result collection
      var debt = model.get('debt'), 
          start = model.get('start'),
          end = model.get('end'),
          ref_rate = 0;

      if(this.extraCollection.length != 0)
        this.extraCollection.each(function(ep) {
          temp_end = ep.get('d');
          extraMoney = ep.get('money');


          ref_rate = getRefRate(temp_end); //get ref rate on this date period
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

      alert((start));
      var lastPenalty = (this.getPenalty(debt, start, end, ref_rate)),
          //lastInterval = new Result({ start_at: this.dateFormat(start), end_at: this.dateFormat(end), ref_rate: ref_rate, penalty: lastPenalty});
          lastInterval = new Result({ start_at: (start), end_at: (end), ref_rate: ref_rate, penalty: lastPenalty});
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
      //wrong date format
      var d = new Date(date);
      return ( d.getMonth() + 1 +  "/" + d.getDate() + "/" + d.getFullYear());
    }
  });