var app = app || {};
(function() {
  // 1 interval(result)
  app.ResultView = Backbone.View.extend({
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
})();
