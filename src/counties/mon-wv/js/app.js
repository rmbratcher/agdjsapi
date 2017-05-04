"use strict";
var monApp, map, toc, agsBase, parcelLayerIDX, map, mainMapLayer, imgLayer2015, parcelLayer, fplate, districts, pInfoTemplate, navToolbar, activeTool, measureDialog, measurementWidget, printSettings, currentFeatures, lastMapCenter, STR_PAD_LEFT, STR_PAD_RIGHT, STR_PAD_BOTH, mapSettings, defaultWKID, Queries, QueryTasks, featureCache, RemoveNamePrefix, ButtonClickDoQuery, ZoomToFeature, currentGraphic, SymbolDefs, symbols, ClearInputs, queryPoint, iasURL;

/*
     _______. _______ .___________.___________. __  .__   __.   _______      _______.
    /       ||   ____||           |           ||  | |  \ |  |  /  _____|    /       |
   |   (----`|  |__   `---|  |----`---|  |----`|  | |   \|  | |  |  __     |   (----`
    \   \    |   __|      |  |        |  |     |  | |  . `  | |  | |_ |     \   \    
.----)   |   |  |____     |  |        |  |     |  | |  |\   | |  |__| | .----)   |   
|_______/    |_______|    |__|        |__|     |__| |__| \__|  \______| |_______/   

*/

iasURL = 'https://ias.agdmaps.com/mon/',

mapSettings = {
	center: [1840128, 402581],
	zoom: 11,
	autoResize: true

};

defaultWKID = 26853;


printSettings = {
	url: "http://print.agd.cc/services/print/mon-wv.ashx",
	title: "Monongalia, WV",
	subtitle: " TAX ASSESSORS OFFICE ",
	disclamer: "THIS MAP IS DESIGNED FOR ASSESSMENT PURPOSES ONLY AND IS NOT INTENDED AS A SUBSTITUE FOR A TRUE TITLE SEARCH, PROPERTY APPRAISAL OR A SURVEY BY A LICENSED SURVEYOR.",
	printDefs: {
		"153": [
			"dmp", "dist", "map", "parcel", "parid", "nbhd", "own1", "own2", "careof", "owneraddr", "cityname", "statecode", "acres", "book", "page", "aprland", "aprbldg", "legal1", "legal2", "legal3"
		]
	}
};


agsBase = "https://ags.agdmaps.com/arcgis/rest/services/MonongaliaWV/MapServer/";

parcelLayerIDX = '142';

Queries = [{
	"label": "Owner",
	"type": "QueryTask",
	"url": "https://ags.agdmaps.com/arcgis/rest/services/MonongaliaWV/MapServer/142",
	"operator": "LIKE",
	"isNumber": false,
	"searchBoxLable": "Owner Name",
	"searchFields": [
		"own1",
		"own2"
	],
	"outFields": [
		"dmp", "dist", "map", "parcel", "parid", "nbhd", "own1", "own2", "careof", "owneraddr", "cityname", "statecode", "acres", "book", "page", "aprland", "aprbldg", "legal1", "legal2", "legal3"
	],
	"symbol": "DefaultPolygonSymbol",
	"title": "Parcel: ${parid}",
	"content": '<b>Details:</b><a href="'+ iasURL+ '/detail/${parid}">View</a><br /><b>Parid:</b> ${parid}<br /><b>Owner:</b><br />${own1}<br /><b>Owner2:</b> ${own2}<br /><b>Nghbrhd:</b> ${nbhd}<br /><b>Legal1:</b><br />${legal1}<br /><b>Book-Page:</b> ${book}-${page}<br /><b>Land Value:</b> $${aprland}<br /><b>Bldg Value:</b> $${aprbldg}<br />'
}, {
	"label": "ParId",
	"type": "QueryTask",
	"url": "https://ags.agdmaps.com/arcgis/rest/services/MonongaliaWV/MapServer/142",
	"operator": "LIKE",
	"isNumber": false,
	"searchBoxLable": "Parcel Id.",
	"searchFields": [
		"parid"
	],
	"outFields": [
		"dmp", "dist", "map", "parcel", "parid", "nbhd", "own1", "own2", "careof", "owneraddr", "cityname", "statecode", "acres", "book", "page", "aprland", "aprbldg", "legal1", "legal2", "legal3"
	],
	"symbol": "DefaultPolygonSymbol",
	"title": "Parcel: ${parid}",
	"content": '<b>Parid:</b> ${parid}<br /><b>Owner:</b><br />${own1}<br /><b>Owner2:</b> ${own2}<br /><b>Nghbrhd:</b> ${nbhd}<br /><b>Legal1:</b><br />${legal1}<br /><b>Book-Page:</b> ${book}-${page}<br /><b>Land Value:</b> $${aprland}<br /><b>Bldg Value:</b> $${aprbldg}<br />'

}, {
	"label": "Address",
	"type": "QueryTask",
	"url": "https://ags.agdmaps.com/arcgis/rest/services/MonongaliaWV/MapServer/138",
	"operator": "LIKE",
	"isNumber": false,
	"searchBoxLable": "Address",
	"searchFields": [
		"FULL_ADDRESS"
	],
	"outFields": [
		"BLDG_CODE", "FULL_ADDRESS", "COMMUNITY"
	],
	"symbol": "DefaultPointSymbol",
	"title": "${FULL_ADDRESS}",
	"content": '<b>Address:</b> ${FULL_ADDRESS}<br /><b>Bldg-Code:</b><br />${BLDG_CODE}<br /><b>Community:</b> ${COMMUNITY}<br />'
}];

SymbolDefs = [{
	"name": "DefaultLineSymbol",
	"style": {
		"type": "esriSFS",
		"style": "esriSFSSolid",
		"color": [
			115,
			76,
			0,
			255
		],
		"outline": {
			"type": "esriSLS",
			"style": "esriSLSSolid",
			"color": [
				110,
				110,
				110,
				255
			],
			"width": 1
		}
	}
}, {
	"name": "DefaultPointSymbol",
	"style": {
		"type": "esriSMS",
		"style": "esriSMSSquare",
		"color": [
			76,
			115,
			0,
			255
		],
		"size": 8,
		"angle": 0,
		"xoffset": 0,
		"yoffset": 0,
		"outline": {
			"color": [
				152,
				230,
				0,
				255
			],
			"width": 1
		}
	}
}, {
	"name": "DefaultPolygonSymbol",
	"style": {
		"type": "esriSFS",
		"style": "esriSFSSolid",
		"color": [
			247,
			230,
			97,
			0
		],
		"outline": {
			"type": "esriSLS",
			"style": "esriSLSSolid",
			"color": [
				255,
				0,
				0,
				255
			],
			"width": 1
		}
	}
}]

/*
  ______   ______   .__   __.      _______.___________.    ___      .__   __. .___________.    _______.
 /      | /  __  \  |  \ |  |     /       |           |   /   \     |  \ |  | |           |   /       |
|  ,----'|  |  |  | |   \|  |    |   (----`---|  |----`  /  ^  \    |   \|  | `---|  |----`  |   (----`
|  |     |  |  |  | |  . `  |     \   \       |  |      /  /_\  \   |  . `  |     |  |        \   \    
|  `----.|  `--'  | |  |\   | .----)   |      |  |     /  _____  \  |  |\   |     |  |    .----)   |   
 \______| \______/  |__| \__| |_______/       |__|    /__/     \__\ |__| \__|     |__|    |_______/    

*/
/*
 *   constants for pad function
 */
STR_PAD_LEFT = 1;
STR_PAD_RIGHT = 2;
STR_PAD_BOTH = 3;

currentFeatures = [];
districts = [];
featureCache = {};
symbols = {};
RemoveNamePrefix = true;

/*
.___________. __    __   _______      _______ .______       _______     ___   .___________.    ___________    ____  __   __      
|           ||  |  |  | |   ____|    /  _____||   _  \     |   ____|   /   \  |           |   |   ____\   \  /   / |  | |  |     
`---|  |----`|  |__|  | |  |__      |  |  __  |  |_)  |    |  |__     /  ^  \ `---|  |----`   |  |__   \   \/   /  |  | |  |     
    |  |     |   __   | |   __|     |  | |_ | |      /     |   __|   /  /_\  \    |  |        |   __|   \      /   |  | |  |     
    |  |     |  |  |  | |  |____    |  |__| | |  |\  \----.|  |____ /  _____  \   |  |        |  |____   \    /    |  | |  `----.
    |__|     |__|  |__| |_______|    \______| | _| `._____||_______/__/     \__\  |__|        |_______|   \__/     |__| |_______|

*/
monApp = require(["esri/map",
	"esri/layers/ArcGISDynamicMapServiceLayer",
	"esri/layers/ArcGISImageServiceLayer",
	"esri/layers/WMSLayer",
	"esri/layers/WMSLayerInfo",
	"esri/layers/FeatureLayer",
	"esri/tasks/FeatureSet",
	"esri/tasks/query",
	"esri/tasks/QueryTask",
	"esri/graphicsUtils",
	"esri/dijit/PopupTemplate",
	"esri/dijit/Legend",
	"esri/SpatialReference",
	"esri/units",
	"esri/symbols/SimpleLineSymbol",
	"esri/graphic",
	"esri/symbols/PictureMarkerSymbol",
	"esri/config",
	"dojo/_base/Color",
	"dojo/on",
	"dojo/_base/fx",
	"dojo/_base/connect",
	"dojo/dom",
	"esri/units",
	"dgrid/Grid",
	"dojo/number",
	"dojo/_base/array",
	"esri/lang",
	"dojo/dom-construct",
	"dojo/parser",
	"esri/urlUtils",
	"esri/renderers/SimpleRenderer",
	"esri/symbols/SimpleFillSymbol",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/InfoTemplate",
	"dijit/form/Button",
	"esri/dijit/Search",
	"dojo/query",
	"esri/dijit/Measurement",
	"esri/SnappingManager",
	"esri/tasks/GeometryService",
	"esri/sniff",
	"dojo/keys",
	"esri/toolbars/navigation",
	"dijit/Tooltip",
	"agd/dijit/TOC",
	"esri/geometry/Geometry",
	"esri/geometry/ScreenPoint",
	"agd/infoWindow",
	"dijit/form/ToggleButton",
	"dijit/Toolbar",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/AccordionPane",
	"dijit/layout/TabContainer",
	"dijit/Dialog",
	"dojo/domReady!"
], function(Map, ArcGISDynamicMapServiceLayer, ArcGISImageServiceLayer, WMSLayer, WMSLayerInfo, FeatureLayer, FeatureSet, Query, QueryTask,
	graphicsUtils, PopupTemplate, Legend, SpatialReference, Units, SimpleLineSymbol, Graphic, PictureMarkerSymbol,
	config, Color, on, fx, conn, dom, esriUnits, Grid, number, arrayUtils, esriLang, domConstruct, parser, urlUtils,
	SimpleRenderer, SimpleFillSymbol, SimpleMarkerSymbol, InfoTemplate, Button, Search, domquery, Measurement, SnappingManager, GeometryService,
	has, keys, Navigation, Tooltip, TOC, Geometry, ScreenPoint, InfoWindow) {

	/*
	.___  ___.      ___      .______      .______   .______        ______   .___________.  ______   .___________.____    ____ .______    _______     _______.
	|   \/   |     /   \     |   _  \     |   _  \  |   _  \      /  __  \  |           | /  __  \  |           |\   \  /   / |   _  \  |   ____|   /       |
	|  \  /  |    /  ^  \    |  |_)  |    |  |_)  | |  |_)  |    |  |  |  | `---|  |----`|  |  |  | `---|  |----` \   \/   /  |  |_)  | |  |__     |   (----`
	|  |\/|  |   /  /_\  \   |   ___/     |   ___/  |      /     |  |  |  |     |  |     |  |  |  |     |  |       \_    _/   |   ___/  |   __|     \   \    
	|  |  |  |  /  _____  \  |  |         |  |      |  |\  \----.|  `--'  |     |  |     |  `--'  |     |  |         |  |     |  |      |  |____.----)   |   
	|__|  |__| /__/     \__\ | _|         | _|      | _| `._____| \______/      |__|      \______/      |__|         |__|     | _|      |_______|_______/    
	                                                                                                                                                         
	*/

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
		} catch (err) {
			return 0.0;
		}
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
		if (pnt.x > this._mapParams.extent.xmin && pnt.x < this._mapParams.extent.xmax && pnt.y > this._mapParams.extent.ymin && pnt.y < this._mapParams.extent.ymax) {
			return true;
		} else {
			return false;
		}
	};

	/**
		.__   __.   ______   .___________. __   ___________    ____ 
		|  \ |  |  /  __  \  |           ||  | |   ____\   \  /   / 
		|   \|  | |  |  |  | `---|  |----`|  | |  |__   \   \/   /  
		|  . `  | |  |  |  |     |  |     |  | |   __|   \_    _/   
		|  |\   | |  `--'  |     |  |     |  | |  |        |  |     
		|__| \__|  \______/      |__|     |__| |__|        |__|     
		                                                            
	    * @function ContainsPoint
	    *
	    * @description Add a method to the esri.Map object to query the bounds of the map for intersecting point
	    *
	    * Parameters:
	    * @param pnt {Object} (esri.geometry.Point) Point to query
	    */

	function Notify(typ, msg, timeout) {
		var html, notify, domStyle, TM;

		if (timeout == undefined || timeout == 'undefined' || timeout == null) {
			timeout = 3000;
		}

		notify = dojo.byId('notification');

		if (notify == null || notify == undefined) {
			return;
		}

		switch (typ) {
			case 'error':
				dojo.style(dojo.byId('notification'), 'color', 'red');
				notify.innerHTML = msg;
				TM = setTimeout(function() {
					Notify("clear", "");
				}, timeout);
				break;
			case 'notify':
				dojo.style(dojo.byId('notification'), 'color', 'black');
				notify.innerHTML = msg;
				TM = setTimeout(function() {
					Notify("clear", "");
				}, timeout);
				break;
			case 'clear':
				notify.innerHTML = "";
				clearTimeout(TM);
				break;
		}
	};

	for (var i = 0; i < SymbolDefs.length; i += 1) {
		var symbolDef = SymbolDefs[i];
		symbols[symbolDef.name] = esri.symbol.fromJson(symbolDef.style);
	}

	// call the parser to create the dijit layout dijits
	parser.parse();


	config.defaults.geometryService = new GeometryService("https://ags.agdmaps.com/arcgis/rest/services/Utilities/Geometry/GeometryServer");

	//esriConfig.defaults.io.proxyUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + 'proxy.php';

	/*var infoWindow = new  InfoWindow({
          domNode: domConstruct.create("div", null, dom.byId("map"))
       });
	*/
	pInfoTemplate = new InfoTemplate();
	pInfoTemplate.setTitle("Parcel: ${dmp}");
	var tmpl = '<b>Details:</b><a href="'+ iasURL + '/detail/${dmp}" target="_blank"> View IAS</a><br /><b>Parid:</b> ${parid}<br /><b>Owner:</b><br />${own1}<br /><b>Owner2:</b> ${own2}<br /><b>Nghbrhd:</b> ${nbhd}<br /><b>Legal1:</b><br />${legal1}<br />';
	tmpl += '<b>Book-Page:</b> ${book}-${page}<br /><b>Land Value:</b> $${aprland}<br /><b>Bldg Value:</b> $${aprbldg}<br />';
	pInfoTemplate.setContent(tmpl);
	/*pInfoTemplate.spatialReference = new SpatialReference({
		wkid: 'PROJCS["NAD_1983_West_Virginia_North_ftUS",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic"],PARAMETER["false_easting",1968500.0],PARAMETER["false_northing",0.0],PARAMETER["central_meridian",-79.5],PARAMETER["standard_parallel_1",40.25],PARAMETER["standard_parallel_2",39.0],PARAMETER["latitude_of_origin",38.5],UNIT["Foot_US",0.3048006096012192]])'
	});*/


	mainMapLayer = new ArcGISDynamicMapServiceLayer('https://ags.agdmaps.com/arcgis/rest/services/MonongaliaWV/MapServer');
	/*mainMapLayer.spatialReference = new SpatialReference({
		wkid: 'PROJCS["NAD_1983_West_Virginia_North_ftUS",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic"],PARAMETER["false_easting",1968500.0],PARAMETER["false_northing",0.0],PARAMETER["central_meridian",-79.5],PARAMETER["standard_parallel_1",40.25],PARAMETER["standard_parallel_2",39.0],PARAMETER["latitude_of_origin",38.5],UNIT["Foot_US",0.3048006096012192]])'
	});*/

	//TMP
	//imgLayer2015 = new ArcGISImageServiceLayer('http://ags2.atlasgeodata.com/arcgis/rest/services/Imagery/MonongaliaWV2015/ImageServer');
	/*imgLayer2015 = new WMSLayer('https://wms.agdmaps.com/geoserver/MonWV/wms',{
		format: "png",
		version: "1.1.1",
      	visibleLayers: [
        	"MonWV:Imagery2015"
      	]
	});*/
	/*imgLayer2015.spatialReference = new SpatialReference({
		wkid: 'PROJCS["NAD_1983_West_Virginia_North_ftUS",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic"],PARAMETER["false_easting",1968500.0],PARAMETER["false_northing",0.0],PARAMETER["central_meridian",-79.5],PARAMETER["standard_parallel_1",40.25],PARAMETER["standard_parallel_2",39.0],PARAMETER["latitude_of_origin",38.5],UNIT["Foot_US",0.3048006096012192]])'
	});*/
	
	//TMP
	//imgLayer2015.visible = false;

	//TMP
	//var imgLayer2010 = new ArcGISImageServiceLayer('http://ags2.atlasgeodata.com/arcgis/rest/services/Imagery/MonogaliaWV2010/ImageServer');

	/*imgLayer2010.spatialReference = new SpatialReference({
		wkid: 'PROJCS["NAD_1983_West_Virginia_North_ftUS",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic"],PARAMETER["false_easting",1968500.0],PARAMETER["false_northing",0.0],PARAMETER["central_meridian",-79.5],PARAMETER["standard_parallel_1",40.25],PARAMETER["standard_parallel_2",39.0],PARAMETER["latitude_of_origin",38.5],UNIT["Foot_US",0.3048006096012192]])'
	});*/

	//TMP
	//imgLayer2010.visible = false;

	parcelLayer = new FeatureLayer(agsBase + parcelLayerIDX, {
		outFields: ['*'],
		infoTemplate: pInfoTemplate,
		mode: FeatureLayer.MODE_ONDEMAND
	});

	/*parcelLayer.spatialReference = new SpatialReference({
		wkid: 'PROJCS["NAD_1983_West_Virginia_North_ftUS",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic"],PARAMETER["false_easting",1968500.0],PARAMETER["false_northing",0.0],PARAMETER["central_meridian",-79.5],PARAMETER["standard_parallel_1",40.25],PARAMETER["standard_parallel_2",39.0],PARAMETER["latitude_of_origin",38.5],UNIT["Foot_US",0.3048006096012192]])'
	});*/

	mapSettings.spatialReference = new SpatialReference({
		wkid: 102750
	});

	// Create map
	map = new Map("map", mapSettings);

	//assign spatial reference
	/*map.spatialReference = new SpatialReference({
		wkid: defaultWKID
	});*/


	/*
	.___  ___.      ___      .______          ______   .__   __. 
	|   \/   |     /   \     |   _  \        /  __  \  |  \ |  | 
	|  \  /  |    /  ^  \    |  |_)  |      |  |  |  | |   \|  | 
	|  |\/|  |   /  /_\  \   |   ___/       |  |  |  | |  . `  | 
	|  |  |  |  /  _____  \  |  |     __    |  `--'  | |  |\   | 
	|__|  |__| /__/     \__\ | _|    (__)    \______/  |__| \__| 

	*/

	map.on("layers-add-result", function(results) {
		toc = new TOC({
			map: map,
			layerInfos: [
			//TMP
			/*{
				layer: imgLayer2015,
				title: "Aerials 2015",
				slider: true,
				noLayers: true
					//collapsed: false, // whether this root layer should be collapsed initially, default false.
					//slider: false // whether to display a transparency slider.
			}, {
				layer: imgLayer2010,
				title: "Aerials 2010",
				slider: true,
				noLayers: true
					//collapsed: false, // whether this root layer should be collapsed initially, default false.
					//slider: false // whether to display a transparency slider.
			},*/
			{
				layer: mainMapLayer,
				title: "Layers",
				autoToggle: false
			}],
			style: 'inline'
		}, 'legend-panel');
		toc.startup();

	});

	//TMP
	map.addLayers([mainMapLayer]);//[imgLayer2015, imgLayer2010, mainMapLayer]);


	map.on("load", function() {

		var fplate = new InfoTemplate();
		fplate.setTitle("Parcel");

		/*var search = new Search({
			sources: [{
				featureLayer: new FeatureLayer('https://ags.agdmaps.com/arcgis/rest/services/MonongaliaWV/MapServer/142'),
				enableLabel: false,
				enableHighlight: false,
				outFields: ['own1', 'own2', 'dmp', 'legal1','OBJECTID'],
				displayField: "own1",
				searchFields: ['own1', 'own2', 'dmp', 'legal1'],
				suggestionTemplate: "${own1}: ${dmp}",
				name: "Parcels",
				placeholder: "Wade Richard",
				enableSuggestions: true 
			}],
			map: map
		}, "searchbar");

		search.startup();*/


		setupNavigation();
		toggleSidePannel();
		setToolTips();
		getDistricts();
		CreateQueries();


		measureDialog = new dijit.Dialog({
			id: "measureDialog",
			onHide: function() {
				toggleSidePannel();
				activeTool = "none";
				map.graphics.clear();
				measurementWidget.setTool(measurementWidget.getTool().toolName, false);
			}
		});

		measureDialog.containerNode.innerHTML = '<div id="measure-panel"></div>';

		measurementWidget = new Measurement({
			map: map
		}, measureDialog.containerNode.children[0]);

		measurementWidget.startup();

		//fx.fadeOut({node:'loading'}).play();
		//var element = document.getElementById("loading");
		//element.parentNode.removeChild(element);


		var parid = getParcelFromUrl(document.location.href);
		selectParcel(parid);

		lastMapCenter = map.getCenter();
	});

	map.on('extent-change', function(args) {
		lastMapCenter = map.getCenter();
	});

	map.on('resize', function(args) {
		map.centerAt(lastMapCenter);
	});

	map.on('mouse-move', function(args) {
		if (activeTool == 'coordinates') {
			var mapPoint, msg, notify;

			notify = dojo.byId('coords');

			if (notify == null || notify == undefined) {
				return;
			}

			mapPoint = map.toMap(new ScreenPoint(args.clientX, args.clientY));
			msg = pad("<b>X: </b>" + Math.round(mapPoint.x * 100) / 100, 10) + " , " + pad("<b>Y: </b>" + Math.round(mapPoint.y * 100) / 100, 10);
			dojo.style(dojo.byId('coords'), 'color', 'black');
			notify.innerHTML = msg;
		}
	});

	map.on("click", function(e) {
		if (activeTool == 'measure') {
			return;
		}
		var query = new Query();
		query.geometry = e.mapPoint;
		queryPoint = e.mapPoint;
		query.outFields = ['*']
		var deferred = parcelLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, selectionHandler);

	});

	dojo.connect(dom.byId("side-panel-closer"), "onclick", function(obj) {
		toggleSidePannel();
	});

	dojo.connect(dom.byId("tools-dongle"), "onclick", function() {
		toggleSidePannel();
	});

	dojo.connect(window, "onresize", setMapWidth);

	/*
	     _______. _______  __       _______   ______ .___________. __    ______   .__   __.  __    __       ___      .__   __.  _______   __       _______ .______      
	    /       ||   ____||  |     |   ____| /      ||           ||  |  /  __  \  |  \ |  | |  |  |  |     /   \     |  \ |  | |       \ |  |     |   ____||   _  \     
	   |   (----`|  |__   |  |     |  |__   |  ,----'`---|  |----`|  | |  |  |  | |   \|  | |  |__|  |    /  ^  \    |   \|  | |  .--.  ||  |     |  |__   |  |_)  |    
	    \   \    |   __|  |  |     |   __|  |  |         |  |     |  | |  |  |  | |  . `  | |   __   |   /  /_\  \   |  . `  | |  |  |  ||  |     |   __|  |      /     
	.----)   |   |  |____ |  `----.|  |____ |  `----.    |  |     |  | |  `--'  | |  |\   | |  |  |  |  /  _____  \  |  |\   | |  '--'  ||  `----.|  |____ |  |\  \----.
	|_______/    |_______||_______||_______| \______|    |__|     |__|  \______/  |__| \__| |__|  |__| /__/     \__\ |__| \__| |_______/ |_______||_______|| _| `._____|
	                                                                                                                                                                    
	*/
	function selectionHandler(selection) {

		var featObj = null;
		if (selection.hasOwnProperty("features")) {
			featObj = selection.features[0];
		} else {
			if (selection.length > 0) {
				featObj = selection[0];
			}
		}
		if (featObj != null) {
			currentFeatures = [];
			currentFeatures.push({
				layerId: featObj._layer.layerId,
				geometry: featObj.geometry,
				attributes: featObj.attributes
			});

			var parcelPoly = featObj.geometry;
			parcelPoly.spatialReference = map.spatialReference;
			var center = queryPoint == undefined ? parcelPoly.getCentroid() : queryPoint;
			queryPoint = undefined;
			map.infoWindow.setFeatures([featObj]);
			map.infoWindow.show(center);
			map.setExtent(parcelPoly.getExtent().expand(2.5), true);
			map.centerAt(center);

			var parid = featObj.attributes["dmp"];
			//Refresh the URL with the currently selected parcel
			if (typeof history.pushState !== "undefined") {
				window.history.pushState(null, null, "?parid=" + featObj.attributes.dmp);
			}
		}
	}

	/*
	.___________.  ______     _______   _______  __       _______     _______. __   _______   _______ .______      ___      .__   __. .__   __.  _______  __      
	|           | /  __  \   /  _____| /  _____||  |     |   ____|   /       ||  | |       \ |   ____||   _  \    /   \     |  \ |  | |  \ |  | |   ____||  |     
	`---|  |----`|  |  |  | |  |  __  |  |  __  |  |     |  |__     |   (----`|  | |  .--.  ||  |__   |  |_)  |  /  ^  \    |   \|  | |   \|  | |  |__   |  |     
	    |  |     |  |  |  | |  | |_ | |  | |_ | |  |     |   __|     \   \    |  | |  |  |  ||   __|  |   ___/  /  /_\  \   |  . `  | |  . `  | |   __|  |  |     
	    |  |     |  `--'  | |  |__| | |  |__| | |  `----.|  |____.----)   |   |  | |  '--'  ||  |____ |  |     /  _____  \  |  |\   | |  |\   | |  |____ |  `----.
	    |__|      \______/   \______|  \______| |_______||_______|_______/    |__| |_______/ |_______|| _|    /__/     \__\ |__| \__| |__| \__| |_______||_______|
	                                                                                                                                                              
	*/

	function toggleSidePannel() {
		var panelWidth = parseInt(document.getElementById("display-panel").style.width);
		if (panelWidth > 0) {
			fx.animateProperty({
				node: "display-panel",
				properties: {
					width: 0
				},
				onEnd: function() {
					setMapWidth();
					fx.fadeIn({
						node: "tools-dongle"
					}).play();
				}
			}).play();
		} else {
			fx.animateProperty({
				node: "display-panel",
				properties: {
					width: function() {
						var nwidth = window.innerWidth * .25;
						nwidth = nwidth >= 320 ? nwidth : 320;
						return nwidth;
					}
				},
				onEnd: function() {
					setMapWidth();
					fx.fadeOut({
						node: "tools-dongle"
					}).play();
				}
			}).play();
		}
	}

	/*
	     _______. _______ .___________..___  ___.      ___      .______   ____    __    ____  __   _______  .___________. __    __  
	    /       ||   ____||           ||   \/   |     /   \     |   _  \  \   \  /  \  /   / |  | |       \ |           ||  |  |  | 
	   |   (----`|  |__   `---|  |----`|  \  /  |    /  ^  \    |  |_)  |  \   \/    \/   /  |  | |  .--.  |`---|  |----`|  |__|  | 
	    \   \    |   __|      |  |     |  |\/|  |   /  /_\  \   |   ___/    \            /   |  | |  |  |  |    |  |     |   __   | 
	.----)   |   |  |____     |  |     |  |  |  |  /  _____  \  |  |         \    /\    /    |  | |  '--'  |    |  |     |  |  |  | 
	|_______/    |_______|    |__|     |__|  |__| /__/     \__\ | _|          \__/  \__/     |__| |_______/     |__|     |__|  |__| 
	                                                                                                                                
	*/

	function setMapWidth() {
		var panWidth = parseInt(document.getElementById("display-panel").style.width);
		if (panWidth > 0) {
			document.getElementById('map').style.width = (document.documentElement.clientWidth - panWidth) + "px";
		} else {
			document.getElementById('map').style.width = document.documentElement.clientWidth + "px";
		}
		var resizeTimer = setTimeout(function() {
			map.resize();
			map.reposition();
		}, 500);
	}

	/*
	     _______. _______ .___________.___________.  ______     ______    __      .___________. __  .______     _______.
	    /       ||   ____||           |           | /  __  \   /  __  \  |  |     |           ||  | |   _  \   /       |
	   |   (----`|  |__   `---|  |----`---|  |----`|  |  |  | |  |  |  | |  |     `---|  |----`|  | |  |_)  | |   (----`
	    \   \    |   __|      |  |        |  |     |  |  |  | |  |  |  | |  |         |  |     |  | |   ___/   \   \    
	.----)   |   |  |____     |  |        |  |     |  `--'  | |  `--'  | |  `----.    |  |     |  | |  |   .----)   |   
	|_______/    |_______|    |__|        |__|      \______/   \______/  |_______|    |__|     |__| | _|   |_______/    
	                                                                                                                    
	*/

	function setToolTips() {
		new Tooltip({
			connectId: "tools-dongle",
			label: "Tools"
		});

		new Tooltip({
			connectId: 'side-panel-closer',
			label: "Hide Tools"
		});
	}
	/*
	     _______. _______ .___________. __    __  .______   .__   __.      ___   ____    ____  __    _______      ___   .___________. __    ______   .__   __. 
	    /       ||   ____||           ||  |  |  | |   _  \  |  \ |  |     /   \  \   \  /   / |  |  /  _____|    /   \  |           ||  |  /  __  \  |  \ |  | 
	   |   (----`|  |__   `---|  |----`|  |  |  | |  |_)  | |   \|  |    /  ^  \  \   \/   /  |  | |  |  __     /  ^  \ `---|  |----`|  | |  |  |  | |   \|  | 
	    \   \    |   __|      |  |     |  |  |  | |   ___/  |  . `  |   /  /_\  \  \      /   |  | |  | |_ |   /  /_\  \    |  |     |  | |  |  |  | |  . `  | 
	.----)   |   |  |____     |  |     |  `--'  | |  |      |  |\   |  /  _____  \  \    /    |  | |  |__| |  /  _____  \   |  |     |  | |  `--'  | |  |\   | 
	|_______/    |_______|    |__|      \______/  | _|      |__| \__| /__/     \__\  \__/     |__|  \______| /__/     \__\  |__|     |__|  \______/  |__| \__| 
	                                                                                                                                                           
	*/

	function setupNavigation() {

		navToolbar = new Navigation(map, 'navToolbar');

		var tools = [];

		tools.push(new dijit.form.Button({
			label: "Zoom In",
			showLabel: false,
			id: "zoomin",
			iconClass: "fa fa-search-plus fa-2x",
			persist: true,
			onClick: function() {
				changeTool('zoomin');
			}
		}));

		tools.push(new dijit.form.Button({
			label: "Zoom Out",
			showLabel: false,
			id: "zoomout",
			iconClass: "fa fa-search-minus fa-2x",
			persist: true,
			onClick: function() {
				changeTool('zoomout');
			}
		}));

		tools.push(new dijit.form.Button({
			label: "Full Extent",
			showLabel: false,
			id: "zoomfullext",
			iconClass: "fa fa-globe fa-2x",
			persist: false,
			onClick: function() {
				changeTool('zoomextent');
			}
		}));

		tools.push(new dijit.form.Button({
			label: "Zoom Prev",
			showLabel: false,
			id: "zoomprev",
			iconClass: 'fa fa-arrow-circle-o-left fa-2x',
			persist: false,
			onClick: function() {
				changeTool('zoom_prev');
			}
		}));

		tools.push(dijit.form.Button({
			label: "Zoom Next",
			showLabel: false,
			id: "zoomnext",
			iconClass: 'fa fa-arrow-circle-o-right fa-2x',
			persist: false,
			onClick: function() {
				changeTool('zoom_next');
			}
		}));

		tools.push(dijit.form.Button({
			label: "Pan",
			showLabel: false,
			id: "pan",
			iconClass: 'fa fa-hand-paper-o fa-2x',
			persist: true,
			onClick: function() {
				changeTool('pan');
			}
		}));

		tools.push(dijit.form.Button({
			label: "Print",
			showLabel: false,
			id: "print",
			iconClass: 'fa fa-print fa-2x',
			persist: true,
			onClick: function() {
				ExePrint();
			}
		}));


		tools.push(dijit.form.Button({
			label: "Measure",
			showLabel: false,
			id: "measure",
			iconClass: 'rulerIcon',
			persist: true,
			onClick: function() {
				toggleSidePannel();
				measureDialog.show();
				activeTool = "measure";
			}
		}));

		tools.push(dijit.form.ToggleButton({
			label: "Coordinates",
			showLabel: false,
			id: "coordinates",
			iconClass: 'fa fa-crosshairs fa-2x',
			persist: true,
			checked: false,
			onChange: function(val) {
				if (this.checked) {
					activeTool = "coordinates";
				} else {
					activeTool = "none";
					var notify = dojo.byId('coords');

					if (notify == null || notify == undefined) {
						return;
					}
					notify.innerHTML = "";
				}

			}
		}));

		for (var j = 0; j < tools.length; j += 1) {
			tools[j].placeAt(dojo.byId("navToolbar"));
		}
	}

	/*
	  ______  __    __       ___      .__   __.   _______  _______ .___________.  ______     ______    __      
	 /      ||  |  |  |     /   \     |  \ |  |  /  _____||   ____||           | /  __  \   /  __  \  |  |     
	|  ,----'|  |__|  |    /  ^  \    |   \|  | |  |  __  |  |__   `---|  |----`|  |  |  | |  |  |  | |  |     
	|  |     |   __   |   /  /_\  \   |  . `  | |  | |_ | |   __|      |  |     |  |  |  | |  |  |  | |  |     
	|  `----.|  |  |  |  /  _____  \  |  |\   | |  |__| | |  |____     |  |     |  `--'  | |  `--'  | |  `----.
	 \______||__|  |__| /__/     \__\ |__| \__|  \______| |_______|    |__|      \______/   \______/  |_______|
	                                                                                                           
	*/
	function changeTool(toolId) {
		switch (toolId) {
			case 'zoomin':
				navToolbar.activate(esri.toolbars.Navigation.ZOOM_IN);
				Notify('notify', "Current tool Zoom In");
				break;
			case 'zoomout':
				navToolbar.activate(esri.toolbars.Navigation.ZOOM_OUT);
				Notify('notify', "Current tool Zoom Out");
				break;
			case 'pan':
				navToolbar.activate(esri.toolbars.Navigation.PAN);
				Notify('notify', "Current tool Pan");
				break;
			case 'zoom_prev':
				navToolbar.zoomToPrevExtent();
				break;
			case 'zoom_next':
				navToolbar.zoomToNextExtent();
				break;
			case 'identifyTool-button':
				navToolbar.deactivate();
				Notify('notify', "Current tool Identify");
				break;
			case 'zoomextent':
				navToolbar.zoomToFullExtent();
				break;
			case 'hyperlink':
				navToolbar.deactivate();
				Notify('notify', "Current tool Hyperlink");
				break;
			case 'gotoxy-dailog-button':
				Notify('notify', 'Current tool GoToXY');
				widgets.GoToXY.ShowDialog();
				break;
		}
	}




	/*
	  _______  _______ .___________..______      ___      .______        ______  _______  __       _______ .______        ______   .___  ___.  __    __  .______       __      
	 /  _____||   ____||           ||   _  \    /   \     |   _  \      /      ||   ____||  |     |   ____||   _  \      /  __  \  |   \/   | |  |  |  | |   _  \     |  |     
	|  |  __  |  |__   `---|  |----`|  |_)  |  /  ^  \    |  |_)  |    |  ,----'|  |__   |  |     |  |__   |  |_)  |    |  |  |  | |  \  /  | |  |  |  | |  |_)  |    |  |     
	|  | |_ | |   __|      |  |     |   ___/  /  /_\  \   |      /     |  |     |   __|  |  |     |   __|  |      /     |  |  |  | |  |\/|  | |  |  |  | |      /     |  |     
	|  |__| | |  |____     |  |     |  |     /  _____  \  |  |\  \----.|  `----.|  |____ |  `----.|  |     |  |\  \----.|  `--'  | |  |  |  | |  `--'  | |  |\  \----.|  `----.
	 \______| |_______|    |__|     | _|    /__/     \__\ | _| `._____| \______||_______||_______||__|     | _| `._____| \______/  |__|  |__|  \______/  | _| `._____||_______|

	*/
	function getParcelFromUrl(url) {
		var urlObject = urlUtils.urlToObject(url);
		if (urlObject.query && urlObject.query.parid) {
			return urlObject.query.parid;
		} else {
			return null;
		}
	}

	/*
		select parcel from the feature layer by creating a query to look for the input parcel id
	     _______. _______  __       _______   ______ .___________..______      ___      .______        ______  _______  __      
	    /       ||   ____||  |     |   ____| /      ||           ||   _  \    /   \     |   _  \      /      ||   ____||  |     
	   |   (----`|  |__   |  |     |  |__   |  ,----'`---|  |----`|  |_)  |  /  ^  \    |  |_)  |    |  ,----'|  |__   |  |     
	    \   \    |   __|  |  |     |   __|  |  |         |  |     |   ___/  /  /_\  \   |      /     |  |     |   __|  |  |     
	.----)   |   |  |____ |  `----.|  |____ |  `----.    |  |     |  |     /  _____  \  |  |\  \----.|  `----.|  |____ |  `----.
	|_______/    |_______||_______||_______| \______|    |__|     | _|    /__/     \__\ | _| `._____| \______||_______||_______|

	*/
	function selectParcel(parid) {
		if (parid) {
			var query = new Query('https://ags.agdmaps.com/arcgis/rest/services/MonongaliaWV/MapServer/' + parcelLayerIDX);
			query.where = "dmp = '" + parid.replace(/^0/,'') + "'";
			query.outFields  = ['*'];
			query.returnGeometry = true;
			query.outSpatialReference = map.spatialReference;
			var deferred = parcelLayer.queryFeatures(query, selectionHandler);
		}
	}

	/*
	  _______  _______ .___________. _______   __       _______.___________..______       __    ______ .___________.    _______.
	 /  _____||   ____||           ||       \ |  |     /       |           ||   _  \     |  |  /      ||           |   /       |
	|  |  __  |  |__   `---|  |----`|  .--.  ||  |    |   (----`---|  |----`|  |_)  |    |  | |  ,----'`---|  |----`  |   (----`
	|  | |_ | |   __|      |  |     |  |  |  ||  |     \   \       |  |     |      /     |  | |  |         |  |        \   \    
	|  |__| | |  |____     |  |     |  '--'  ||  | .----)   |      |  |     |  |\  \----.|  | |  `----.    |  |    .----)   |   
	 \______| |_______|    |__|     |_______/ |__| |_______/       |__|     | _| `._____||__|  \______|    |__|    |_______/    

	*/

	function getDistricts() {
		var distQueryTask = new QueryTask('https://ags.agdmaps.com/arcgis/rest/services/MonongaliaWV/MapServer/153');
		var dquery = new Query();
		dquery.outFields = ["dist","Name"];
		dquery.returnGeometry = false;
		dquery.returnDistinctValues = true;
		dquery.where = 'OBJECTID > -1';
		dquery.outSpatialReference = map.spatialReference;
		distQueryTask.on("complete", function(results1) {
			var results = results1.featureSet.features.sort(function(obj1, obj2) {
				return obj1.attributes.dist - obj2.attributes.dist;
			});
			districts.push(['-','Select'])
			arrayUtils.forEach(results, function(feat) {
				if (feat.attributes.dist != null) {
					//console.log(feat.attributes.dist);
					districts.push([feat.attributes.dist,feat.attributes.Name]);
				}
			});
			renderSearchPanel();
		});
		distQueryTask.execute(dquery);
	}

	/*
	  _______  _______ .___________..___  ___.      ___      .______     _______.
	 /  _____||   ____||           ||   \/   |     /   \     |   _  \   /       |
	|  |  __  |  |__   `---|  |----`|  \  /  |    /  ^  \    |  |_)  | |   (----`
	|  | |_ | |   __|      |  |     |  |\/|  |   /  /_\  \   |   ___/   \   \    
	|  |__| | |  |____     |  |     |  |  |  |  /  _____  \  |  |   .----)   |   
	 \______| |_______|    |__|     |__|  |__| /__/     \__\ | _|   |_______/    

	*/
	function getMaps(dist) {
		var mapQueryTask = new QueryTask(agsBase + parcelLayerIDX);
		var mquery = new Query();
		mquery.outFields = ["map"];
		mquery.returnGeometry = false;
		mquery.where = "dist = '" + dist + "'";
		mquery.returnDistinctValues = true;
		mquery.outSpatialReference = map.spatialReference;
		mapQueryTask.on("complete", function(results1) {
			var results = results1.featureSet.features.sort(natSortMap); //function(obj1,obj2){return obj1.attributes.map - obj2.attributes.map;});
			dojo.byId("sel-map").innerHTML = "";
			var selmap = document.getElementById("sel-map");

			var opt = document.createElement("option");
			opt.text = "Select";
			selmap.add(opt);

			arrayUtils.forEach(results, function(feat) {
				if (feat.attributes.map != null) {
					var option = document.createElement("option");
					option.text = feat.attributes.map;
					selmap.add(option);
				}
			});
		});
		mapQueryTask.execute(mquery);
	}

	/*
	  _______  _______ .___________..______      ___      .______        ______  __       _______     _______.
	 /  _____||   ____||           ||   _  \    /   \     |   _  \      /      ||  |     |   ____|   /       |
	|  |  __  |  |__   `---|  |----`|  |_)  |  /  ^  \    |  |_)  |    |  ,----'|  |     |  |__     |   (----`
	|  | |_ | |   __|      |  |     |   ___/  /  /_\  \   |      /     |  |     |  |     |   __|     \   \    
	|  |__| | |  |____     |  |     |  |     /  _____  \  |  |\  \----.|  `----.|  `----.|  |____.----)   |   
	 \______| |_______|    |__|     | _|    /__/     \__\ | _| `._____| \______||_______||_______|_______/    

	*/
	function getParcles(dist, map) {
		var parQueryTask = new QueryTask(agsBase + parcelLayerIDX);
		var pquery = new Query();
		pquery.outFields = ["parcel"];
		pquery.returnGeometry = false;
		pquery.where = "dist = '" + dist + "' and map = '" + map + "'";
		pquery.outSpatialReference = map.spatialReference;
		parQueryTask.on("complete", function(results1) {
			var results = results1.featureSet.features.sort(function(obj1, obj2) {
				return obj1.attributes.parcel - obj2.attributes.parcel;
			});
			dojo.byId("sel-parcel").innerHTML = "";
			var selpar = document.getElementById("sel-parcel");

			var opt = document.createElement("option");
			opt.text = "Select";
			selpar.add(opt);

			arrayUtils.forEach(results, function(feat) {
				if (feat.attributes.parcel != null) {
					var option = document.createElement("option");
					option.text = feat.attributes.parcel;
					selpar.add(option);
				}
			});
		});
		parQueryTask.execute(pquery);
	}
	/*
	.______       _______ .__   __.  _______   _______ .______          _______. _______     ___      .______        ______  __    __  .______      ___      .__   __.  _______  __      
	|   _  \     |   ____||  \ |  | |       \ |   ____||   _  \        /       ||   ____|   /   \     |   _  \      /      ||  |  |  | |   _  \    /   \     |  \ |  | |   ____||  |     
	|  |_)  |    |  |__   |   \|  | |  .--.  ||  |__   |  |_)  |      |   (----`|  |__     /  ^  \    |  |_)  |    |  ,----'|  |__|  | |  |_)  |  /  ^  \    |   \|  | |  |__   |  |     
	|      /     |   __|  |  . `  | |  |  |  ||   __|  |      /        \   \    |   __|   /  /_\  \   |      /     |  |     |   __   | |   ___/  /  /_\  \   |  . `  | |   __|  |  |     
	|  |\  \----.|  |____ |  |\   | |  '--'  ||  |____ |  |\  \----.----)   |   |  |____ /  _____  \  |  |\  \----.|  `----.|  |  |  | |  |     /  _____  \  |  |\   | |  |____ |  `----.
	| _| `._____||_______||__| \__| |_______/ |_______|| _| `._____|_______/    |_______/__/     \__\ | _| `._____| \______||__|  |__| | _|    /__/     \__\ |__| \__| |_______||_______|

	*/
	function renderSearchPanel() {
		var rendered = '<span>Dist-Map-Parcel:<br /><span id="dmp-display" class="grey"></span></span><br /><span>District: <br /><select id="sel-dist">';

		arrayUtils.forEach(districts, function(dist) {
			rendered += '<option value="' + dist[0] + '">' + dist[1] + '</option>';
		});
		rendered += '</select></span><br />';

		rendered += '<span>Map: <br /><select id="sel-map"></select></span><br /><span>Parcel: <br /><select id="sel-parcel"></select><span>';

		dojo.byId('search-panel').innerHTML = rendered;
		//dojo.style(dojo.byId('search-panel'), "display", "block");

		getMaps(dojo.byId("sel-dist").value);

		dojo.connect(dojo.byId('sel-dist'), 'change', function(evt) {
			getMaps(this.value);
			dojo.byId('dmp-display').innerHTML = this.value;
		});

		dojo.connect(dojo.byId('sel-map'), 'change', function(evt) {
			getParcles(dojo.byId("sel-dist").value, this.value);
			dojo.byId('dmp-display').innerHTML = dojo.byId("sel-dist").value + '-' + this.value;
		});

		dojo.connect(dojo.byId('sel-parcel'), 'change', function(evt) {
			selectParcel(dojo.byId("sel-dist").value + '-' + dojo.byId("sel-map").value + '-' + this.value);
			dojo.byId('dmp-display').innerHTML = dojo.byId("sel-dist").value + '-' + dojo.byId("sel-map").value + '-' + this.value;
		});
	}
	/*
	.__   __.      ___   .___________.    _______.  ______   .______     .___________..___  ___.      ___      .______   
	|  \ |  |     /   \  |           |   /       | /  __  \  |   _  \    |           ||   \/   |     /   \     |   _  \  
	|   \|  |    /  ^  \ `---|  |----`  |   (----`|  |  |  | |  |_)  |   `---|  |----`|  \  /  |    /  ^  \    |  |_)  | 
	|  . `  |   /  /_\  \    |  |        \   \    |  |  |  | |      /        |  |     |  |\/|  |   /  /_\  \   |   ___/  
	|  |\   |  /  _____  \   |  |    .----)   |   |  `--'  | |  |\  \----.   |  |     |  |  |  |  /  _____  \  |  |      
	|__| \__| /__/     \__\  |__|    |_______/     \______/  | _| `._____|   |__|     |__|  |__| /__/     \__\ | _|      
	*/
	function natSortMap(as, bs) {
		var a, b, a1, b1, i = 0,
			L, rx = /(\d+)|(\D+)/g,
			rd = /\d/;
		if (isFinite(as.attributes.map) && isFinite(bs.attributes.map)) return as.attributes.map - bs.attributes.map;
		a = String(as.attributes.map).toLowerCase();
		b = String(bs.attributes.map).toLowerCase();
		if (a === b) return 0;
		if (!(rd.test(a) && rd.test(b))) return a > b ? 1 : -1;
		a = a.match(rx);
		b = b.match(rx);
		L = a.length > b.length ? b.length : a.length;
		while (i < L) {
			a1 = a[i];
			b1 = b[i++];
			if (a1 !== b1) {
				if (isFinite(a1) && isFinite(b1)) {
					if (a1.charAt(0) === "0") a1 = "." + a1;
					if (b1.charAt(0) === "0") b1 = "." + b1;
					return a1 - b1;
				} else return a1 > b1 ? 1 : -1;
			}
		}
		return a.length - b.length;
	}
	/*
	.______      ___       _______  
	|   _  \    /   \     |       \ 
	|  |_)  |  /  ^  \    |  .--.  |
	|   ___/  /  /_\  \   |  |  |  |
	|  |     /  _____  \  |  '--'  |
	| _|    /__/     \__\ |_______/ 

	*/
	function pad(str, len, pad, dir) {

		if (typeof(len) == "undefined") {
			var len = 0;
		}
		if (typeof(pad) == "undefined") {
			var pad = ' ';
		}
		if (typeof(dir) == "undefined") {
			var dir = STR_PAD_RIGHT;
		}

		if (len + 1 >= str.length) {

			switch (dir) {

				case STR_PAD_LEFT:
					str = Array(len + 1 - str.length).join(pad) + str;
					break;

				case STR_PAD_BOTH:
					var right = Math.ceil((padlen = len - str.length) / 2);
					var left = padlen - right;
					str = Array(left + 1).join(pad) + str + Array(right + 1).join(pad);
					break;

				default:
					str = str + Array(len + 1 - str.length).join(pad);
					break;

			} // switch

		}

		return str;

	}

	function QuoteEncoding(strvalue) {
		var strquotes = /(')/g;
		return strvalue.replace(strquotes, "%");
	};

	function sortBy(field, reverse, primer) {
		var key = function(x) {
			return primer ? primer(x[field]) : x[field]
		};

		return function(a, b) {
			var A = key(a),
				B = key(b);
			return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1, 1][+!!reverse];
		}
	};

	Array.prototype.contains = function(obj) {
		var i;
		i = this.length;
		while (i--) {
			if (this[i] === obj) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @function ClearInputs
	 *
	 * @param {String} resultDivId  id of the div that contains the search results
	 * @param {String} searchBoxId  id of the textbox widget that the search uses for input
	 */
	ClearInputs = function(resultDivId, searchBoxId) {
		var resultDiv = document.getElementById(resultDivId);
		resultDiv.innerHTML = "";
		var searchBox = document.getElementById(searchBoxId);
		searchBox.value = "";
	};


	function SortFeatures(field, reverse) {
		reverse = reverse && reverse || false;
		return function(a, b) {
			var A = a.attributes[field],
				B = b.attributes[field];
			return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1, 1][+!reverse];
		};
	};

	function CreateFeatureGraphic(feature) {
		var type, symbol, graphic;
		type = feature.geometry.type;

		switch (type) {
			case 'point':
			case 'multipoint':
				symbol = symbols['DefaultPointSymbol'];
				break;
			case 'line':
			case 'polyline':
				symbol = symbols['DefaultLineSymbol'];
				break;
			case 'polygon':
				symbol = symbols['DefaultPolygonSymbol'];
				break;
		}

		graphic = new esri.Graphic(feature.geometry, symbol, feature.attributes, feature.infoTemplate);

		currentGraphic = graphic;

		return graphic;
	}

	ZoomToFeature = function(fid) {
		var feature, mtch, id, qid;

		mtch = fid.match(/(([query]{5})(\d+)(-)(\d+))/);

		try {

			if (mtch != null) {
				id = mtch[5]
				qid = mtch[3]
			} else {
				id = fid.replace('feature', '');
				qid = null;
			}

			if (qid != null) {
				feature = featureCache['query' + qid][id];
			} else {
				feature = currentFeatures[id];
			}

			if (feature == null || feature == 'undefined') {
				Notify('error', 'Cannot Locate Feature');
			} else {
				if (feature.hasOwnProperty('location')) {
					feature.geometry = feature.location;
				}
				feature.geometry.spatialReference = map.spatialReference;
				currentGraphic = CreateFeatureGraphic(feature);
				currentFeatures = [{
					feature: feature
				}];
				map.graphics.clear();
				map.graphics.add(currentGraphic);
				// if the graphic is a point the extent will be zero and you can't zoom to it
				if (currentGraphic._extent.getWidth() == 0) {
					var ext = currentGraphic._extent;
					// make a new extent 200 units wide and tall around the point.
					currentGraphic._extent.update(ext.xmin - 100, ext.ymin - 100, ext.xmax + 100, ext.ymax + 100, ext.spatialReference);
					map.setExtent(currentGraphic._extent.expand(2.5), true);
					map.centerAt(currentGraphic._extent.getCenter());
				} else {
					map.setExtent(currentGraphic.geometry.getExtent().expand(2.5), true);
					map.centerAt(currentGraphic.geometry.getCentroid());
				}

				//map.setExtent(currentGraphic._extent);

			}
		} catch (e) {
			Notify('error', e);
		}
	}

	function ExePrint() {
		var currentIdentifyAttributes, currentIdentifyGeom, currentIdentifyMatrix, printInfo, form;

		printInfo = {};

		printInfo.bounds = map.extent;
		printInfo.height = map.height;
		printInfo.width = map.width;
		printInfo.layers = [];
		printInfo.title = printSettings.title;
		printInfo.subtitle = printSettings.subtitle;
		printInfo.disclamer = printSettings.disclamer;

		// Check the layer id from the last identify to see if it is in the printDefs Object
		// if it's there use the field names and order from it.  else use them all
		if (currentFeatures.length > 0) {
			var layerId = undefined;

			if (currentFeatures[0].hasOwnProperty('layerId')) {
				layerId = currentFeatures[0].layerId.toString();
			}


			if (layerId != undefined || layerId != 'undefined') {
				if (printSettings.printDefs.hasOwnProperty(layerId)) {
					printInfo.attribues = {};
					for (var x = 0; x < printSettings.printDefs[layerId].length; x += 1) {
						var name = printSettings.printDefs[layerId][x];
						var split = name.split('.');
						if (split.length > 1) {
							name = split[1];
						}
						printInfo.attribues[name] = currentFeatures[0].attributes[name];
					}
				} else {
					printInfo.attribues = currentFeatures[0].attributes;
				}
			} else {
				printInfo.attribues = currentFeatures[0].attributes;
			}
		} else {
			printInfo.attribues = {};
		}

		printInfo.path = [];


		if (map.graphics._div.children.length > 0) {
			if (map.graphics._div.children.length > 0) {
				for (var k = 0; k < map.graphics._div.children.length; k += 1) {
					if (map.graphics._div.children[k].shape.path != null || map.graphics._div.children[k].shape.path != undefined) {
						printInfo.path.push(map.graphics._div.children[k].shape.path);
					}
				}
			}
		}

		printInfo.matrix = map.graphics._div.getTransform();

		for (var i = 0; i < map.layerIds.length; i += 1) {
			var layerinfo = {};
			var lyr = map.getLayer(map.layerIds[i]);

			layerinfo.serviceURL = lyr.url;

			var hasVisibleLayers = false;

			if (lyr.declaredClass == 'esri.layers.WMSLayer') {
				layerinfo.serviceType = 'WMS';
				layerinfo.layers = [];

				if (lyr.visible) {
					hasVisibleLayers = true;
					for (var j = 0; j < lyr.layerInfos.length; j += 1) {
						layerinfo.layers.push(String(lyr.layerInfos[j].name));
					}
				}
				if (hasVisibleLayers) {
					printInfo.layers.push(layerinfo);
				}
			} else if (lyr.visible) {
				if (lyr.declaredClass == 'esri.layers.ArcGISDynamicMapServiceLayer' || lyr.declaredClass == 'esri.layers.ArcGISTiledMapServiceLayer' || lyr.declaredClass == 'esri.layers.ArcGISImageServiceLayer') {
					layerinfo.serviceType = lyr.declaredClass.replace('esri.layers.', '').replace('MapServiceLayer', '');
					if (lyr.declaredClass == 'esri.layers.ArcGISImageServiceLayer') {
						layerinfo.serviceURL += "/exportImage/";
					} else {
						layerinfo.serviceURL += "/export/";
					}
					layerinfo.layers = [];
					if (lyr.layerInfos) {
						for (var h = 0; h < lyr.layerInfos.length; h += 1) {
							var lyrInfoH = lyr.layerInfos[h];
							if (lyrInfoH.visible) {
								if (lyrInfoH.subLayerIds != null || lyrInfoH.subLayerIds != undefined) {

									if (lyrInfoH.subLayerIds.length > 0) {
										for (var u = 0; u < lyrInfoH._subLayerInfos.length; u += 1) {
											var sublyrInfoH = lyrInfoH._subLayerInfos[u];
											if (sublyrInfoH.visible) {
												layerinfo.layers.push(String(sublyrInfoH.id));
												hasVisibleLayers = true;
											}
										}
									} else {
										if (lyrInfoH.parentLayerId < 0) {
											if (lyrInfoH.visible) {
												layerinfo.layers.push(String(lyrInfoH.id));
												hasVisibleLayers = true;
											}
										}
									}
								}
							}
						}
					}
					if (layerinfo.serviceType == 'ArcGISDynamic') {
						if (hasVisibleLayers) {
							printInfo.layers.push(layerinfo);
						}
					} else {
						printInfo.layers.push(layerinfo);
					}
				}
			}
		}


		form = document.createElement("form");
		form.setAttribute("method", "post");
		//form.setAttribute("target","printframe");
		form.setAttribute("action", printSettings.url);

		// setting form target to a window named 'formresult'
		form.setAttribute("target", "formresult");

		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("name", "prntinfo");
		hiddenField.setAttribute("value", JSON.stringify(printInfo));
		form.appendChild(hiddenField);
		document.body.appendChild(form);

		// creating the 'formresult' window with custom features prior to submitting the form
		window.open('test.html', 'formresult');

		form.submit();

	}

	/**
	 * @function CreateQueries
	 * @description Create Queries from json
	 * @param {Object} obj  json object
	 */
	function CreateQueries() {
		//define queries as array
		var queries = [];

		for (var i = 0; i < Queries.length; i += 1) {
			var queryDef, queryTask, searchTabs, queryHtml, idPrefix;
			//get queryDef item number " i "
			queryDef = Queries[i];

			idPrefix = i.toString();

			searchTabs = dijit.byId("searchTabs");
			queryHtml = '<br /><label for="#SearchBoxId">#SearchBoxLabel:</label><br /><input id="#SearchBoxId" data-dojo-type="dijit.form.TextBox" /><br />';
			queryHtml += ' <button id="#SearchButtonId" data-dojo-type="dijit.form.Button" type="button">Search</button><button id="#ClearButtonId" data-dojo-type="dijit.form.Button" type="button">Clear</button>';
			queryHtml += '<br /><hr /><div id="#SearchResultsId" style="width: 90%; height: 85%; overflow: scroll;"></div>'

			queryHtml = queryHtml.replace("#SearchBoxId", idPrefix + 'SearchBox');
			queryHtml = queryHtml.replace("#SearchBoxId", idPrefix + 'SearchBox');
			queryHtml = queryHtml.replace("#SearchBoxLabel", queryDef.searchBoxLable);
			queryHtml = queryHtml.replace("#SearchResultsId", idPrefix + 'SearchResults');
			queryHtml = queryHtml.replace("#SearchButtonId", idPrefix + 'SearchButton');
			queryHtml = queryHtml.replace("#ClearButtonId", idPrefix + 'ClearButton');

			Queries[i].resultId = idPrefix + 'SearchResults';
			Queries[i].inputId = idPrefix + 'SearchBox';



			searchTabs.addChild(new dijit.layout.ContentPane({
				title: queryDef.label,
				content: queryHtml,
				style: "overflow: hidden;"
			}));

			if (queryDef.type == "QueryTask") {
				queryTask = new esri.tasks.QueryTask(queryDef.url);
				queryTask.outSpatialReference = map.spatialReference;
				if (queryDef.inputId != "") {
					if (queryDef.buttonId != "") {
						// get a reference to the button defined in conf.json as belonging to current query
						var btn = document.getElementById(idPrefix + 'SearchButton');
						btn.setAttribute('onclick', "ButtonClickDoQuery(" + i + ");");

						var btn2 = document.getElementById(idPrefix + 'ClearButton');
						btn2.setAttribute('onclick', "ClearInputs('" + idPrefix + "SearchResults','" + idPrefix + "SearchBox');");

						dojo.connect(dijit.byId(idPrefix + 'SearchBox'), 'onKeyUp', function(e) {
							if (e.keyCode == 13) {
								var idPrefix = this.id.replace(/[a-z]+/gi, '');
								ButtonClickDoQuery(idPrefix);
							}
						})
					}
				}
			} else if (queryDef.type == "FindTask") {
				dojo.require('esri.tasks.Find');
				queryTask = new esri.tasks.FindTask(queryDef.url);
				if (queryDef.inputId != "") {
					if (queryDef.buttonId != "") {
						// get a reference to the button defined in conf.json as belonging to current query
						var btn = document.getElementById(idPrefix + 'SearchButton');
						btn.setAttribute('onclick', "ButtonClickDoQuery(" + i + ");");

						var btn2 = document.getElementById(idPrefix + 'ClearButton');
						btn2.setAttribute('onclick', "ClearInputs('" + idPrefix + "SearchResults','" + idPrefix + "SearchBox');");

						dojo.connect(dijit.byId(idPrefix + 'SearchBox'), 'onKeyUp', function(e) {
							if (e.keyCode == 13) {
								var idPrefix = this.id.replace(/[a-z]+/gi, '');
								ButtonClickDoQuery(idPrefix);
							}
						});
					}
				}
			} else if (queryDef.type == "GeocodeTask") {
				dojo.require("esri.tasks.locator");

				queryTask = new esri.tasks.Locator(queryDef.url);
				if (queryDef.inputId != "") {
					if (queryDef.buttonId != "") {
						// get a reference to the button defined in conf.json as belonging to current query
						var btn = document.getElementById(idPrefix + 'SearchButton');
						btn.setAttribute('onclick', "ButtonClickDoQuery(" + i + ");");

						var btn2 = document.getElementById(idPrefix + 'ClearButton');
						btn2.setAttribute('onclick', "ClearInputs('" + idPrefix + "SearchResults','" + idPrefix + "SearchBox');");

						dojo.connect(dijit.byId(idPrefix + 'SearchBox'), 'onKeyUp', function(e) {
							if (e.keyCode == 13) {
								var idPrefix = this.id.replace(/[a-z]+/gi, '');
								ButtonClickDoQuery(idPrefix);
							}
						});
					}
				}

			}

			queries[i] = queryTask;
		}

		QueryTasks = queries;
	};

	/** @description Excecute a query on queryDefs[ idx ] */
	ButtonClickDoQuery = function(idx) {
		var queryDef, value, query, html, findParams, cacheName, curQueryDef;

		cacheName = 'query' + idx;

		//Clear all the old query results
		currentFeatures = [];
		for (var i = 0; i < Queries.length; i += 1) {
			var def = Queries[i];
			dojo.byId(def.resultId).innerHTML = "";
		}

		//Get a reference to the queryDef we want
		queryDef = Queries[idx];
		//Get the value for our search from an input on the page.
		value = dojo.byId(queryDef.inputId).value;
		value = QuoteEncoding(value);
		//Create a new query object.
		if (queryDef.type == "QueryTask") {
			query = new esri.tasks.Query();

			var parts = [];

			//Some logic to for how we want to search??
			if (queryDef.operator == "LIKE") {

				for (var k = 0; k < queryDef.searchFields.length; k += 1) {
					var fld = queryDef.searchFields[k];
					parts.push("UPPER(" + fld + ") LIKE " + "'%" + value.toUpperCase() + "%'");
				}
				//query.where = "UPPER(" + queryDef.searchField + ") LIKE " + "'%" + value.toUpperCase() + "%'";

			}
			if (queryDef.operator == "NEAR") {
				var baseNum = parseInt(value);
				var startNum = 0;
				var endNum = 0;
				if (baseNum === NaN) {
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

				for (var k = 0; k < queryDef.searchFields.length; k += 1) {
					var fld = queryDef.searchFields[k];
					parts.push(fld + " > " + startNum + " AND " + fld + " < " + endNum);
				}


			} else {
				if (queryDef.isNumber) {
					for (var k = 0; k < queryDef.searchFields.length; k += 1) {
						var fld = queryDef.searchFields[k];
						parts.push(fld + " = " + value);
					}
					//query.where = queryDef.searchField + " = " + value;
				} else {
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
				if (!query.outFields.contains(queryDef.searchFields[j])) {
					query.outFields.push(queryDef.searchFields[j]);
				}
			}

			query.returnGeometry = true;
			curQueryDef = idx;
			//Execute the query and if we have results display them in the div defined in our queryDef.
			QueryTasks[idx].execute(query, function(result) {
				if (result.features.length > 0) {
					var infotemplate = new InfoTemplate(Queries[idx].title, Queries[idx].content);
					for (var j = 0; j < result.features.length; j += 1) {
						result.features[j].infoTemplate = infotemplate;
					}
					result.features.sort(SortFeatures(queryDef.searchFields[0]));
					featureCache[cacheName] = result.features;

					var resultDiv = dojo.byId(Queries[curQueryDef].resultId);
					html = "<h3>Results</h3>";
					html += '<ul class="collapsibleList">';
					for (var j = 0; j < result.features.length; j += 1) {
						var itm = result.features[j];
						var parts1 = [];
						if (itm.attributes[queryDef.searchFields[0]] == null || itm.attributes[queryDef.searchFields[0]] == undefined) {
							//do nothing statement to avoid error
							var x = 0;
						} else {
							if (itm.attributes[queryDef.searchFields[0]].length < 2) {
								var thtml = "";
								for (var k = 1; k < queryDef.searchFields.length; k += 1) {
									if (itm.attributes[queryDef.searchFields[k]].length > 2) {
										thtml = itm.attributes[queryDef.searchFields[k]];
										k = queryDef.searchFields.length + 1;
									}
								}
								if (thtml.length < 1) {
									thtml = 'NO VALUE';
								}
								html += '<li id="feature' + j + '">' + thtml;
							} else {
								html += '<li id="feature' + j + '">' + itm.attributes[queryDef.searchFields[0]];
							}
							html += "<ul>";
							html += '<li><a href="#" id="' + cacheName + '-' + j + '"class="zoomto">Zoom To</a></li>';
							for (var x = 0; x < Queries[curQueryDef].outFields.length; x += 1) {
								var name = Queries[curQueryDef].outFields[x];
								if (RemoveNamePrefix) {
									var split = name.split('.');
									if (split.length > 1) {
										name = split[1];
									}
								}
								name = name.replace("_", " ");

								var value = itm.attributes[Queries[curQueryDef].outFields[x]];
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

					dojo.query('.zoomto').connect('onclick', function() {
						var id;
						//id = this.id.replace('feature','');
						ZoomToFeature(this.id);
					});
				} else {
					Notify('error', 'No Results Found');
				}
			}, function(err) {
				console.log(err);
				alert(err);
			});

		} else if (queryDef.type == "FindTask") {
			findParams = new esri.tasks.FindParameters();

			findParams.returnGeometry = true;
			findParams.layerIds = queryDef.layerIds;
			findParams.searchFields = queryDef.searchFields;
			findParams.searchText = value;

			curQueryDef = idx;

			var findTask = Queries[idx];

			findTask.execute(findParams, function(results) {
				if (results.length > 0) {
					featureCache[cacheName] = [];
					var count = 0;
					var resultDiv = dojo.byId(Queries[curQueryDef].resultId);
					var htmls = {};


					html = "<h3>Results</h3>";
					html += '<ul class="collapsibleList">';
					dojo.forEach(results, function(result) {
						if (htmls.hasOwnProperty(result.layerName)) {} else {
							htmls[result.layerName] = '<li>' + result.layerName + '<ul>';
						}
						var item = result.feature;

						featureCache[cacheName].push(item);
						htmls[result.layerName] += '<li id="feature ' + count + '">' + item.attributes[result.foundFieldName];
						htmls[result.layerName] += '<ul>';
						htmls[result.layerName] += '<li><a href="#" id="' + cacheName + '-' + count + '"class="zoomto">Zoom To</a></li>';
						for (var attr in item.attributes) {
							htmls[result.layerName] += '<li><strong>' + attr + ': </strong>' + item.attributes[attr] + '</li>';
						}
						htmls[result.layerName] += '</ul></li>';
						count += 1;
					});

					for (var lyrName in htmls) {
						var html2 = htmls[lyrName];
						html2 += '</ul></li>';
						html += html2;
					}

					html += "</ul>";
					resultDiv.innerHTML = html;
					CollapsibleLists.apply();

					dojo.query('.zoomto').connect('onclick', function() {
						var id;
						//id = this.id.replace('feature','');
						ZoomToFeature(this.id);
					});
				}
			}, function(err) {
				alert(err);
			});
		} else if (queryDef.type == "GeocodeTask") {
			dojo.require("esri.tasks.locator");


			curQueryDef = idx;

			var numReg = new RegExp('^[0-9]+');
			var commaReg = new RegExp(',');

			var m = numReg.exec(value);
			var n = commaReg.exec(value);

			var address = {};

			if (m != null) {
				address.SingleLine = value;
			} else {
				if (n != null) {
					var parts = value.split(',');
					if (parts.length > 1) {
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

			var locator = Queries[idx];

			locator.outSpatialReference = map.spatialReference;
			var options = {
				address: address,
				outFields: ["Loc_name"]
			}

			locator.addressToLocations(options, function(candidates) {
				if (candidates.length > 0) {

					featureCache[cacheName] = [];
					var results = candidates.sort(sortBy('score', false, null));

					var count = 0;
					var resultDiv = dojo.byId(Queries[curQueryDef].resultId);
					var htmls = {};


					html = "<h3>Results</h3>";
					html += '<ul class="collapsibleList">';
					dojo.forEach(results, function(result) {

						featureCache[cacheName].push(result);
						html += '<li><a href="#" id="' + cacheName + '-' + count + '"class="zoomto">' + result.address + '</a></li>';
						count += 1;
					});

					html += "</ul>";

					resultDiv.innerHTML = html;
					CollapsibleLists.apply();

					dojo.query('.zoomto').connect('onclick', function() {
						var id;
						//id = this.id.replace('feature','');
						ZoomToFeature(this.id);
					});
				}


			}, function(err) {});
		}

	};

});
