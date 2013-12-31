$(function(){
  app.model = new app.AppModel();
  new app.ApplicationLayout({model: app.model}).render();
  
  $('.numbersOnly').keyup(function () { 
      this.value = this.value.replace(/[^0-9\.]/g,'');
  });
});