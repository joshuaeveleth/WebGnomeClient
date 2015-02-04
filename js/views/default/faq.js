define([
    'jquery',
    'underscore',
    'backbone',
    'chosen',
    'text!templates/default/faq.html',
    'text!templates/faq/specific.html',
    'text!templates/faq/default.html',
    'model/help/help',
    'collection/help',
    'jqueryui/autocomplete'
], function($, _, Backbone, chosen, FAQTemplate, SpecificTemplate, DefaultTemplate, HelpModel, HelpCollection){
	var faqView = Backbone.View.extend({
        className: 'page faq',

        events: {
            'keyup input': 'update',
            'click .back': 'back',
            'click .topic': 'specificHelp'
        },

        initialize: function(){
            this.seed();
            this.on('ready', this.parseHelp);
            this.fetchQuestions();
        },

        render: function(){
            var subtemplate = _.template(DefaultTemplate, {topics: this.parsedData});
            var compiled = _.template(FAQTemplate, {content: subtemplate});
            $('.faqspace').append(this.$el.append(compiled));
        },

        update: function(e, str){
            var term = this.$('.chosen-select').val();
            if (str){
                term = str;
            }
            this.topicArray = this.collection.search(term);
            var obj = this.getData(this.topicArray);
            var titles = [];
            for (var i in obj){
                titles.push(obj[i].title);
            }
            var autocompleteConfig = {
                                        source: function(req, res){
                                            res(titles);
                                        },
                                        select: _.bind(function(e, ui){
                                            if (!_.isUndefined(e)){
                                                this.update({which: 13}, e.toElement.innerHTML);
                                            }
                                            $('.chosen-select').autocomplete('close');
                                            $('.chosen-select').val(ui.item.value);
                                        }, this)
                                     };

            this.$('#helpquery').autocomplete(autocompleteConfig);

            if (this.exactMatch(term, titles) && e.which === 13){
                this.specificHelp(null, term);
                this.$('.chosen-select').autocomplete('close');
            }

            if (!_.isUndefined(e) && titles.length === 1 && e.which === 13){
                this.$('.chosen-select').val(titles[0]);
                this.specificHelp(null, titles[0]);
                this.$('.chosen-select').autocomplete('close');
            }
            this.trigger('updated');
        },

        exactMatch: function(term, titles){
            for (var i in titles){
                if (term === titles[i]){
                    return true;
                }
            }
            return false;
        },

        seed: function(){
            $('.faqspace').remove();
            $('body').append('<div class="faqspace"></div>');
        },

        getData: function(models){
            var data = [];
            if (_.isUndefined(models)){
                models = this.body.models;
            }
            for (var i in models){
                if (_.isObject(models[i])){
                    var helpTopicBody = $('<div>' + models[i].get('html') + '</div>');
                    var helpTitle = helpTopicBody.find('h1:first').text();
                    helpTopicBody.find('h1:first').remove();
                    var helpContent = helpTopicBody.html();
                    var path = models[i].get('path');
                    var excerpt = models[i].makeExcerpt();
                    var keywords = models[i].get('keywords');
                    if (helpTitle !== ''){
                        data.push({title: helpTitle, content: helpContent, path: path, keywords: keywords, excerpt: excerpt});
                    }
                }
            }
            return data;
        },

        parseHelp: function(){
            this.parsedData = this.getData();
            this.render();
        },

        fetchQuestions: function(){
            this.collection = new HelpCollection();
            this.collection.fetch({
                success: _.bind(function(model){
                    this.body = model;
                    this.trigger('ready');
                }, this)
            });
        },

        specificHelp: function(e, title){
            var data = this.parsedData;
            var target;
            var compiled;
            if (_.isUndefined(e.target.dataset.title)){
                target = this.$(e.target).siblings('h4')[0].dataset.title;
            } else {
                target = e.target.dataset.title;
            }
            for (var i in data){
                if (title === data[i].title || data[i].title === target){
                    compiled = _.template(SpecificTemplate, {title: data[i].title, content: data[i].content, keywords: data[i].keywords });
                    this.$('#support').html('');
                    this.$('#support').append(compiled);
                    break;
                }
            }
        },

        renderContent: function(){
            var subtemplate = _.template(SpecificTemplate, {});
            this.$('.helpcontent').html('');
            this.$('.helpcontent').append(subtemplate);
        },

        back: function(){
            this.restoreDefault();
            this.$('.chosen-select').val('');
        },

        restoreDefault: function(clear){
            var subtemplate = _.template(DefaultTemplate, { topics: this.parsedData });
            this.$('#support').html('');
            this.$('#support').append(subtemplate);
        }
    });

    return faqView;
});