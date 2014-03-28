// basic controller to configure and setup the app
define([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'util',
    'rivets',
], function($, _, Backbone, Router, util, rivets) {
    "use strict";
    var app = {
        api: 'http://127.0.0.1:6543',
        initialize: function(){
            // Ask jQuery to add a cache-buster to AJAX requests, so that
            // IE's aggressive caching doesn't break everything.
            $.ajaxSetup({
                cache: false,
            });

            // Filter json requestions to redirect them to the api server
            $.ajaxPrefilter('json', function(options){
                options.url = webgnome.api + options.url;
            });

            // Configure a Rivets adapter to work with Backbone
            // per http://rivetsjs.com/
            rivets.configure({
                adapter: {
                    subscribe: function(obj, keypath, callback) {
                        callback.wrapped = function(m, v) {
                            callback(v);
                        };
                        obj.on('change:' + keypath, callback.wrapped);
                    },
                    unsubscribe: function(obj, keypath, callback) {
                        obj.off('change:' + keypath, callback.wrapped);
                    },
                    read: function(obj, keypath) {
                        return obj.get(keypath);
                    },
                    /*
                     When setting a value, if it's parsable as a float, use a
                     float value instead. This is to support JSON Schema
                     validation of float types.
                     */
                    publish: function(obj, keypath, value) {
                        var floatVal = parseFloat(value);
                        if (!isNaN(floatVal)) {
                            value = floatVal;
                        }
                        obj.set(keypath, value);
                    }
                }
            });
            // Use Django-style templates semantics with Underscore's _.template.
            _.templateSettings = {
                // {{- variable_name }} -- Escapes unsafe output (e.g. user
                // input) for security.
                escape: /\{\{-(.+?)\}\}/g,

                // {{ variable_name }} -- Does not escape output.
                interpolate: /\{\{(.+?)\}\}/g
            };

            Backbone.View.prototype.close = function(){
                this.remove();
                this.unbind();
                if (this.onClose){
                    this.onClose();
                }
            };


            this.router = new Router();
            Backbone.history.start();
        },
        hasModel: function(){
            return false;
        }
    };

    return app;
});