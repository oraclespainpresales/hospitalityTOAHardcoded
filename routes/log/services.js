/*
 * GET index page.
 */
exports.index = function(req, res){
  res.render('log/index', {title: 'Outbound Send Message'});
};
