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
            'name': 'Spill',
            'amount': 0,
            'units': 'bbl'
        },

        model: {
            release: GnomeRelease,
            element_type: GnomeElement
        },

        validate: function(attrs, options){
            if(!attrs.release.isValid()){
                this.validationContext = 'map';
                return attrs.release.validationError;
            }

            if (!attrs.element_type.isValid()){
                this.validationContext = 'substance';
                return attrs.element_type.validationError;
            }

            if ($.trim(attrs.name) === ''){
                this.validationContext = 'spill';
                return 'A spill name is required!';
            }

            if(isNaN(attrs.amount)){
                this.validationContext = '';
                return 'Amount must be a number';
            } else if (attrs.amount < 0) {
                return 'Amount must be a positive number';
            }

        },

        validateSubstance: function(attrs){
            if(_.isUndefined(attrs.element_type.get('substance').get('name'))){
                return 'A substance must be selected!';
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