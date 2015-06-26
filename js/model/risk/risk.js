define([
    'underscore',
    'backbone',
    'moment',
], function(_, Backbone, moment){
    var risk = Backbone.Model.extend({
        url: '/',

        defaults: {
            'area': 0,
            'diameter': 0,
            'distance': 0,
            'depth': 0,
            'assessment_time': 0,

            efficiency: {
                'skimming': 100,
                'dispersant': 100,
                'insitu_burn': 100
            },

            'surface': 1/3,
            'column': 1/3,
            'shoreline': 1/3,

            relativeImportance: {
                'surface': 1/3,
                'column': 1/3,
                'shoreline': 1/3
            },

            units: {
                'area': 'sq. km',
                'diameter': 'km',
                'distance': 'km',
                'depth': 'm'
            }
        },

        initialize: function(options){
            this.fetch();
            this.on('change', this.save, this);
            var a = this.attributes;

            if (!_.isUndefined(webgnome.model)){
                if (a.assessment_time == 0) {
                    a.assessment_time = webgnome.model.get('start_time');
                }

                // initialize efficiency to response values
                var e = a.efficiency;
                _.each(webgnome.model.get('weatherers').models, function(el, idx){
                    if (el.attributes.obj_type === "gnome.weatherers.cleanup.Dispersion") {
                        if (el.attributes.name != "_natural") {
                            if (!_.isUndefined(el.attributes.efficiency)){
                                e.disperant = el.attributes.efficiency * 100;
                            }
                        }
                    } else if (el.attributes.obj_type === "gnome.weatherers.cleanup.Burn") {
                        if (!_.isUndefined(el.attributes.efficiency)){
                            e.insitu_burn = el.attributes.efficiency * 100;
                        }
                    } else if (el.attributes.obj_type === "gnome.weatherers.cleanup.Skimmer") {
                        if (!_.isUndefined(el.attributes.efficiency)){
                            e.skimming = el.attributes.efficiency * 100;
                        }
                    }
                });
            } else {
                a.assessment_time = moment().format('YYYY-MM-DDTHH:mm:ss');
            }
        },

        convertAreaToSquareMeters: function(){
            var a = this.get('area');
            var u = this.get('units').area;

            if (u === 'sq. km') {
                a = a * 1000 * 1000;
            } else if (u === 'sq. miles') {
                a = a * 2.59 * 1000 * 1000;
            } else if (u === 'hectares') {
                a = a * 10000;
            } else if (u === 'acres') {
                a = a * 4046.86;
            }
            return a;
        },

        convertDiameterToMeters: function(){
            var a = this.get('diameter');
            var u = this.get('units').diameter;

            if (u === 'km') {
                a = a * 1000;
            } else if (u === 'miles') {
                a = a * 2.59 * 1000;
            }
            return a;
        },

        convertDistanceToMeters: function(){
            var a = this.get('distance');
            var u = this.get('units').distance;

            if (u === 'km') {
                a = a * 1000;
            } else if (u === 'miles') {
                a = a * 2.59 * 1000;
            }
            return a;
        },

        convertDepthToMeters: function(){
            var a = this.get('depth');
            var u = this.get('units').depth;

            if (u === 'ft') {
                a = a * 0.3048;
            } else if (u === 'yards') {
                a = a * 0.9144;
            }
            return a;
        },

        getMasses: function(frame){
            var massSW = 0;
            var massSH = 0;
            var percentWC = 0;
            var amount_released = 0;
            _.each(webgnome.mass_balance, function(mass, idx) {
                data = mass.data[frame];
                if (mass.name.toUpperCase() === 'FLOATING') {
                    massSW = data[1];
                }
                else if (mass.name.toUpperCase() === 'EVAPORATED') {
                }
                else if (mass.name.toUpperCase() === 'DISPERSED') {
                }
                else if (mass.name.toUpperCase() === 'BEACHED') {
                    massSH = data[1];
                }
                else if (mass.name.toUpperCase() === 'AVG_DENSITY') {
                }
                else if (mass.name.toUpperCase() === 'BURNED') {
                }
                else if (mass.name.toUpperCase() === 'AVG_VISCOSITY') {
                }
                else if (mass.name.toUpperCase() === 'WATER_CONTENT') {
                    percentWC = data[1];
                }
                else if (mass.name.toUpperCase() === 'AMOUNT_RELEASED') {
                    amount_released = data[1];
                }
            });
            var massWC = amount_released * percentWC / 100;

            return [massSW, massSH, massWC];
        },

        assessment: function(){
            var area = this.convertAreaToSquareMeters();
            var diameter = this.convertDiameterToMeters();
            var distance = this.convertDistanceToMeters();
            var depth = this.convertDepthToMeters();

            // calculate what time step this is
            var startTime = moment(webgnome.model.get('start_time'), 'YYYY-MM-DDTHH:mm:ss').unix();
            var timeStep = webgnome.model.get('time_step');
            var assessmentTime = moment(this.get('assessment_time'), 'YYYY-MM-DDTHH:mm:ss').unix();
            var frame = Math.floor((assessmentTime - startTime) / timeStep);

            var masses = this.getMasses(frame);

            var MASSwc = masses[2];
            var LOCwc = 0.001;
            var VOLCwc = MASSwc / LOCwc;
            var FCwc = VOLCwc / (area * depth);

            var MASSsw = masses[0];
            var LOCsw = 0.01;
            var AREACsw = MASSsw / LOCsw;
            var FCsw = AREACsw / area;

            var MASSsh = masses[1];
            var LOCsh = 0.5;
            var LCsh = MASSsh / LOCsh;
            var Lsh = Math.PI * diameter;
            var FCsh = LCsh / Lsh;

            this.set('column', FCwc);
            this.set('surface', FCsw);
            this.set('shoreline', FCsh);
        },

        validate: function(attrs, options){
            if (attrs.area < 1 || attrs.area === ''){
                return 'Water area must be greater than zero!';
            }
            if (attrs.diameter < 1 || attrs.diameter === ''){
                return 'Water diameter must be greater than zero!';
            }
            if (attrs.distance < 1 || attrs.distance === ''){
                return 'Distance from shore must be greater than zero!';
            }
            if (attrs.depth < 1 || attrs.depth === ''){
                return 'Average water depth must be greater than zero!';
            }
            var st = moment(webgnome.model.get('start_time'));
            var et = moment(webgnome.model.get('start_time')).add(webgnome.model.get('duration'), 's');
            var at = moment(attrs.assessment_time);
            if (at < st || at > et) {
                return 'Assessment time must occur during the model time range!';
            }
        },

        // OVERRIDES for local storage of model
        fetch: function() {
            this.set(JSON.parse(localStorage.getItem(this.id)));
        },

        save: function(attributes) {
            localStorage.setItem(this.id, JSON.stringify(this.toJSON()));
        },

        destroy: function(options) {
            localStorage.removeItem(this.id);
        }

    });

    return risk;
    
});
