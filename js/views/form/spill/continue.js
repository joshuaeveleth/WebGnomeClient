define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/spill/base',
    'text!templates/form/spill/continue.html',
    'model/spill',
    'views/form/oil/library',
    'views/default/map',
    'geolib',
    'jqueryDatetimepicker',
    'jqueryui/slider',
    'moment'
], function($, _, Backbone, BaseSpillForm, FormTemplate, SpillModel, OilLibraryView, SpillMapView, geolib){
    var continueSpillForm = BaseSpillForm.extend({
        title: 'Continuous Release',
        className: 'modal fade form-modal continuespill-form',

        initialize: function(options, spillModel){
            BaseSpillForm.prototype.initialize.call(this, options, spillModel);
            this.model = spillModel;
        },

        render: function(options){
            var startPosition = this.model.get('release').get('start_position');

            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                amount: this.model.get('amount'),
                time: _.isNull(this.model.get('release').get('release_time')) ? moment().format('YYYY/M/D H:mm') : moment(this.model.get('release').get('release_time')).format('YYYY/M/D H:mm'),
                duration: this.parseDuration(this.model.get('release').get('release_time'), this.model.get('release').get('end_release_time')),
                coords: {'lat': startPosition[1], 'lon': startPosition[0]}
            });
            BaseSpillForm.prototype.render.call(this, options);

            this.$('#amount .slider').slider({
                min: 0,
                max: 5,
                value: 0,
                create: _.bind(function(){
                    this.$('#amount .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + this.model.get('amount') + '</div></div>');
                }, this),
                slide: _.bind(function(e, ui){
                    this.updateAmountSlide(ui);
                }, this)
            });

            this.$('#constant .slider').slider({
                min: 0,
                max: 5,
                value: 0,
                create: _.bind(function(){
                    this.$('#constant .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + this.model.get('rate') + '</div></div>');
                }, this),
                slide: _.bind(function(e, ui){
                    this.updateRateSlide(ui);
                }, this)
            });
        },

        update: function(){
            var name = this.$('#name').val();
            this.model.set('name', name);
            if (name === 'Spill'){
                var spillsArray = webgnome.model.get('spills').models;
                for (var i = 0; i < spillsArray.length; i++){
                    if (spillsArray[i].get('id') === this.model.get('id')){
                        var nameStr = 'Spill #' + (i + 1);
                        this.model.set('name', nameStr);
                        break;
                    }
                }
            }
            var amount = parseInt(this.$('#spill-amount').val(), 10);
            this.rate = this.$('#spill-rate').val();
            var release = this.model.get('release');
            var units = this.$('#units').val();
            var releaseTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');
            var days = this.$('#days').val().trim();
            var hours = this.$('#hours').val().trim();
            var latitude = this.$('#latitude').val() ? this.$('#latitude').val() : '';
            var longitude = this.$('#longitude').val() ? this.$('#longitude').val() : '';

            if (days === '') {
                days = 0;
            }

            if (hours === '') {
                hours = 0;
            }

            if (latitude.indexOf('°') !== -1 || $.trim(latitude).indexOf(' ') !== -1){
                latitude = geolib.sexagesimal2decimal(latitude);
            }

            if (longitude.indexOf('°') !== -1 || $.trim(longitude).indexOf(' ') !== -1){
                longitude = geolib.sexagesimal2decimal(longitude);
            }
            
            if (!_.isUndefined(this.spillCoords)){
                this.$('#latitude').val(this.spillCoords.lat);
                this.$('#longitude').val(this.spillCoords.lon);
                latitude = this.spillCoords.lat;
                longitude = this.spillCoords.lon;
            }

            var start_position = [parseFloat(longitude), parseFloat(latitude), 0];
            var duration = (((parseInt(days, 10) * 24) + parseInt(hours, 10)) * 60) * 60;
            release.set('start_position', start_position);
            this.model.set('name', name);
            this.model.set('units', units);
            this.model.set('amount', amount);
            release.set('release_time', releaseTime.format('YYYY-MM-DDTHH:mm:ss'));
            release.set('end_release_time', releaseTime.add(duration, 's').format('YYYY-MM-DDTHH:mm:ss'));
            this.model.set('release', release);
            BaseSpillForm.prototype.update.call(this);
            this.updateAmountSlide();
            this.updateRateSlide();
        },

        parseDuration: function(start, end){
            var duration = (moment(end).unix() - moment(start).unix()) * 1000;
            var days = 0;
            var hours = 0;
            if (!_.isUndefined(duration)){
                hours = moment.duration(duration).asHours();
                if (hours >= 24){
                    days = parseInt(moment.duration(duration).asDays(), 10);
                }
                hours = hours - (days * 24);
            }
            return {'days': days, 'hours': hours};
        },

        updateAmountSlide: function(ui){
            var value;
            if(!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = this.$('#amount .slider').slider('value');
            }
            if(this.model.get('amount') !== 0){
                var amount = this.model.get('amount');
                if(value === 0){
                    this.$('.active .tooltip-inner').text(amount);
                } else {
                    var bottom = amount - value;
                    if (bottom < 0) {
                        bottom = 0;
                    }
                    var top = parseInt(amount, 10) + parseInt(value, 10);
                    this.$('.tooltip-inner').text(bottom + ' - ' + top);
                }
            }
            
        },

        updateRateSlide: function(ui){
            var value;
            if(!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = this.$('#constant .slider').slider('value');
            }
            if(this.rate){
                var amount = this.rate;
                if(value === 0){
                    this.$('.active .tooltip-inner').text(amount);
                } else {
                    var bottom = amount - value;
                    if (bottom < 0) {
                        bottom = 0;
                    }
                    var top = parseInt(amount, 10) + parseInt(value, 10);
                    this.$('.tooltip-inner').text(bottom + ' - ' + top);
                }
            }
        }

    });

    return continueSpillForm;
});