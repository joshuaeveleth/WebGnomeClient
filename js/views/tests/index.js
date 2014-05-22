define([
    'jquery',
    'underscore',
    'backbone',
    'qunit',
    'text!templates/tests/index.html',
    'views/tests/spill'
], function($, _, Backbone, qunit, TestTemplate, SpillTests){
    testView = Backbone.View.extend({
        className: 'container page',
        initialize: function(){
            this.render();

            module('GnomeSpill');
            SpillTests.run();
            
            qunit.load();
            qunit.start();
        },
        render: function(){
            $('body').append(this.$el.append(_.template(TestTemplate)));
        }
        
    });

    return testView;
});