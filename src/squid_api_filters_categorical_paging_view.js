(function (root, factory) {
    root.squid_api.view.CategoricalPagingView = factory(root.Backbone, root.squid_api);
}(this, function (Backbone, squid_api) {

    var View = Backbone.View.extend({

        model : null,
        format : null,

        initialize : function(options) {
            if (!this.model) {
                this.model = squid_api.model.filters;
            }

            if (options.format) {
                this.format = options.format;
            } else {
                if (d3) {
                    this.format = d3.time.format("%Y-%m-%d");
                } else {
                    this.format = function(val){return val;};
                }
            }

            this.listenTo(this.model, "change:pageIndex", this.render);
            this.listenTo(this.model, "change:facet", this.render);
            this.render();
        },

        events : {
            "click li" : function(event) {
                event.preventDefault();
                event.stopPropagation();
                var pageId = $(event.currentTarget).data("id");
                var pageIndex = this.model.get("pageIndex");
                var nbPages = this.model.get("nbPages");
                var itemIndex = this.model.get("itemIndex");
                var pageSize = this.model.get("pageSize");
                var firstPageIndex = Math.round(itemIndex / pageSize);
                this.itemClicked = "number";
                if (pageId == "prev") {
                    if (pageIndex > (firstPageIndex - nbPages)) {
                        // previous page
                        this.model.set("pageIndex", pageIndex-1);
                    } else {
                        // previous page group
                        this.model.set("pageIndex", firstPageIndex - nbPages);
                    }
                    this.itemClicked = "prev";
                } else if (pageId == "next") {
                    if (pageIndex < (firstPageIndex + nbPages)) {
                        // next page
                        this.model.set("pageIndex", pageIndex+1);
                    } else {
                        // next page group
                        this.model.set("pageIndex", firstPageIndex + nbPages);
                    }
                    this.itemClicked = "next";
                } else {
                    this.model.set("pageIndex", pageId-1);
                }
            }
        },

        render : function() {
            var facet = this.model.get("facet");
            if (facet) {
                var facetItems = facet.get("items");
                var pageIndex = this.model.get("pageIndex");
                var pageSize = this.model.get("pageSize");
                var nbPages = this.model.get("nbPages");
                var itemIndex = this.model.get("itemIndex");

                //Sometimes initial facet jobs continue to be rendered even after page click
                if (pageIndex * pageSize === itemIndex) {
                    var next = false;
                    if (facet.get("hasMore")) {
                        next = true;
                    }

	                var pageCount = Math.min((facetItems.length / pageSize)+(itemIndex/pageSize),10);
	                var firstPageIndex = Math.round(itemIndex / pageSize);
	                if (firstPageIndex>4 && pageCount >= nbPages) {
	                	var offset = 4;
	                	if (facetItems && facetItems.length < 50) {
	                		offset = offset + Math.ceil((50 - facetItems.length) / pageSize);
	                	}
	                	firstPageIndex = firstPageIndex - offset;
	                	if ((facetItems.length + (offset * pageSize))>100 && next === false) {
	                		next = true;
	                	}
	                } else {
	                	firstPageIndex = 0;
	                }
	                
	                var pages = [];
	                if (pageCount>1 || pageIndex>0) {
	                    if (pageCount>nbPages) {
	                        pageCount = nbPages;
	                    }
	                    var prev = (firstPageIndex === 0) ? null : true;
	
	                    if (this.itemClicked === "prev" && (pageIndex + 1) % 2 === 0) {
	                        firstPageIndex = ((firstPageIndex + 1) - (pageSize) >= 0) ?  (firstPageIndex + 1) - pageSize : firstPageIndex;
	                        pageCount = nbPages;
	                        if (firstPageIndex === 0) {
	                            prev = false;
	                        }
	                    }
	                    for (var i=firstPageIndex; i<(firstPageIndex+pageCount); i++) {
	                        var selected = null;
	                        if (i == pageIndex) {
	                            selected = true;
	                        }
	                        pages.push({ "id" : i+1, "selected" :  selected});
	                    }
	
	                    this.$el.html(squid_api.template.squid_api_filters_categorical_paging_view({
	                        "prev" : prev,
	                        "pages" : pages,
	                        "next" : next
	                    }));
	                } else {
	                    this.$el.html("");
	                }
                }
            }
        }
    });

    return View;
}));