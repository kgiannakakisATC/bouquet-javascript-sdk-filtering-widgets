(function (root, factory) {
    "use strict";
    root.squid_api.view.MySelectionsWidget = factory(root.Backbone, root.squid_api);
}(this, function (Backbone, squid_api) {
    "use strict";
    View = Backbone.View.extend( {

        template : null,

        initialize : function(options) {
            this.config = squid_api.model.config;

            // setup options
            if (options) {
                if (options.template) {
                    this.template = options.template;
                }
                if (options.data) {
                    this.data = options.data;
                }
                if (options.close) {
                    this.close = options.close;
                }
            }
        },

        getSelectionsUrl : function() {
            var projectId = this.config.get("project");
            var bookmarkId = this.config.get("bookmark");

            var selectionsUrl =  squid_api.apiBaseURL + "/rs/projects/" + projectId +
                "/bookmarks/" + bookmarkId + "/myselections";
            return selectionsUrl;
        },

        events : {

            "input #new-selection" : function(event) {
                var name = $(event.target).val();
                $("#create-selection").attr("disabled", name.length === 0);
            },

            "click #create-selection" : function(event) {
                var me = this;
                var projectId = this.config.get("project");
                var bookmarkId = this.config.get("bookmark");

                var name = $("#new-selection").val();
                var newSelection = {
                    id: {
                      projectId: projectId,
                      bookmarkId: bookmarkId
                    },
                    name: name,
                    selection: squid_api.model.config.attributes.selection
                };
                $.ajax({
                    url: this.getSelectionsUrl(),
                    method: "POST",
                    contentType: "text/json",
                    data: JSON.stringify(newSelection),
                    headers: {"Authorization" : "Bearer " + squid_api.model.login.get("accessToken")}
                }).done(function(newSelection) {
                    me.data.selections.push(newSelection);
                    me.render();
                });
            },

            "click .my-selection-name" : function(event) {
                var me = this;
                var projectId = this.config.get("project");
                var bookmarkId = this.config.get("bookmark");
                var myBookmarkSelectionId = $(event.target).parent().data("id");

                var mySelection = $.grep(this.data.selections, function(elem) {
                    return elem.id.myBookmarkSelectionId === myBookmarkSelectionId;}
                )[0].selection;

                console.log(this.data.selections[0]);
                console.log(mySelection);

                squid_api.model.config.attributes.selection = mySelection;

                // get the Bookmark
                // squid_api.getCustomer().then(function(customer) {
                //     customer.get("projects").load(projectId).then(function(project) {
                //         project.get("bookmarks").load(bookmarkId).done(function(bookmark) {
                //             var forcedConfig = {};
                //             var config = me.config.toJSON();
                //             // exclude the selection from re-setting the config
                //             for (var x in config) {
                //                 if (x !== "selection") {
                //                     forcedConfig[x] = config[x];
                //                 }
                //                 else {
                //                     forcedConfig[x] = mySelection.selection;
                //                 }
                //             }
                //             // set bookmark
                //             squid_api.setBookmark(bookmark, forcedConfig);
                //         }).fail(function(model, response, options) {
                //             console.error("bookmark fetch failed : " + bookmarkId);
                //         });
                //     });
                // });

                this.close();
            },

            "click .selection-remove" : function(event) {
                var myBookmarkSelectionId = $(event.target).parent().data("id");

                console.log(myBookmarkSelectionId);
            }
        },

        render : function() {
            this.$el.html(this.template(this.data));
            return this;
        }

    });

    return View;
}));