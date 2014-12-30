define([
    'underscore',
    'backbone',
    'model/base',
    'model/initializers/windages',
    'model/substance'
], function(_, Backbone, BaseModel, GnomeWindages, GnomeSubstance){
    var gnomeElement = BaseModel.extend({
        url: '/element_type',

        model: {
            substance: GnomeSubstance
        },

        defaults: {
            'json_': 'webapi',
            'obj_type': 'gnome.spill.elements.ElementType',
            'substance': null,
            'initializers': [
                {
                    'windage_range': [
                         0.01,
                         0.04
                    ],
                    'obj_type': 'gnome.spill.elements.InitWindages',
                    'windage_persist': 900
                }
            ]
        },

        validate: function(){
            
        },

        toTree: function(){
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var attrs = [];
            var name = this.get('name');

            attrs.push({title: 'Name: ' + name, key: 'Name', obj_type: this.get('name'), action: 'edit', object: this});

            tree = attrs.concat(tree);

            return tree;
        }
    });

    return gnomeElement;
    
});