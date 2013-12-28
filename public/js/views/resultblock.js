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