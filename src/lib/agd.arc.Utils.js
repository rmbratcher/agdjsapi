
/**
 * @class agd.Utilities
 *
 */
agd.Utilities = agd.Class({

	/**
	 * @function initialize
	 */
    initialize: function(){

	/** @property {String} baseUrl */
	this.baseUrl = 'http://' + window.location.hostname;
	//symbols created from json
	this.symbols = {};
	//the query definitions from json
	this.queryDefs = [];
	//the queries we've make from them
	this.Queries = [];

	this.findDefs = [];

	this.FindTasks = [];

	this.RemoveNamePrefix = true;

	this.identifyDefs = [];

	this.identifyTasks = [];

	this.identifyParams = [];

	this.activeIdentify = null;

	this.layerDefs = [];
	//the tool from the tool bar that is active
	this.activeTool = "";
	//the graphic currently being used for some purpose
	this.currentGraphic = null;
	//a place to hold returned results from the server
	this.currentFeatures = [];

	/** an object for storing results from queries etc */
	this.featureCache = {};

    this.currentIdentifyGeom = [];

	this.widgets = {};

	this.toolTarget = null;

	this.toolTemplate = null;

	this.drawToolbar = null;

	this.methodRe = new RegExp("(#[a-z]+#)");

	this.lastClick = null;

	this.tools = [];

	/** @description Object to hold user defined functions */
	this.userFunctions = {};

    },

    /**
	 * @function addUserFunction
     * @description Add a function that can be called from inside the agd scope and can be added
     * via # symbol to a conf template to be called when the template is evaluated
     *
     * @param {String} name of the function you would like to add so you can find it later
     * @param {Function} fn the function
     *
     */
    addUserFunction: function(name,fn) {
	this.userFunctions[name] = fn;
    },

	/**
	 * @function setIdentify
	 */
    setIdentify: function(val) {
        agd.Utils.activeIdentify = val;
    },

	/**
	 * @function setTarget
	 */
    setTarget: function(val) {
      agd.Utils.toolTarget = val;
    },

	/**
	 * @function setTemplate
	 */
    setTemplate: function(val) {
        agd.Utils.toolTemplate = val;
    },

	/**
	 * @function CreateSymbols
	 * @description Create symbols from json.
	 */
    CreateSymbols: function (obj) {
        var self, symbolDefs;
        self = this;

        symbolDefs = obj.mapConfig.Symbols;

        for(var i = 0; i < symbolDefs.length; i += 1) {
            var symbolDef = symbolDefs[i];
            self.symbols[symbolDef.name] = esri.symbol.fromJson(symbolDef.style);
        }
    },

    /**
     * @function CreateMap
     *
     * @description Create Map from json
     *
     * Parameters:
     * @param {Object} obj  configuration object from conf.json
     */
    CreateMap: function(obj) {
        var etnt, popup, popupOptions, mapOptions;

        //config.defaults.geometryService = new GeometryService("http://ags2.atlasgeodata.com/arcgis/rest/services/Utilities/Geometry/GeometryServer");

        etnt = new esri.geometry.Extent(obj.mapConfig.Extent);

        //define custom popup options
        popupOptions = {
          'markerSymbol': new esri.symbol.SimpleMarkerSymbol('circle', 32, null, new dojo.Color([0, 0, 0, 0.25])),
          'marginLeft': '20',
          'marginTop': '20'
        };

        popup = new esri.dijit.Popup(popupOptions, dojo.create("div"));

        mapOptions = {
            extent: etnt,
            infoWindow: popup,
            logo: false
       };

        map = new esri.Map('map',mapOptions);

       /**
	    * @function getScale
        * @description Add a method getScale to the esri.Map object to make calculating map scale easier
        *
        */
       esri.Map.prototype.getScale = function() {
		  try {
			var maxX = this.extent.xmax;
			var minX = this.extent.xmin;
			var maxY = this.extent.ymax;
			var minY = this.extent.ymin;
			var dpi = 96;
			var imageWidth = this.width;
			var imageHeight = this.height;
			var centerX = maxX - (maxX - minX) / 2;
			var centerY = maxY - (maxY - minY) / 2;
			var dpm = dpi / 2.54 * 100;
			var width = (imageWidth / 2) / dpm;
			var scale = (maxX - centerX) / width;
			return scale;
		} catch (err){ return 0.0;}
       };
	   /**
	    * @function getCenter
	    * @description Add a method to the esri.Map object to get the X,Y center of the map
	    *
	    */
	   esri.Map.prototype.getCenter = function() {
			var maxX = this.extent.xmax;
			var minX = this.extent.xmin;
			var maxY = this.extent.ymax;
			var minY = this.extent.ymin;
			var centerX = maxX - (maxX - minX) / 2;
			var centerY = maxY - (maxY - minY) / 2;

			return new esri.geometry.Point(centerX, centerY, this.spatialReference);
	   };

	   /**
	    * @function ContainsPoint
	    *
	    * @description Add a method to the esri.Map object to query the bounds of the map for intersecting point
	    *
	    * Parameters:
	    * @param pnt {Object} (esri.geometry.Point) Point to query
	    */
	   esri.Map.prototype.ContainsPoint = function(pnt) {
			if(pnt.x > this._mapParams.extent.xmin && pnt.x < this._mapParams.extent.xmax && pnt.y > this._mapParams.extent.ymin && pnt.y < this._mapParams.extent.ymax) {
				return true;
			} else {
				return false;
			}
	   };
    },

    /**
	 * @function CreateLayers
	 * @description Create Layers from json
	 *
	 * @param {Object} obj  json object
	 */
    CreateLayers: function(obj) {
        var i, lyrDef, lyr,layer1, resourceInfo, self, layers = [];
        self = this;

        for (i = 0; i < obj.mapConfig.layers.length; i += 1) {

            lyrDef = obj.mapConfig.layers[i];

            if(lyrDef.type == "ArcGISImageServiceLayer") {
                
                lyr = new esri.layers.ArcGISImageServiceLayer(lyrDef.url);
            }
            if (lyrDef.type == "ArcGISDynamicMapServiceLayer") {
                lyr = new esri.layers.ArcGISDynamicMapServiceLayer(lyrDef.url);

            }
            if(lyrDef.type == "ArcGISTiledMapServiceLayer") {
                lyr = new esri.layers.ArcGISTiledMapServiceLayer(lyrDef.url);
            }
            if(lyrDef.type == "WMS") {
                layer1 = new esri.layers.WMSLayerInfo({name:lyrDef.layers[0],title:lyrDef.layers[0]});
                resourceInfo = {
                    extent : new esri.geometry.Extent(lyrDef.extent),
                    layerInfos: [layer1]
                };
                lyr = new esri.layers.WMSLayer(lyrDef.url, {resourceInfo: resourceInfo, visableLayers: [lyrDef.layers[0]]});
                lyr.setVisibleLayers([0]);
                lyr.setImageFormat("jpg");
                lyr.hide();
            }

			if(lyrDef.type == "Bing") {
				lyr = new esri.virtualearth.VETiledLayer({
				  bingMapsKey: lyrDef.bingKey,
				  mapStyle: esri.virtualearth.VETiledLayer.MAP_STYLE_AERIAL
				});
			}

			if(lyrDef.type == "Google") {
				lyr = new agsjs.layers.GoogleMapsLayer({
                //id: 'google', // optional. esri layer id.
                 apiOptions: { // load google API should be loaded.
                // v: '3.6' // API version. use a specific version is recommended for production system.
                // client: gme-myclientID // for enterprise accounts;
                 libraries:'weather,panoramio'
                 }//,
                //mapOptions: {  // options passed to google.maps.Map contrustor
                // streetViewControl: false // whether to display street view control. Default is true.
                //}
              });
			}

			if(lyrDef.visible) {
				lyr.visible = true;
			} else {
				lyr.visible = false;
			}

            //TODO:  add TMS and maybe one or two more layer types..

            // If a layer's toggle property is set to true add a floating button to toggle the layer on and off.
            if (lyrDef.toggle) {

                var buttonID = "layerToggle-" + i;
                var txt = lyr.visible ? " - hide" : " - show";

                var button = null;
                var dialog = null;
                var slider = null;

                if(lyrDef.transbtn) {
                    slider = new dijit.form.HorizontalSlider({
                        id: "Slider-" + i,
                        name: "Slider-" + i,
                        title: "Transparancy",
                        value: 1,
                        minimum: 0,
                        maximum: 1,
                        descreteValues: 5,
                        intermediateChanges: true,
                        style: "width: 300px;",
                        onChange: function(value){
                            var id = this.id.replace("Slider-","");
                            var layer = map.getLayer(map.layerIds[id]);
                            layer.setOpacity(value);
                        }
                    });

                    dialog = new dijit.TooltipDialog({
                        content: slider
                    });

                    button = new dijit.form.ComboButton({
                        id: buttonID,
                        label: lyrDef.name,// + txt,
                        dropDown: dialog,
                        onClick: function(){
                            var id = this.id.replace('layerToggle-','');
							var did = this.id + "_label";
                            var layer = map.getLayer(map.layerIds[id]);
                            if (layer.visible) {
                                layer.hide();
                                //this.setLabel(this.label.replace('- hide','- show'));
								dojo.style(did,'backgroundColor','#FFFFFF');
                            } else {
                                layer.show();
                                //this.setLabel(this.label.replace('- show','- hide'));
								dojo.style(did,'backgroundColor','#CCFFFF');
                            }
                        }
                    });
                }
                else {
                    button = new dijit.ToggleButton({
                        id: buttonID,
                        checked:lyr.visible,
                        label: lyrDef.name + txt,
                        onChange: function(val){
                            var id = this.id.replace('layerToggle-','');
                            var layer = map.getLayer(map.layerIds[id]);
                            if (layer.visible) {
                                layer.hide();
                                this.textContent = this.textContent.replace('- hide','- show');
                            } else {
                                layer.show();
                                this.textContent = this.textContent.replace('- show','- hide');
                            }
                        }
                    });
                }

                button.placeAt(dojo.byId('toggleButtonContainer'));

            }


            //Add the layer Definition to the collection
            self.layerDefs[i] = lyrDef;
            //Set it's layer property to the newly created layer.
            self.layerDefs[i].layer = lyr;


            layers[i] = lyr

            }

            return layers;
    },

    /**
	 * @function CreateTOC
	 * @description Create the Table of Contents from our map layers and json.
	 *
	 */
    CreateTOC: function() {
        var toc, layerinfos, i, self;

        self = this;
        layerinfos = [];

        for(i = 0; i < self.layerDefs.length; i += 1) {
            if (self.layerDefs[i].type == 'ArcGISDynamicMapServiceLayer' && self.layerDefs[i].toggle == false) {
                layerinfos[layerinfos.length] = {
                    layer: self.layerDefs[i].layer, 
                    title: self.layerDefs[i].name, 
                    autoToggle: false
                };
            }
        }

        var toc = new agd.dijit.TOC({
            map: map,
            layerInfos: layerinfos,
            style: 'inline'
        }, 'tocDiv');

        toc.startup();

        //use the example below to programatically set visable layers.
        //dynamicMapServiceLayer.setVisibleLayers([0,1,2,3,4,5,6,7,8]);
    },

	/**
	 * @function CreateHyperLink
	 *
	 * @param {Object} obj  json object
	 */
	CreateHyperLink: function (obj) {
        var ident, identDef, self, idx;

        self = agd.Utils;

        identDef = obj[0];

		//self.widgets.Identify = new agd.Widgets.Identify(identDef);

        idx = self.identifyDefs.length;

        self.identifyDefs.push(identDef);

        self.identifyTasks.push(new esri.tasks.IdentifyTask(identDef.url));

        self.identifyParams.push(new esri.tasks.IdentifyParameters());
        self.identifyParams[idx].layerIds = identDef.layerIds;
        self.identifyParams[idx].returnGeometry = true;
        self.identifyParams[idx].spatialReference = map.spatialReference;
        self.identifyParams[idx].tolerance = identDef.tolerance;
        self.identifyParams[idx].layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;

        return idx;
    },

	/**
	 * @function CreateIdentify
	 *
	 * @param {Object} obj  json object
	 */
    CreateIdentify: function (obj) {
        var ident, identDef, self, idx;

        self = agd.Utils;

        identDef = obj[0];

		self.widgets.Identify = new agd.Widgets.Identify(identDef);

		/*

        idx = self.identifyDefs.length;

        self.identifyDefs.push(identDef);

        self.identifyTasks.push(new esri.tasks.IdentifyTask(identDef.url));

        self.identifyParams.push(new esri.tasks.IdentifyParameters());
        self.identifyParams[idx].layerIds = identDef.layerIds;
        self.identifyParams[idx].returnGeometry = true;
        self.identifyParams[idx].spatialReference = map.spatialReference;
        self.identifyParams[idx].tolerance = identDef.tolerance;
        self.identifyParams[idx].layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;

        return idx;
		*/
    },

    /**
	 * @function CreateQueries
	 * @description Create Queries from json
	 * @param {Object} obj  json object
	 */
    CreateQueries: function (obj) {
        //define queries as array
        var self, queries = [];

        self = this;




        //define queryDefs as Queries object from conf.json
        self.queryDefs = obj.mapConfig.Queries;

        for (var i = 0; i < self.queryDefs.length; i += 1) {
            var queryDef, queryTask, searchTabs, queryHtml, idPrefix;
            //get queryDef item number " i "
            queryDef = self.queryDefs[i];

			idPrefix = i.toString();

			searchTabs = dijit.byId("searchTabs");
			queryHtml = '<label for="#SearchBoxId">#SearchBoxLabel:</label><input id="#SearchBoxId" data-dojo-type="dijit.form.TextBox" /> <button id="#SearchButtonId" data-dojo-type="dijit.form.Button" type="button">Search</button><button id="#ClearButtonId" data-dojo-type="dijit.form.Button" type="button">Clear</button><div id="#SearchResultsId" style="width: 300px;"></div>'

			queryHtml=queryHtml.replace("#SearchBoxId",idPrefix + 'SearchBox');
			queryHtml=queryHtml.replace("#SearchBoxId",idPrefix + 'SearchBox');
			queryHtml=queryHtml.replace("#SearchBoxLabel",queryDef.searchBoxLable);
			queryHtml=queryHtml.replace("#SearchResultsId",idPrefix + 'SearchResults');
			queryHtml=queryHtml.replace("#SearchButtonId",idPrefix + 'SearchButton');
			queryHtml=queryHtml.replace("#ClearButtonId",idPrefix + 'ClearButton');

			self.queryDefs[i].resultId = idPrefix + 'SearchResults';
			self.queryDefs[i].inputId = idPrefix + 'SearchBox';



			searchTabs.addChild(new dijit.layout.ContentPane({
				title: queryDef.label,
				content: queryHtml,
				style: "overflow: scroll;"
			}));

            if(queryDef.type == "QueryTask") {
                queryTask = new esri.tasks.QueryTask(queryDef.url);
                if (queryDef.inputId != "") {
                    if (queryDef.buttonId != "") {
                        // get a reference to the button defined in conf.json as belonging to current query
                        var btn = document.getElementById(idPrefix + 'SearchButton');
                        btn.setAttribute('onclick', "agd.Utils.ButtonClickDoQuery(" + i + ");");

						var btn2 = document.getElementById(idPrefix + 'ClearButton');
						btn2.setAttribute('onclick',"agd.Utils.ClearInputs('" + idPrefix + "SearchResults','" + idPrefix + "SearchBox');");

						dojo.connect(dijit.byId(idPrefix + 'SearchBox'),'onKeyUp',function(e){
							if(e.keyCode == 13){
								var idPrefix = this.id.replace(/[a-z]+/gi, '');
								agd.Utils.ButtonClickDoQuery(idPrefix);
							}
						})
                    }
                }
            } else if (queryDef.type == "FindTask") {
				
				queryTask = new esri.tasks.FindTask(queryDef.url);
				if (queryDef.inputId != "") {
                    if (queryDef.buttonId != "") {
                        // get a reference to the button defined in conf.json as belonging to current query
                        var btn = document.getElementById(idPrefix + 'SearchButton');
                        btn.setAttribute('onclick', "agd.Utils.ButtonClickDoQuery(" + i + ");");

						var btn2 = document.getElementById(idPrefix + 'ClearButton');
						btn2.setAttribute('onclick',"agd.Utils.ClearInputs('" + idPrefix + "SearchResults','" + idPrefix + "SearchBox');");

						dojo.connect(dijit.byId(idPrefix + 'SearchBox'),'onKeyUp',function(e){
							if(e.keyCode == 13){
								var idPrefix = this.id.replace(/[a-z]+/gi, '');
								agd.Utils.ButtonClickDoQuery(idPrefix);
							}
						});
                    }
				}
			} else if (queryDef.type == "GeocodeTask") {
				

				queryTask = new esri.tasks.Locator(queryDef.url);
				if (queryDef.inputId != "") {
					if(queryDef.buttonId != "") {
                       // get a reference to the button defined in conf.json as belonging to current query
                        var btn = document.getElementById(idPrefix + 'SearchButton');
                        btn.setAttribute('onclick', "agd.Utils.ButtonClickDoQuery(" + i + ");");

						var btn2 = document.getElementById(idPrefix + 'ClearButton');
						btn2.setAttribute('onclick',"agd.Utils.ClearInputs('" + idPrefix + "SearchResults','" + idPrefix + "SearchBox');");

						dojo.connect(dijit.byId(idPrefix + 'SearchBox'),'onKeyUp',function(e){
							if(e.keyCode == 13){
								var idPrefix = this.id.replace(/[a-z]+/gi, '');
								agd.Utils.ButtonClickDoQuery(idPrefix);
							}
						});
					}
				}

			}

            queries[i] = queryTask;
        }

        self.Queries = queries;
    },

	/**
	 * @function ClearInputs
	 *
	 * @param {String} resultDivId  id of the div that contains the search results
	 * @param {String} searchBoxId  id of the textbox widget that the search uses for input
	 */
	ClearInputs: function(resultDivId, searchBoxId) {
		var resultDiv = document.getElementById(resultDivId);
		resultDiv.innerHTML = "";
		var searchBox = document.getElementById(searchBoxId);
		searchBox.value = "";
	},

	/**
    *
    * @function getAllAttributes
    * description: get all the attributes for the feature by ObjectId
    *
    */
	getAllAttributes: function(ObjectId,url) {
		var self, queryTask, query;

		self = this;

		queryTask = new esri.tasks.QueryTask(url);
		query = new esri.tasks.Query();

		query.outFields=["*"];
		query.objectIds=[ObjectId];

		queryTask.execute(query,function(result){
			var itmHtml = '<table class="itmHtml"<tr class="infotable_hl"><td><tr><th>Name</th><th>Value</th></tr>';
			var hl = false;
			for(var prop in result.features[0].attributes) {
				if (prop.search('Shape') < 0) {
					if (hl) {
						itmHtml += '<tr class="infotable_hl"><td>';
						hl = false;
					} else {
						itmHtml += '<tr><td>';
						hl = true;
					}

					// if attribute names are from a join and have the structure tablename.attributename we only want to show the attributename
					var prts = prop.split('\.');
					var partval = prop;
					if (prts.length > 1)
						partval = prts[prts.length - 1];

					itmHtml += partval + "</td><td>" + result.features[0].attributes[prop] + "</td></tr>";
				}
			}
			itmHtml += "</table>";
			document.getElementById("InfoDiv").innerHTML = itmHtml;
			var infotab = dijit.byId("InfoTab");
			var tabcont = dijit.byId("leftCol");
			tabcont.selectChild(infotab);

		},function(err){
			alert(err);
		});

	},

    CreateToolbar: function (obj) {
        var toolcfg;

        toolcfg = obj.mapConfig.Tools;

        for (var i = 0; i < toolcfg.length; i +=1) {
            var tool = toolcfg[i];

            if (tool.type == "NavTools") {
                    this.tools.push(new dijit.form.Button({
                        label: "Zoom In",
						showLabel: false,
                        id: "zoomin",
                        iconClass: "zoominIcon",
						persist: true,
                        onClick: function(){
                            agd.Utils.changeTool('zoomin');
                        }
                    }));

                    this.tools.push(new dijit.form.Button({
                        label: "Zoom Out",
						showLabel: false,
                        id: "zoomout",
                        iconClass: "zoomoutIcon",
						persist: true,
                        onClick: function(){
                            agd.Utils.changeTool('zoomout');
                        }
                    }));

                    this.tools.push(new dijit.form.Button({
                        label: "Full Extent",
						showLabel: false,
                        id: "zoomfullext",
                        iconClass: "zoomfullextIcon",
						persist: false,
                        onClick: function(){
                            agd.Utils.changeTool('zoomextent');
                        }
                    }));

                    this.tools.push(new dijit.form.Button({
                        label: "Zoom Prev",
						showLabel: false,
                        id: "zoomprev",
                        iconClass:'zoomprevIcon',
						persist: false,
                        onClick:function() {
                            agd.Utils.changeTool('zoom_prev');
                        }
                    }));

                    this.tools.push(dijit.form.Button({
                        label: "Zoom Next",
						showLabel: false,
                        id:"zoomnext",
                        iconClass:'zoomnextIcon',
						persist: false,
                        onClick:function(){
                            agd.Utils.changeTool('zoom_next');
                        }
                    }));

                    this.tools.push(dijit.form.Button({
                        label: "Pan",
						showLabel: false,
                        id:"pan",
                        iconClass:'panIcon',
						persist: true,
                        onClick:function(){
                            agd.Utils.changeTool('pan');
                        }
                    }));

            }
            if (tool.type == "Hyperlink") {
                var taskIdx = agd.Utils.CreateHyperLink(tool.task);
                this.tools.push(dijit.form.Button({
                    label: tool.label,
					showLabel: false,
                    id: 'hyperlink',
                    iconClass: 'hyperlinkIcon',
					persist: true,
                    template: tool.template,
                    target: tool.target,
                    task: taskIdx,
                    onClick: function() {
                        agd.Utils.setIdentify(this.task);
                        agd.Utils.setTarget(this.target);
                        agd.Utils.changeTool(this.id);
                    }
                }));
            }

            if(tool.type == "Identify") {
				
                var taskIdx = agd.Utils.CreateIdentify(tool.task);
                this.tools.push(dijit.form.Button({
                    label: tool.label,
					showLabel: false,
                    id: 'identifyTool-button',
                    iconClass: 'identifyIcon',
					persist: true,
                    task: taskIdx,
                    onClick: function() {
                        //agd.Utils.setIdentify(this.task);
                        agd.Utils.changeTool("identifyTool-button");
                    }
                }));
            }

			if(tool.type == "Print") {
				if (!tool.hasOwnProperty('printDefs')) {
					tool.printDefs = {};
				}
				if (!tool.hasOwnProperty('disclamer')) {
					tool.disclamer = "This map is only a representation of real property and is not intended as a replacement for legal instrument of ownership.";
				}
                if (!tool.hasOwnProperty('title')) {
                    tool.title = "Map";
                }
				if (!tool.hasOwnProperty('subtitle')) {
					tool.subtitle = ""
				}
				this.widgets.Print = new agd.Widgets.Print(tool.url, tool.printDefs,tool.title, tool.subtitle, tool.disclamer);

				this.tools.push(new dijit.form.Button({
					label: 'Print',
					showLabel: false,
					id: 'printTool-button',
					iconClass: 'printIcon',
					onClick: function(){
						agd.Utils.widgets.Print.createPrintImage();
					}
				}));
			}

			if(tool.type == "MultiSelect") {

				if (!tool.hasOwnProperty('limit')) {
					tool.limit = 500;
				}

				this.widgets.MultiSelect = new agd.Widgets.MultiSelect(tool.url, tool.layerIds,tool.serviceUrl,tool.limit);

				var MSmenu = new dijit.DropDownMenu({
					style: 'display: none;'
				});

				var MSmenuItem1 = new dijit.MenuItem({
					label: "Select By Rectangle",
					id : 'multiSelectTool-button-rectangle',
					iconClass: 'multiSelectIcon',
					onClick: function(){
						agd.Utils.widgets.MultiSelect.Activate('rectangle');
					}
				});

				MSmenu.addChild(MSmenuItem1);

				var MSmenuItem2 = new dijit.MenuItem({
					label: "Select By Polygon",
					id : 'multiSelectTool-button-polygon',
					iconClass: 'multiSelectIcon',
					onClick: function(){
						agd.Utils.widgets.MultiSelect.Activate('polygon');
					}
				});

				MSmenu.addChild(MSmenuItem2);

				// var MSmenuItem3 = new dijit.MenuItem({
					// label: "Select By Radius",
					// id : 'multiSelectTool-button-radius',
					// iconClass: 'multiSelectIcon',
					// onClick: function() {
						// agd.Utils.widgets.MultiSelect.Activate('circle');
					// }
				// });

				// MSmenu.addChild(MSmenuItem3);

				var MSbutton = new dijit.form.DropDownButton({
					label: "Select Tools",
					showLabel: false,
					name: "SelectMenuButton",
					iconClass: 'selectIcon',
					persist: true,
					dropDown: MSmenu,
					id: "SelectMenuButton"
				});

				this.tools.push(MSbutton);

				this.tools.push(new dijit.form.Button({
					label: 'Clear Selection',
					showLabel: false,
					id: 'clearSelection-button',
					iconClass: 'clearSelectionIcon',
					onClick: function() {
						agd.Utils.widgets.MultiSelect.Clear();
					}
				}));
			}
			if(tool.type == "Measure") {
				this.widgets.Measure = new agd.Widgets.Measure(tool.geometryService);


				this.tools.push(new dijit.form.Button({
					label: 'Measure',
					id: "measure-dailog-button",
					iconClass: 'measureIcon',
					persist: true,
					onClick: function() {
						agd.Utils.widgets.Measure.showMeasureDialog();
					}
				}));
			}
			if(tool.type == "GoToXY"){
				this.widgets.GoToXY = new agd.Widgets.GoToXY(tool.geometryService);

				this.tools.push(new dijit.form.Button({
					label: 'Go To XY',
					showLabel: false,
					id: 'gotoxy-dailog-button',
					iconClass: 'gotoxyIcon',
					persist: false,
					onClick: function() {
						agd.Utils.changeTool(this.id);
					}
				}));
			}

			if(tool.type == "TaxCalc") {
				this.widgets.TaxEstCalc = new agd.Widgets.TaxEstCalc(tool.TaxInfo);

				this.tools.push(new dijit.form.Button({
					label: 'Tax Calculator',
					showLabel: false,
					id: 'taxcalc-dailog-button',
					iconClass: 'taxcalcIcon',
					persist: false,
					onClick: function() {
						agd.Utils.changeTool(this.id);
					}
				}))
			}
        }

        for (var j = 0; j < this.tools.length; j += 1) {
            this.tools[j].placeAt(dojo.byId("navToolbar"));
        }

        if(obj.mapConfig.Page.scaleview) {
            


            var sep = new dijit.ToolbarSeparator({});

            var scalebox = new dijit.form.TextBox({
                id: "scaleText",
                name: "scaleText",
                label: "Scale",
                value: "",
                placeHolder: "scale"
            },"scale");

            sep.placeAt(dojo.byId("navToolbar"));
            scalebox.placeAt(dojo.byId("navToolbar"));


            dojo.connect(map, "onExtentChange", function(extent){
                var txtbox = dijit.byId("scaleText");
                txtbox.setDisplayedValue("1: " + map.getScale().toFixed(0));
            });
        }
        if(obj.mapConfig.Page.scalebar) {

            var scalebar = new esri.dijit.Scalebar({
                map:map,
                attachTo: "bottom-left"
            });
        }
    },

    //Show messages at the bottom left of the window
    Notify: function (typ, msg,timeout) {
        var self, html, notify, domStyle;

		if(timeout == undefined || timeout == 'undefined' || timeout == null) {
			timeout = 3000;
		}

        self = agd.Utils;

        notify = dojo.byId('notification');

        switch(typ) {
            case 'error':
                dojo.style(dojo.byId('notification'),'color','red');
                notify.innerHTML = msg;
                TM = setTimeout(function(){agd.Utils.Notify("clear","");},timeout);
                break;
            case 'notify':
                dojo.style(dojo.byId('notification'),'color','black');
                notify.innerHTML = msg;
                TM = setTimeout(function(){agd.Utils.Notify("clear","");},timeout);
                break;
            case 'clear':
                notify.innerHTML = "";
                clearTimeout(TM);
                break;

        }


    },

	QuoteEncoding: function(strvalue) {
		var strquotes = /(')/g;
		return strvalue.replace(strquotes, "%");
	},

    /** @description Excecute a query on queryDefs[ idx ] */
    ButtonClickDoQuery: function(idx) {
            var queryDef, value, query, html, self, findParams, cacheName;

            cacheName = 'query' + idx;
            self = agd.Utils;

            //Clear all the old query results
            self.currentFeatures = [];
            for(var i = 0; i < self.queryDefs.length; i += 1) {
                var def = self.queryDefs[i];
                dojo.byId(def.resultId).innerHTML = "";
            }

            //Get a reference to the queryDef we want
            queryDef = self.queryDefs[idx];
            //Get the value for our search from an input on the page.
            value = dojo.byId(queryDef.inputId).value;
			value = self.QuoteEncoding(value);
            //Create a new query object.
			if(queryDef.type == "QueryTask"){
				query = new esri.tasks.Query();

				var parts = [];

				//Some logic to for how we want to search??
				if (queryDef.operator == "LIKE") {

					for (var k = 0; k < queryDef.searchFields.length; k += 1) {
						var fld = queryDef.searchFields[k];
						parts.push("UPPER(" + fld+ ") LIKE " + "'%" + value.toUpperCase() + "%'");
					}
					//query.where = "UPPER(" + queryDef.searchField + ") LIKE " + "'%" + value.toUpperCase() + "%'";

				}
                if (queryDef.operator == "NEAR") {
                    var baseNum = parseInt(value);
                    var startNum = 0;
                    var endNum = 0;
                    if (baseNum === NaN){
                        alert("value is not a number");
                        return;
                    }
                    if (baseNum > 10) {
                        startNum = baseNum - 10;
                        endNum = baseNum + 10;
                    } else {
                        startNum = baseNum;
                        endNum = baseNum + 20;
                    }
                        
                    for (var k = 0; k < queryDef.searchFields.length; k += 1){
                        var fld = queryDef.searchFields[k];
                        parts.push(fld + " > " + startNum + " AND " + fld + " < " + endNum);
                    }    
                        
                    
                }
				else {
					if (queryDef.isNumber) {
						for (var k = 0; k < queryDef.searchFields.length; k += 1) {
							var fld = queryDef.searchFields[k];
							parts.push(fld + " = " + value);
						}
							//query.where = queryDef.searchField + " = " + value;
					}
					else {
						for (var k = 0; k < queryDef.searchFields.length; k += 1) {
							var fld = queryDef.searchFields[k];
							parts.push(fld + " = " + "'" + value + "'");
						}
						//query.where = queryDef.searchField + " = " + "'" + value + "'";
					}
				}

				if (parts.length > 1) {
					query.where = parts.join(" OR ");
				} else {
					query.where = parts[0];
				}


				query.outFields = queryDef.outFields;
				for (var j = 0; j < queryDef.searchFields.length; j += 1) {
					if(!query.outFields.contains(queryDef.searchFields[j])) {
						query.outFields.push(queryDef.searchFields[j]);
					}
				}

				query.returnGeometry = true;
				self.curQueryDef = idx;
				//Execute the query and if we have results display them in the div defined in our queryDef.
				self.Queries[idx].execute(query, function(result){
					if (result.features.length > 0) {
						result.features.sort(agd.SortFeatures(queryDef.searchFields[0]));
						self.featureCache[cacheName] = result.features;
						//self.currentFeatures = result.features;
						var resultDiv = dojo.byId(self.queryDefs[self.curQueryDef].resultId);
						html = "<h3>Results</h3>";
						html += '<ul class="collapsibleList">';
						for (var j = 0; j < result.features.length; j += 1) {
							var itm = result.features[j];
							var parts1 = [];
                            var addclass = ""
                            if(j%2 == 0){
                                addclass = 'class="colorRow"';
                            }
							if(itm.attributes[queryDef.searchFields[0]] == null || itm.attributes[queryDef.searchFields[0]] == undefined){
								//do nothing statement to avoid error
								var x = 0;
							} else {
								if(itm.attributes[queryDef.searchFields[0]].length < 2) {
									var thtml = "";
									for(var k = 1; k < queryDef.searchFields.length; k += 1) {
										if(itm.attributes[queryDef.searchFields[k]].length > 2) {
											thtml = itm.attributes[queryDef.searchFields[k]];
											k = queryDef.searchFields.length + 1;
										}
									}
									if(thtml.length < 1) {
										thtml = 'NO VALUE';
									}
									html += '<li id="feature' + j + '"' + addclass + '>' + thtml;
								} else {
									html += '<li id="feature' + j + '"' + addclass + '>' + itm.attributes[queryDef.searchFields[0]];
								}
								html += "<ul>";
								html += '<li><a href="#" id="'+ cacheName + '-' + j + '"class="zoomto">Zoom To</a></li>';
								for(var x = 0; x < self.queryDefs[self.curQueryDef].outFields.length; x += 1) {
									var name = self.queryDefs[self.curQueryDef].outFields[x];
									if (self.RemoveNamePrefix) {
										var split = name.split('.');
										if(split.length > 1) {
											name = split[1];
										}
									}
									name = name.replace("_"," ");

									var value = itm.attributes[self.queryDefs[self.curQueryDef].outFields[x]];
									if (value == "undefined" || value == undefined) {
										value = 'null';
									}

									html += "<li><strong>" + name + ": </strong>" + value + "</li>";
								}
								html += "</ul></li>";
							}
						}
						html += "</ul>";

						resultDiv.innerHTML = html;
						CollapsibleLists.apply();

						dojo.query('.zoomto').connect('onclick',function(){
							var id;
							//id = this.id.replace('feature','');
							agd.Utils.ZoomToFeature(this.id);
						});
					}
					else {
						self.Notify('error','No Results Found');
					}
				},function(err){
                    console.log(err);
					alert(err);
				});

			} else if (queryDef.type == "FindTask") {
				findParams = new esri.tasks.FindParameters();

				findParams.returnGeometry = true;
				findParams.layerIds = queryDef.layerIds;
				findParams.searchFields = queryDef.searchFields;
				findParams.searchText = value;

				self.curQueryDef = idx;

				var findTask = self.Queries[idx];

				findTask.execute(findParams,function(results){
					if(results.length > 0){
						//self.currentFeatures = [];
						self.featureCache[cacheName] = [];
						var count = 0;
						var resultDiv = dojo.byId(self.queryDefs[self.curQueryDef].resultId);
						var htmls = {};


						html = "<h3>Results</h3>";
						html += '<ul class="collapsibleList">';
						dojo.forEach(results, function(result){
							if(htmls.hasOwnProperty(result.layerName)){
							} else {
								htmls[result.layerName] = '<li>' + result.layerName + '<ul>';
							}
							var self = agd.Utils;
							var item = result.feature;
							//self.currentFeatures.push(item);
							self.featureCache[cacheName].push(item);
							htmls[result.layerName] += '<li id="feature ' + count + '">' + item.attributes[result.foundFieldName];
							htmls[result.layerName] += '<ul>';
							htmls[result.layerName] += '<li><a href="#" id="' + cacheName + '-' + count + '"class="zoomto">Zoom To</a></li>';
							for (var attr in item.attributes) {
								htmls[result.layerName] += '<li><strong>' + attr + ': </strong>' + item.attributes[attr] + '</li>';
							}
							htmls[result.layerName] += '</ul></li>';
							count += 1;
						});

						for(var lyrName in htmls) {
							var html2 = htmls[lyrName];
							html2 += '</ul></li>';
							html += html2;
						}

						html += "</ul>";
						resultDiv.innerHTML = html;
						CollapsibleLists.apply();

						dojo.query('.zoomto').connect('onclick',function(){
							var id;
							//id = this.id.replace('feature','');
							agd.Utils.ZoomToFeature(this.id);
						});
					}
				},function(err){
					alert(err);
				});
			} else if (queryDef.type == "GeocodeTask") {
				
				var self = agd.Utils;

				self.curQueryDef = idx;

				var numReg = new RegExp('^[0-9]+');
				var commaReg = new RegExp(',');

				var m = numReg.exec(value);
				var n = commaReg.exec(value);

				var address = {};

				if(m != null) {
					address.SingleLine = value;
				} else {
					if(n != null) {
						var parts = value.split(',');
						if(parts.length > 1){
							address.Street = parts[0].trim();
							address.City = parts[1].trim();
						} else {
							address.Street = value;
						}
					} else {
						address.Street = value;
					}
				}

				//var address = {"SingleLine":value};

				var locator = self.Queries[idx];

				locator.outSpatialReference = map.spatialReference;
				var options = {
					address: address,
					outFields: ["Loc_name"]
				}

				locator.addressToLocations(options, function(candidates) {
					if(candidates.length > 0) {
						var self = agd.Utils;

						//self.currentFeatures = [];
						self.featureCache[cacheName] = [];
						var results = candidates.sort(self.sortBy('score',false,null));

						var count = 0;
						var resultDiv = dojo.byId(self.queryDefs[self.curQueryDef].resultId);
						var htmls = {};


						html = "<h3>Results</h3>";
						html += '<ul class="collapsibleList">';
						dojo.forEach(results, function(result) {
							var self = agd.Utils;
							//self.currentFeatures.push(result);
							self.featureCache[cacheName].push(result);
							html += '<li><a href="#" id="' + cacheName + '-' + count + '"class="zoomto">' + result.address  + '</a></li>';
							count += 1;
						});

						html += "</ul>";

						resultDiv.innerHTML = html;
						CollapsibleLists.apply();

						dojo.query('.zoomto').connect('onclick',function(){
							var id;
							//id = this.id.replace('feature','');
							agd.Utils.ZoomToFeature(this.id);
						});
					}


				},function(err) {
				});
			}

        },

	// Function to sort an array of objects by an attribute
	sortBy: function(field, reverse, primer) {
		var key = function (x) {return primer ? primer(x[field]) : x[field]};

		return function(a,b) {
			var A = key(a), B = key(b);
			return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];
		}
	},

    ZoomToFeature: function(fid) {
        var feature, self, mtch, id, qid;
        self = agd.Utils;

	mtch = fid.match(/(([query]{5})(\d+)(-)(\d+))/);

	try {

	    if (mtch != null) {
		id = mtch[5]
		qid = mtch[3]
	    } else {
		id = fid.replace('feature','');
		qid = null;
	    }

	    if (qid != null) {
		feature = self.featureCache['query' + qid][id];
	    } else {
		feature = self.currentFeatures[id];
	    }

	    if(feature == null || feature == 'undefined') {
		self.Notify('error','Cannot Locate Feature');
	    } else {
            if (feature.hasOwnProperty('location')){
                feature.geometry = feature.location;
            }
            self.currentGraphic = self.CreateFeatureGraphic(feature);
            self.currentFeatures = [{feature:feature}];
            map.graphics.clear();
            map.graphics.add(self.currentGraphic);
            // if the graphic is a point the extent will be zero and you can't zoom to it
            if(self.currentGraphic._extent.getWidth() == 0) {
                var ext = self.currentGraphic._extent;
                // make a new extent 200 units wide and tall around the point.
                self.currentGraphic._extent.update(ext.xmin - 100, ext.ymin - 100, ext.xmax + 100, ext.ymax + 100, ext.spatialReference);
            }
            map.setExtent(self.currentGraphic._extent);

	    }
	} catch(e) {
	    self.Notify('error',e);
	}
    },


    CreateFeatureGraphic: function(feature, infoTemplate) {
        var type, symbol,self,graphic;
        self = agd.Utils;
        type = feature.geometry.type;

        switch (type) {
            case 'point':
            case 'multipoint':
                symbol = self.symbols['DefaultPointSymbol'];
                break;
            case 'line':
            case 'polyline':
                symbol = self.symbols['DefaultLineSymbol'];
                break;
            case 'polygon':
                symbol = self.symbols['DefaultPolygonSymbol'];
                break;
        }

        graphic = new esri.Graphic(feature.geometry, symbol, feature.attributes, infoTemplate);

		self.currentGraphic = graphic;

        return graphic;
    },


    mapClickHandler: function (evt) {
        var inPoint, location, self;

        self = agd.Utils;



        inPoint = new esri.geometry.Point(evt.mapPoint.x, evt.mapPoint.y, map.spatialReference);

		self.lastClick = evt;

        switch(self.activeTool) {
            case 'identifyTool-button':
				//clear vars for print widget
				if(agd.Utils.widgets.hasOwnProperty("Print")) {
					agd.Utils.currentIdentifyGeom.clear();
					agd.Utils.currentIdentifyMatrix = null;
				}

				if(agd.Utils.widgets.hasOwnProperty('Identify')){
					agd.Utils.widgets.Identify.doIdentify(evt);
				}
				break;
			case 'obsolite':
                map.graphics.clear();

				if(agd.Utils.widgets.hasOwnProperty("Print")) {
					agd.Utils.currentIdentifyGeom.clear();
					agd.Utils.currentIdentifyMatrix = null;
				}

                location = new esri.Graphic(inPoint,self.symbols['DefaultPointSymbol']);
                map.graphics.add(location);

                self.identifyParams[self.activeIdentify].geometry = inPoint;
                self.identifyParams[self.activeIdentify].mapExtent = map.extent;

                var params = self.identifyParams[self.activeIdentify];

                self.identifyTasks[self.activeIdentify].execute(params,function(results){
                    var ScreenPoint, feature, template, tmp;
                    ScreenPoint = map.toScreen(inPoint);
                    feature = results[0].feature;
		    self.currentFeatures = [results[0]];



		    var tmp = self.identifyDefs[self.activeIdentify].templates[results[0].layerId].replace("#URL",self.identifyDefs[self.activeIdentify].url + "/" + results[0].layerId);

                    template = new esri.InfoTemplate();

                    template.setTitle(self.identifyDefs[self.activeIdentify].title);
                    template.setContent(tmp);

                    feature.infoTemplate = template;
                    map.infoWindow.setFeatures([feature]);

                    map.infoWindow.resize(self.identifyDefs[self.activeIdentify].width, self.identifyDefs[self.activeIdentify].width);


                    if(self.identifyDefs[self.activeIdentify].show) {
                        map.infoWindow.show(inPoint,map.getInfoWindowAnchor(ScreenPoint));
                    }

		    if(agd.Utils.widgets.hasOwnProperty("Print")){

			    agd.Utils.widgets.Print.currentIdentifyAttributes = feature.attributes;


			    if(map.graphics._div.children.length > 0) {
                    agd.Utils.currentIdentifyGeom.clear();
					if(map.graphics._div.children.length > 0) {
                        for(var k = 0; k < map.graphics._div.children.length; k += 1) {
                            agd.Utils.currentIdentifyGeom.push(map.graphics._div.children[k].shape.path);
                        }
						agd.Utils.currentIdentifyMatrix = map.graphics._div.getTransform();
					}
				}
		    }

                },function(error){
                    self.Notify('error',error);
                });


                break;

		case 'hyperlink':
			map.graphics.clear();

                location = new esri.Graphic(inPoint,self.symbols['DefaultPointSymbol']);
                map.graphics.add(location);

                self.identifyParams[self.activeIdentify].geometry = inPoint;
                self.identifyParams[self.activeIdentify].mapExtent = map.extent;

                var params = self.identifyParams[self.activeIdentify];

                self.identifyTasks[self.activeIdentify].execute(params,function(results){
                    var ScreenPoint, feature, template, tmp, toolParams;
                    ScreenPoint = map.toScreen(inPoint);
                    feature = results[0].feature;

					toolParams = self.identifyDefs[self.activeIdentify];
					if (!toolParams.hasOwnProperty('height')) {
						toolParams.height = '300';
					}
					if (!toolParams.hasOwnProperty('width')) {
						toolParams.width = '400';
					}

					var url = self.formatTemplate(self.identifyDefs[self.activeIdentify].template,results);

					if (self.toolTarget == "PropertyInfo") {
					   document.getElementById("propInfoFrame").src = url;
					   dijit.byId("mainTabContainer").selectChild("propInfoTab");
					}
					else if (self.toolTarget == "NewWindow") {
						options = "location=no,menubar=no,resizable=yes,titlebar=no,height=" + toolParams.height + ",width=" + toolParams.width;
						window.open(url,"PRC",options);
					}
					else if (self.toolTarget == "Dialog") {
						var iframe = '<iframe allowtransparency=true frameborder=0 scrolling=auto src="' + url + '" style="height:' + toolParams.height + 'px;width:' + toolParams.width + 'px;"></iframe>';
						var xPRCDialog = new dijit.Dialog({title:"PRC",content:iframe});

						xPRCDialog.connect(xPRCDialog,"hide",function(e){
								var dlg = dijit.byId(this.id);
                                dlg.destroyRecursive();
								var div = document.getElementById('xPRCDialog');
								if (div) {
									div.parentNode.removeChild(div);
								}
							});

						xPRCDialog.show();
					}
				});
			break;
        }
    },


	//mdrps: function(acctid) {
	//	//County=08&SearchType=ACCT&District=07&AccountNumber=013477
	//	var cty, dst, acct;
	//
	//	cty = acctid.substring(0,2);
	//	dst = acctid.substring(2,4);
	//	acct = acctid.substring(4);
	//
	//	return "County=" + cty + "&SearchType=ACCT&District=" + dst + "&AccountNumber=" + acct;
	//},

    formatTemplate: function(template,results) {
		var calProp = 'undefined';

		if(template.match(agd.Utils.methodRe))
		{
			var m = agd.Utils.methodRe.exec(template);
			var item = m[0].replace(/#/g,'');
			if(typeof this.userFunctions[item] == 'function') {
				var m2 = template.match(/{[A-Z0-9/.]+}/);
				var prop = m2[0].replace(/{/g,'').replace(/}/g,'');
				if(typeof results[0].feature.attributes[prop] != 'undefined') {
					calProp = this.userFunctions[item](results[0].feature.attributes[prop]);
				}
			}

			return template.replace(/#[a-z]+#{[A-Z0-9/.]+}/,calProp);

		}
		else {
		    return template.replace(/{[A-Z0-9/.]+}/g, function(match,number){
			    var itm = match.replace(/[{}]/g,'');
			    return typeof results[0].feature.attributes[itm] != 'undefined' ? results[0].feature.attributes[itm] : match;
		    });
		}
    },

    extentHistoryChangeHandler: function () {
        dijit.byId("zoomprev").disabled = navToolbar.isFirstExtent();
        dijit.byId("zoomnext").disabled = navToolbar.isLastExtent();
    },

	extentChangedHandler: function() {

		if(agd.Utils.widgets.hasOwnProperty("Print"))
		{
			var t = setTimeout(function(){
				if(map.graphics._div.children.length > 0) {
                    agd.Utils.currentIdentifyGeom.clear();
					if(map.graphics._div.children.length > 0) {
                        for(var k = 0; k < map.graphics._div.children.length; k += 1) {
                            agd.Utils.currentIdentifyGeom.push(map.graphics._div.children[k].shape.path);
                        }
						agd.Utils.currentIdentifyMatrix = map.graphics._div.getTransform();
					}
				}
			},1000);
		}
	},

	//TODO: change this so that each tool contains a function for handling changing of tools
    changeTool: function (toolId) {
        var self;
        self = this;

        self.activeTool = toolId;

        switch (toolId) {
			case 'measure-line':
				navToolbar.activate(esri.toolbars.Navigation.PAN);
				agd.Utils.widgets.Measure.changeTool('line');
				self.Notify('notify',"Current tool Measure Line");
				break;
			case 'measure-area':
				navToolbar.activate(esri.toolbars.Navigation.PAN);
				agd.Utils.widgets.Measure.changeTool('area');
				self.Notify('notify',"Current tool Measure Area");
				break;
			case 'measure-point':
				navToolbar.activate(esri.toolbars.Navigation.PAN);
				agd.Utils.widgets.Measure.changeTool('point');
				self.Notify('notify',"Current tool Measure Point");
				break;
            case 'zoomin':
                navToolbar.activate(esri.toolbars.Navigation.ZOOM_IN);
                self.Notify('notify',"Current tool Zoom In");
                break;
            case 'zoomout':
                navToolbar.activate(esri.toolbars.Navigation.ZOOM_OUT);
                self.Notify('notify',"Current tool Zoom Out");
                break;
            case 'pan':
                navToolbar.activate(esri.toolbars.Navigation.PAN);
                self.Notify('notify',"Current tool Pan");
                break;
            case 'zoom_prev':
                navToolbar.zoomToPrevExtent();
                break;
            case 'zoom_next':
                navToolbar.zoomToNextExtent();
                break;
            case 'identifyTool-button':
                navToolbar.deactivate();
                self.Notify('notify',"Current tool Identify");
                break;
            case 'zoomextent':
                navToolbar.zoomToFullExtent();
                break;
            case 'hyperlink':
                navToolbar.deactivate();
                self.Notify('notify',"Current tool Hyperlink");
                break;
			case 'gotoxy-dailog-button':
				self.Notify('notify','Current tool GoToXY');
				self.widgets.GoToXY.ShowDialog();
				break;
			case 'taxcalc-dailog-button':
				self.Notify('notify','Current tool Tax Calculator');
				self.widgets.TaxEstCalc.ShowDialog();
				break;
        }

		for(var i = 0; i < self.tools.length; i += 1) {
			dojo.removeClass(self.tools[i].domNode,'dijitButtonDownagd');
		}

		var toolRef = dijit.byId(toolId);
		if(toolRef){
			if(toolRef.persist){
				dojo.addClass(toolRef.domNode,'dijitButtonDownagd');
			}
		}


		if(self.activeTool.search('measure') < 0) {
			if (agd.Utils.widgets.hasOwnProperty('Measure')) {
				agd.Utils.widgets.Measure.Close();
			}
		}
		if(self.activeTool.search('print') < 0) {
			agd.Utils.currentFeatures = [];
		}
    }

});


agd.Utils = new agd.Utilities();

agd.Utils.addUserFunction('mdrps',function(acctid) {
		//County=08&SearchType=ACCT&District=07&AccountNumber=013477
		var cty, dst, acct;

		cty = acctid.substring(0,2);
		dst = acctid.substring(2,4);
		acct = acctid.substring(4);

		return "County=" + cty + "&SearchType=ACCT&District=" + dst + "&AccountNumber=" + acct;
	});