/**
 *
 * @constructor
 *
 * Paramaters:
 * 	geometrySeriviceUrl {String}
 *
 */
agd.Widgets.Measure = agd.Class({

	initialize: function(geometryServiceUrl) {
		
	
		
		this.toolbar = new esri.toolbars.Draw(map);
		this.activeTool = '';
		this.geom = null;
		
		this.Drawhandle = null;
		this.Graphicshandle = null;
		this.Overhandle = null;
		//this.DrawMouseClickHandle = null;
		
		this.MeasureDialog = null;
		
		this.LengthUnit = 'ft';
		this.AreaUnit = 'ac';
		this.XYUnit = 'm'
		
		this.feet_to_meters = 0.3048;
		this.meters_to_feet = 3.28084;
		this.acres_to_sqarefeet = 43560;
		this.acres_to_squaremiles = 0.0015625;
		
		this.LenthOptionStore = new dojo.store.Memory({
			data: [
				{name: "ft", id:"feet"},
				{name: "m", id: "meters"},
				{name: "yrds", id: "yards"},
				{name: "km", id: "kilometers"},
				{name: "mi", id: "miles"}
			]
		});
		
		this.AreaOptionStore = new dojo.store.Memory({
			data: [
				{name: 'Ac', id: 'acres'},
				{name: 'sqFt', id: 'squarefeet'},
				{name: 'sqMeter', id:'squaremeter'},
				{name: 'Ha', id:'hectare'},
				{name: "sqKm", id:'squarekilometer'},
				{name: 'sqMi', id: 'squaremile'}
			]
		});
		
		// this.LocationOptionStore = new dojo.store.Memory({
			// data: [
				// {name: 'Map Units', id: 'mapUnits'},
				// {name: 'Lat Lon', id: 'latlon'}
			// ]
		// });
		
		this.geometryService = new esri.tasks.GeometryService(geometryServiceUrl);
		this.areasAndLengthParams = new esri.tasks.AreasAndLengthsParameters();
		this.areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_FOOT;
		this.areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_ACRES;
        this.areasAndLengthParams.calculationType = "preserveShape";
		
		this.lengthParams = new esri.tasks.LengthsParameters();
		this.lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_FOOT;
		this.lengthParams.geodesic = false;
		
		this.WGS84 = new esri.SpatialReference({ wkid: 4326 });
		
		this.dialog = new dijit.TooltipDialog({id: "tooltipDialog",style: "position: relative; width: 250px; bottom:0px; right:0px;font: normal normal normal 10pt Helvetica;z-index:100"});
		this.dialog.startup();
		
		this.template = "";
		this.graphic = null;
		
		this.areaSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_FORWARDDIAGONAL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]));
		this.lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255,0,0]), 2);
		this.pointSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1), new dojo.Color([255,255,0,0.5]));
	
	},

	showMeasureDialog : function() {
		
		
		var self = agd.Utils.widgets.Measure;
		
		var xy = dojo.coords('measure-dailog-button');
		var leftVal = xy.x - 8;
		var topVal = xy.y + 20;
		
		if(self.MeasureDialog != null) {
			try {
				self.MeasureDialog.destroyRecursive();
			} catch(error) {}
		}
		
		var showMeasureDiv = document.createElement('div');
		showMeasureDiv.setAttribute('id','pMeasureDiv');
		showMeasureDiv.setAttribute('style','width: 330px; height: 130px; top: ' + topVal + 'px; left: ' + leftVal + 'px; visibility:hidden; z-index:100;');
		showMeasureDiv.innerHTML = '<div id="measure-tools-container"><div id="MeasureToolbar" data-dojo-type="dijit.Toolbar"></div><div id="measure-results"><div id="MeasureOptionsToolbar" data-dojo-type="dijit.Toolbar"></div><div id="showMResult" style="margin:10px; padding:2px;"></div></div></div>';
		document.body.appendChild(showMeasureDiv);
	
		var styletext = 'position:absolute;width: 330px; height: 130px;top: ' + topVal + 'px; left: ' + leftVal + 'px; visibility:hidden; z-index:100;';
		
		self.MeasureDialog = new dojox.layout.FloatingPane({
			resizeable: true,
			dockable: false,
			title: 'Measure area, distance and location',
			style: styletext
		},dojo.byId('pMeasureDiv'));
		
		var tools = [];
		var tools1 = [];
		
		tools.push(new dijit.form.Button({
			label: 'Measure Line',
			showLabel: false,
			id: 'measureline-button',
			iconClass: 'measureLineIcon',
			onClick: function(){
				agd.Utils.changeTool('measure-line');
			}
		}));
		tools.push(new dijit.form.Button({
			label: 'Measure Area',
			showLabel: false,
			id: 'measurearea-button',
			iconClass: 'measureAreaIcon',
			onClick: function(){
				agd.Utils.changeTool('measure-area');
			}
		}));
		tools.push(new dijit.form.Button({
			label: 'Measure Point',
			showLabel: false,
			id: 'measurepoint-button',
			iconClass: 'measurePointIcon',
			onClick: function(){
				agd.Utils.changeTool('measure-point');
			}
		}));
		
	
		
		tools1.push(new dijit.form.ComboBox({
			label: 'Length',
			id: 'lengthOption',
			name: 'LengthUnits',
			value: "ft",
			store: self.LenthOptionStore,
			maxLength: 6,
			style: "width: 40px;",
			onChange: function(evt){
				var self = agd.Utils.widgets.Measure;
				var val = document.getElementById('lengthOption').value;
				switch(val) {
					case 'ft':
						self.lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_FOOT;
						self.areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_FOOT;
						self.LengthUnit = 'ft';
						break;
					case 'm':
						self.lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_METER;
						self.areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_METER;
						self.LengthUnit = 'm';
						break;
					case 'yrds':
						self.lengthParams.lengthUnit = esri.tasks.GeometryService.SURVEY_YARD;
						self.areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.SURVEY_YARD;
						self.LengthUnit = 'yrds';
						break;
					case 'km':
						self.lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_KILOMETER;
						self.areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_KILOMETER;
						self.LengthUnit = 'km';
						break;
					case 'mi':
						self.lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_STATUTE_MILE;
						self.areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_STATUTE_MILE;
						self.LengthUnit = 'mi';
						break;
						
				}
			}
		}));
		
		tools1.push(new dijit.form.ComboBox({
			label: 'Area',
			id: 'areaOption',
			name: 'AreaUnits',
			value: 'Ac',
			store: self.AreaOptionStore,
			maxLength: 8,
			style: "width: 50px;",
			onChange: function(evt) {
				var self = agd.Utils.widgets.Measure;
				var val = document.getElementById('areaOption').value;
				
				switch (val) {
					case 'Ac':
						self.areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_ACRES;
						self.AreaUnit = 'ac';
						break;
					case 'sqFt':
						self.areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_SQUARE_FEET;
						self.AreaUnit = 'sqft';
						break;
					case 'sqMeter':
						self.areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_SQUARE_METERS;
						self.AreaUnit = 'sqft';
						break;
					case 'Ha':
						self.areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_HECTARES;
						self.AreaUnit = 'ha';
						break;
					case 'sqKm':
						self.areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_SQUARE_KILOMETER;
						self.AreaUnit = 'sqKm';
						break;
					case 'sqMi':
						self.areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_SQUARE_MILES;
						self.AreaUnit = 'sqmi';
						break;
				}
			}
		}));
		
		// tools1.push(new dijit.form.ComboBox({
			// label: 'XY',
			// id: 'XYOption',
			// name: 'XYUnits',
			// value: 'Map Units',
			// store: self.LocationOptionStore,
			// maxLength: 8,
			// style: "width: 70px;"
		// }));
		
		for (var j = 0; j < tools.length; j += 1) {
			tools[j].placeAt(dojo.byId("MeasureToolbar"));
		}
		
		for (var j = 0; j < tools1.length; j += 1) {
			tools1[j].placeAt(dojo.byId("MeasureOptionsToolbar"));
		}
		
		dojo.place('<label for="LengthUnits">Length: </label>', dojo.byId('widget_lengthOption'), 'before');
		dojo.place('<label for="AreaUnits">Area: </label>', dojo.byId('widget_areaOption'), 'before');
		//dojo.place('<label for="XYUnits">XY: </label>', dojo.byId('widget_XYOption'), 'before');
		
		map.graphics.enableMouseEvents();
		
		self.MeasureDialog.startup();
		self.MeasureDialog.show();
		self.MeasureDialog.bringToTop();
	
	},

	showDialog : function(evt) {
		var self = agd.Utils.widgets.Measure;
		var content = esri.substitute(evt.graphic.attributes,self.template);
		dialog.setContent(content);
		dojo.style(dialog.domNode, "opacity", 0.85);
		dijit.popup.open({popup: self.dialog, x:evt.pageX,y:evt.pageY});

	},

	closeDialog : function() {
		var self = agd.Utils.widgets.Measure;
		dijit.popup.close(self.dialog);
	},

	changeTool : function(tool) {
		this.Activate(tool);
		this.activeTool = tool;
	},

	Close : function() {
		var self = agd.Utils.widgets.Measure;
		map.graphics.clear();
		self.activeTool = 'none';
		self.toolbar.deactivate();
		dojo.disconnect(self.Drawhandle);
		dojo.disconnect(self.Graphicshandle);
		if(self.MeasureDialog != null) {
			try {
				self.MeasureDialog.destroyRecursive();
			} catch(error) {}
		}
	},

	Deactivate : function() {
		var self = agd.Utils.widgets.Measure;
		self.activeTool = 'none';
		self.toolbar.deactivate();
		dojo.disconnect(self.Drawhandle);
		dojo.disconnect(self.Graphicshandle);
		//dojo.disconnect(self.MapClickEventHandler);
	},

	/*MapClickEventHandler : function(evt) {
		var self = agd.Utils.widgets.Measure;
		if(evt.which == 3){
			if(self.activeTool == 'line'){
				self.toolbar.
			}
			alert("Right Button Pressed");
		}
	},*/

	Activate : function(tool) {
		var self = agd.Utils.widgets.Measure;
	
		if(tool == "line") {
			self.toolbar.activate(esri.toolbars.Draw.POLYLINE);
		}
		if(tool == "area") {
			self.toolbar.activate(esri.toolbars.Draw.POLYGON);
		}
		if(tool == "point") {
			self.toolbar.activate(esri.toolbars.Draw.POINT);
		}
		
		self.Drawhandle = dojo.connect(this.toolbar, "onDrawEnd", this.DrawEnd);
		self.Graphicshandle = dojo.connect(map.graphics,"onMouseOut",agd.Utils.widgets.Measure.closeDialog);  
		//self.DrawMouseClickHandle = dojo.connect(map,"onClick",this.MapClickEventHandler);
	},


	DrawEnd : function(geometry) {
		map.graphics.clear();
		var self = agd.Utils.widgets.Measure;
		if(geometry.type == 'polyline')
			self.graphic = new esri.Graphic(geometry,self.lineSymbol);
		if(geometry.type == 'polygon')
			self.graphic = new esri.Graphic(geometry, self.areaSymbol);
		if(geometry.type == 'point')
			self.graphic = new esri.Graphic(geometry, self.pointSymbol);
		
		
		map.graphics.add(self.graphic);
		
		self.geom = geometry;
		self.showMeasure();
		self.Deactivate();
	
	},

	showMeasure : function() {
		var self = agd.Utils.widgets.Measure;
		var x = self.geom;
		
		dojo.disconnect(self.Overhandle);
		
		if (self.geom.type == 'polygon') {
			self.geometryService.simplify([self.geom], function(simplifiedGeometries) {
				self.areasAndLengthParams.polygons = simplifiedGeometries;
				self.geometryService.areasAndLengths(self.areasAndLengthParams, function(result){
						var tarea = result.areas[0].toFixed(2);
						var tlength = result.lengths[0].toFixed(2);
	
						self.graphic.setAttributes({area: tarea, length: tlength});
						self.template = '<b>Area: </b>${area} ' + self.AreaUnit +'<br /><b>Perimeter: </b>${length} '+ self.LengthUnit +'<br />';
	
						var content = esri.substitute(self.graphic.attributes,self.template);
						document.getElementById('showMResult').innerHTML = content;
						//self.dialog.setContent(content);
						//dojo.style(self.dialog.domNode, "opacity", 0.85);
						
						//var co = dojo.coords('measurearea-button');
						
						//dijit.popup.open({popup: self.dialog, x:(co.x - 8),y:(co.y + 20)});
					
					});
			});
	
		}
		
		if (self.geom.type == 'polyline') {
			self.geometryService.simplify([self.geom], function(simplifiedGeometries) {
				self.lengthParams.polylines = simplifiedGeometries;
				self.geometryService.lengths(self.lengthParams, function(result){
					
					var tlength = result.lengths[0].toFixed(2);
					
					self.graphic.setAttributes({length: result.lengths[0].toFixed(2)});
					self.template = '<b>Length: </b>${length} '+ self.LengthUnit + '<br />';
					var content = esri.substitute(self.graphic.attributes,self.template);
					document.getElementById('showMResult').innerHTML = content;
					// self.dialog.setContent(content);
					// dojo.style(self.dialog.domNode, "opacity", 0.85);
					
					// var co = dojo.coords('measureline-button');
					
					// dijit.popup.open({popup: self.dialog, x:(co.x - 8),y:(co.y + 20)});
					});
			});
	
		}
		
		if (self.geom.type == 'point') {
			var params = new esri.tasks.ProjectParameters();
			params.geometries = [self.geom];
			params.outSR = self.WGS84;
	
			self.geometryService.project(params, function(projectedPoints) {
				var pnt = projectedPoints[0];
				self.graphic.setAttributes( { X: self.geom.x.toFixed(3), Y: self.geom.y.toFixed(3), Lon: pnt.x.toFixed(5), Lat: pnt.y.toFixed(5) });
				self.template = '<table><tr><td>X:</td><td>${X}</td><td>|</td><td> Lon:</td><td>${Lon}</td></tr><tr><td>Y:</td><td>${Y}</td><td>|</td><td> Lat:</td><td>${Lat}</td></tr></table>';//"<b> X: </b>${X} | <b>Lon:</b> ${Lon}<br /><b> Y: </b>${Y} | <b> Lat: </b> ${Lat} <br />";
				var content= esri.substitute(self.graphic.attributes, self.template);
				document.getElementById('showMResult').innerHTML = content;
				// self.dialog.setContent(content);
				// dojo.style(self.dialog.domNode, "opacity", 0.85);
				// var co = dojo.coords('measurepoint-button');
				// dijit.popup.open({popup: self.dialog, x:(co.x - 8),y:(co.y + 20)});
			});
				// var pnt = projectedPoints[0];
				// self.graphic.setAttributes( { X: self.geom.x.toFixed(3), Y: self.geom.y.toFixed(3), Lon: pnt.x.toFixed(5), Lat: pnt.y.toFixed(5) });
				// self.template = "<b> X: </b>${X}  <b>, Y: </b>${Y}<br /><b>Lon:</b> ${Lon} <b>, Lat: </b> ${Lat} <br />";
				// var content= esri.substitute(self.graphic.attributes, self.template);
				// self.dialog.setContent(content);
				
				// dojo.style(self.dialog.domNode, "opacity", 0.85);
					
				// var co = dojo.coords('measurepoint-button');
					
				// dijit.popup.open({popup: self.dialog, x:(co.x - 8),y:(co.y + 20)});
			// }, function(err){
				// alert(err);
			// });
		}
	}
});