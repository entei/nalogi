$(function(){
  console.log('app start');
  var model = new app.AppModel();
  new app.ApplicationLayout({model: model}).render();
  
  $('.numbersOnly').keyup(function () { 
      this.value = this.value.replace(/[^0-9\.]/g,'');
  });
});