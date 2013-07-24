(function() {
  goog.provide('ga_geolocation_directive');

  var module = angular.module('ga_geolocation_directive', [
  ]);

  module.directive('gaGeolocation', ['$parse', function($parse) {
    return {
      restrict: 'A',
      scope: {},
      template: '<a href="#geolocation" class="geolocation">',
      replace: true,
      require: '^gaMap',
      link: function(scope, element, attrs, gaMapDirectiveCtrl) {
        var map = gaMapDirectiveCtrl.getMap();
        var view = map.getView().getView2D();
        var geolocation = new ol.Geolocation({
          tracking: true
        });
        geolocation.bindTo('projection', map.getView());
        var tracking = false;
        var first = true;
        var locate = function(dest) {
          if (dest) {
            var source = view.getCenter();
            var dist = Math.sqrt(Math.pow(source[0] - dest[0], 2),
                         Math.pow(source[1] - dest[1], 2));
            var duration = Math.sqrt(500 + dist / view.getResolution() *
                1000);
            var start = +new Date();
            var pan = ol.animation.pan({
              duration: duration,
              source: source,
              start: start
            });
            if (first) {
              var accuracy = geolocation.getAccuracy();
              var extent = [
                dest[0] - accuracy,
                dest[0] + accuracy,
                dest[1] - accuracy,
                dest[1] + accuracy
              ];
              var resolution = view.getResolutionForExtent(extent,
                  map.getSize());
              resolution = view.constrainResolution(resolution, 0, 0);
              var bounce = ol.animation.bounce({
                duration: duration,
                resolution: Math.max(view.getResolution(), dist / 1000,
                    resolution * 1.2),
                start: start
              });
              var zoom = ol.animation.zoom({
                resolution: view.getResolution(),
                duration: duration,
                start: start
              });
              map.addPreRenderFunctions([pan, zoom, bounce]);
              view.setCenter(dest);
              view.setResolution(resolution);
            }
            else {
              var bounce = ol.animation.bounce({
                duration: duration,
                resolution: Math.max(view.getResolution(), dist / 1000),
                start: start
              });
              map.addPreRenderFunctions([pan, bounce]);
              view.setCenter(dest);
            }
          }
        };
        geolocation.on('change:position', function(evt) {
          if (tracking) {
            locate(geolocation.getPosition());
          }
        });
        element.bind('click', function(e) {
          e.preventDefault();
          if (tracking) {
            tracking = false;
            element.removeClass('tracking');
          }
          else {
            element.addClass('tracking');
            first = true;
            locate(geolocation.getPosition());
            tracking = true;
          }
        }
        )}
    };
  }]);
})();


