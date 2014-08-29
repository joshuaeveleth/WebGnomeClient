define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/menu.html',
    'views/modal/about',
    'views/wizard/new',
    'bootstrap'
 ], function($, _, Backbone, MenuTemplate, AboutModal, NewWizardForm) {
    /*
     `MenuView` handles the drop-down menus on the top of the page. The object
     listens for click events on menu items and fires specialized events, like
     RUN_ITEM_CLICKED, which an `AppView` object listens for.

     Most of these functions exist elsewhere in the application and `AppView`
     calls the appropriate method for whatever functionality the user invoked.
     */

    var menuView = Backbone.View.extend({
        tagName: 'nav',
        className: 'navbar navbar-default',

        initialize: function() {
            this.render();
            this.contextualize();
            if(webgnome.hasModel()){
                webgnome.model.on('sync', this.contextualize, this);
            }
        },

        events: {
            // 'click .navbar-brand': 'home',
            'click .new': 'newModel',
            'click .load': 'load',
            'click .locations': 'locations',
            'click .save': 'save',
            'click a.debugView': 'debugView',

            // 'click .run': 'run',
            // 'click .step': 'step',
            // 'click .rununtil': 'rununtil',

            'click .about': 'about',
            'click .tutorial': 'tutorial',

            'click .gnome': 'gnome',
            'click .adios': 'adios',
            'click .home': 'home',

            'click .app-menu-link': 'openAppMenu',
            'click .app-menu-close': 'closeAppMenu'
        },

        openAppMenu: function(event){
            event.preventDefault();
            this.$('.app-menu').addClass('open');
            this.$('.app-menu-close').addClass('open');
            this.$('.app-menu').focus();
        },

        closeAppMenu: function(){
            this.$('.app-menu').removeClass('open');
            this.$('.app-menu-close').removeClass('open');
        },

        gnome: function(event){
            event.preventDefault();
            webgnome.router.navigate('gnome/', true);
        },

        adios: function(event){
            event.preventDefault();
            webgnome.router.navigate('adios/', true);
        },

        nothing: function(event){
            event.preventDefault();
        },

        home: function(event){
            event.preventDefault();
            webgnome.router.navigate('', true);
        },

        newModel: function(event){
            event.preventDefault();
            webgnome.router.navigate('gnome/', true);
        },

        load: function(event){
            event.preventDefault();
            webgnome.router.navigate('gnome/load', true);
        },

        locations: function(event){
            event.preventDefault();
            webgnome.router.navigate('gnome/locations', true);
        },

        save: function(event){
            event.preventDefault();
            webgnome.router.navigate('gnome/save', true);
        },

        debugView: function(event){
            event.preventDefault();
            var checkbox = this.$('input[type="checkbox"]');
            if (checkbox.prop('checked')) {
                checkbox.prop('checked', false);
            } else {
                checkbox.prop('checked', true);
                //this.trigger('debugTreeOn');
            }
            this.trigger('debugTreeToggle');
        },

        run: function(event){

        },

        step: function(event){

        },

        rununtil: function(event){

        },

        about: function(event){
            event.preventDefault();
            new AboutModal().render();
        },

        tutorial: function(event){

        },

        enableMenuItem: function(item){
            this.$el.find('.' + item).show();
        },

        disableMenuItem: function(item){
            this.$el.find('.' + item).hide();
        },

        contextualize: function(){
            if(window.location.href.indexOf('gnome') !== -1){
                // setup the menu for gnome
                if(webgnome.hasModel() && webgnome.validModel()){
                    this.enableMenuItem('actions');
                    this.disableMenuItem('save');
                }
                this.$('.navbar-brand').text('WebGNOME');
            } else {
                this.disableMenuItem('model');
                this.disableMenuItem('actions');
                this.disableMenuItem('save');
            }

            if (window.location.href.indexOf('adios') !== -1){
                // setup the menu for adios  
                this.$('.navbar-brand').text('WebADIOS');
            }


        },

        render: function(){
            var compiled = _.template(MenuTemplate);
            $('body').append(this.$el.html(compiled));
            this.$('a').tooltip({
                placement: 'right',
                container: 'body'
            });
        }
    });

    return menuView;
});