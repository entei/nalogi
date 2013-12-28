var app = app || {};
(function() {
  app.ApplicationLayout = Backbone.View.extend({
    initialize: function() {
      // создать вьюхи для this.model, this.model.extraPayments, this.model.results
      // и зааппендить их в нужные дивки
      _.bindAll(this, 'render');
      this.appView = new app.AppView({model: this.model, el: '#details'});
      this.extraBlockView = new app.ExtraBlockView({ model: this.model , el: '.extra'});
      this.resultBlockView = new app.ResultBlockView({ model: this.model, el: '#result'});
     },

    render: function() {
      this.appView.render();
      this.extraBlockView.render();
    }
  });  
})();
