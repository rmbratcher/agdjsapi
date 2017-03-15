//dijit
dojo.require("dijit.dijit"); // optimize: load dijit layer
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.HorizontalRule");
dojo.require("dijit.form.HorizontalSlider");
dojo.require("dijit.ToolbarSeparator");
dojo.require('dijit.form.ValidationTextBox');
dojo.require('dijit.form.NumberTextBox');
dojo.require('dijit.form.ComboBox');
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.DropDownButton");
//dojo
dojo.require("dojo.json");
dojo.require("dojo.fx");
dojo.require("dojo.io.iframe");
dojo.require('dojo.parser');
dojo.require("dojo.store.Memory");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojo.currency");
//dojox
dojo.require("dojox.layout.FloatingPane");
dojo.require("dojox.layout.ContentPane");
dojo.require("dojox.layout.FloatingPane");
dojo.require("dojox.grid.EnhancedGrid");
dojo.require("dojox.layout.ContentPane");
dojo.require("dojox.layout.FloatingPane");
dojo.require("dojox.layout.ContentPane");
dojo.require("dojox.grid.enhanced.plugins.exporter.CSVWriter");
//esri
dojo.require("esri.map");
dojo.require("esri.arcgis.utils");
dojo.require("esri.IdentityManager");
dojo.require("esri.symbol");
dojo.require("esri.dijit.OverviewMap");
dojo.require("esri.virtualearth.VETiledLayer");
dojo.require("esri.toolbars.navigation");
dojo.require("esri.dijit.Popup");
dojo.require("esri.dijit.Scalebar");
dojo.require('esri.tasks.GeometryService');
dojo.require('esri.config');
dojo.require('esri.tasks.FindTask');
dojo.require('esri.tasks.FindParameters');
dojo.require("esri.tasks.locator");
dojo.require("esri.tasks.identify");
dojo.require("esri.tasks.geometry");
dojo.require("esri.toolbars.draw");
dojo.require("esri.layers.agsimageservice");
dojo.require("esri.layers.wms");
dojo.require("esri.layers.agstiled");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("esri.toolbars.draw");
//agd
dojo.require("agd.dijit.TOC");


/* Comments: this section is declaring variables for the page	  */
var map, layers, tiledMapServiceLayer, dynamicMapServiceLayer, locator,
    locatorAddress, precinctQuery, shortListresults, curGraphic, doShow,
    curResult, searchAddress, outerLayout, innerLayout, navToolbar, TM, resizeTimer;
    
    
dojo.addOnLoad(init);

function init() {

    //Get config file from server
    dojo.xhrGet({
        url: 'conf.json',
        load: function(result) {
            BuildMap(result);
        },
	error: function(err) {
	    alert("Failed to Load Configuration..")
	}
    });

    //esriConfig.defaults.io.proxyUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + 'proxy.php';
}

//Create a map from config
function BuildMap(json) {

    var obj, overviewMapDijit;
    
	//Parse the config file (conf.json)
    obj = JSON.parse(json);


	//Set the title for the page from the config file (conf.json)
    document.getElementById("pgTitle").innerHTML = obj.mapConfig.Page.title;
    
    var linkhtml = "";
    
    if(obj.mapConfig.Page.links.length > 0) {
        linkhtml += "<ul>";
        for(var i = 0; i < obj.mapConfig.Page.links.length; i += 1) {
            var link = obj.mapConfig.Page.links[i];
            linkhtml += '<li><a href="' + link.url + '" target="_blank">' + link.label + '</a></li>';
        }
        linkhtml += "</ul>";
        
        document.getElementById("headlinks").innerHTML = linkhtml;
    }
	
	//if we are not using the Hyperlink tool remove the Property Info tab
	var hasHL = false;
	
	for(var i = 0; i < obj.mapConfig.Tools.length; i += 1) {
		var tool = obj.mapConfig.Tools[i];
		if(tool.type == "Hyperlink") {
			hasHL = true;
		}
	}
	
	if(obj.mapConfig.Page.hasOwnProperty("helpTab")) {
		if(obj.mapConfig.Page.helpTab != null && obj.mapConfig.Page.helpTab != undefined) {
			document.getElementById("helpFrame").src = obj.mapConfig.Page.helpTab;
		} else {
			dijit.byId('mainTabContainer_tablist_helpTab').destroy();
		}
	} else {
		dijit.byId('mainTabContainer_tablist_helpTab').destroy();
	}
	
	if(!hasHL) {
		dijit.byId('mainTabContainer_tablist_propInfoTab').destroy();
	}
    

	
    agd.Utils.CreateMap(obj);
 
    //Connect functions to map events
    WireEvents();
    
    // Add Layers from configuration
    AddLayers(obj);
    
    //Create Queries
    agd.Utils.CreateQueries(obj);
    
    //CreateSymbols
    agd.Utils.CreateSymbols(obj);
    
    //CreateToolbar
    agd.Utils.CreateToolbar(obj);
    
    //Create Tasks
    //agd.Utils.BuildTasks(obj);
    
    navToolbar = new esri.toolbars.Navigation(map);
    
    //add the overview map 
    /*overviewMapDijit = new esri.dijit.OverviewMap({
        map: map,
        visible:true
    });
    overviewMapDijit.startup();*/
    
    map.resize();
	
	map.autoResize = true;
	
	//do a fake pan to get the scale working #hack
	//map.centerAt(map.getCenter());
    //document.dispatchEvent(agd.setupComplete);
}

// Connect map events to functions
function WireEvents() {
    dojo.connect(map, 'onLoad', function(map) {
        //resize the map when the browser resizes
		dojo.connect(dijit.byId('map'), 'resize', function() {  //resize the map if the div is resized
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout( function() {
			map.resize();
			map.reposition();
			}, 500);
		});
		
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout( function() {
			map.reposition();
		}, 1500);
    });
	
	
	dojo.connect(dijit.byId('leftCol'),'resize',function(){
		map.resize();
		map.reposition();
	});
	
	dojo.connect(window, 'onresize', function(){
		map.resize();
		map.reposition();
	});
    
    dojo.connect(map, 'onMouseMove', function(evt) {
        var mp = evt.mapPoint;
        dojo.byId("mousePosition").innerHTML = "<strong>X: </strong>" + mp.x.toFixed(4) + "<strong> , Y: </strong>" + mp.y.toFixed(4);
    });
    
    dojo.connect(map, 'onClick', agd.Utils.mapClickHandler);
    
    //Create TOC
    dojo.connect(map, "onLayersAddResult", function (results) {
        agd.Utils.CreateTOC()
    });
    
    dojo.connect(map, 'onExtentHistoryChange', agd.Utils.extentHistoryChangeHandler);
	
	dojo.connect(map, 'onExtentChange', agd.Utils.extentChangedHandler);
}

//Add layers to the map from config
function AddLayers(layersConf) {
   
    map.addLayers(agd.Utils.CreateLayers(layersConf));
    
    map.infoWindow.resize(200,125);

}

function executeIdentifyTask(task, params,evt) {
    identifyParams.geometry = evt.mapPoint; 
};