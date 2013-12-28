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