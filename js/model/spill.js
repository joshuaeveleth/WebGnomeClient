define([
    'underscore',
    'backbone',
    'model/base',
    'model/release',
    'model/element'
], function(_, Backbone, BaseModel, GnomeRelease, GnomeElement){
    var gnomeSpill = BaseModel.extend({
        urlRoot: '/spill/',

        defaults: {
            'on': true,
            'obj_type': 'gnome.spill.spill.Spill',
            'release': null,
            'element_type': null,
            'name': 'Spill'
        },

        model: {
            release: GnomeRelease,
            element_type: GnomeElement
        },

        validate: function(attrs, options){
            if(!attrs.release.isValid()){
                return attrs.release.validationError;
            }

            if(!attrs.element_type.isValid()){
                return attr.element_type.validationError;
            }
        },

        toTree: function(){
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var attrs = [];
            var on = this.get('on');
            var name = this.get('name');

            attrs.push({title: 'Spill Name: ' + name, key: 'Spill Name',
                         obj_type: this.get('name'), action: 'edit', object: this});
            attrs.push({title: 'On: ' + on, key: 'On', obj_type: this.get('on'), action: 'edit', object: this});

            tree = attrs.concat(tree);

            return tree;           
        }
    });

    return gnomeSpill;
    
});