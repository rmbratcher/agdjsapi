/**
 *
 * @constructor
 *
 * Paramaters:
 * geometryServiceUrl - {String} Url to the ArcGIS Server Geometry Service
 * 
 */
agd.Widgets.GoToXY = agd.Class({
	
	initialize: function(geometryServiceUrl) {
		

	
		this.GoToDialog = null;
		this.UseLatLon = false;
		this.GeometryService = this.geometryService = new esri.tasks.GeometryService(geometryServiceUrl);
		
		this.WGS84 = new esri.SpatialReference({ wkid: 4326 });
		
		this.xVal = null;
		this.yVal = null;
		
		this.graphic = null;
		
		this.pointSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1), new dojo.Color([255,255,0,0.5]));
	},
	/**
	 *
	 * Method: ShowDialog
	 * 
	 * Create a new dojo dialog and display it to the user.
	 */
	ShowDialog:  function() {
		
	
		var self = agd.Utils.widgets.GoToXY;
		
		map.graphics.clear();
		
		if(self.GoToDialog != null) {
			try {
				self.GoToDialog.destroyRecursive();
			} catch( error ){}
		}
		
		var xy = dojo.coords('gotoxy-dailog-button');
		var leftVal = xy.x - 8;
		var topVal = xy.y + 20;
		
		var contentHtml = '<div id="gotoxy-container" style="align: center;"><label id="x-label" for="x-value-tbx">X: </label><input type="text" style="width: 80px;" name="x-value-tbx" data-dojo-type="dijit.form.ValidationTextBox" id="widget-x-value"/><br /><label id="y-label"for"y-value-tbx">Y: </label><input type="text" style="width: 80px;" name="y-value-tbx" data-dojo-type="dijit.form.ValidationTextBox" id="widget-y-value"/><hr /><label for="coord-type-option">XY Type: </label><select name="coord-type-option" style="width: 70px;" id="widget-coord-type" data-dojo-type="dijit.form.ComboBox"><option>Map XY</option><option>LatLon</option></select><hr /> <button data-dojo-type="dijit.form.Button" type="button" id="gotoxy-submit">Go</button></div>';
		
		var styletext = 'width: 150px; height: 145px; top: ' + topVal + 'px; left: ' + leftVal + 'px; visibility:hidden; z-index:100;';
		
		var showGoToXYDiv = document.createElement('div');
		showGoToXYDiv.setAttribute('id','pGoToXY');
		showGoToXYDiv.setAttribute('style',styletext);
		showGoToXYDiv.innerHTML = contentHtml;
		document.body.appendChild(showGoToXYDiv);
		
		self.GoToDialog = new dojox.layout.FloatingPane({
			resizeable: true,
			dockable: false,
			title: 'Go To XY',
			style: styletext
		},dojo.byId('pGoToXY'));
		
		
		var xWidget = dijit.byId('widget-x-value');
		var yWidget = dijit.byId('widget-y-value');
		
		// xWidget.regExp = /([\d]{2,}\.[\d]{1,})/g;
		// xWidget.invalidMessage = 'Invalid Number Format';
		// yWidget.regExp = /([\d]{2,}\.[\d]{1,})/g;
		// yWidget.invalidMessage = 'Invalid Number Format';
		
		
		dojo.connect(dijit.byId('widget-coord-type'),'onChange',function(evt){
			var self = agd.Utils.widgets.GoToXY;
			if(this.value == "LatLon") {
				document.getElementById('x-label').innerHTML = "Lon:";
				document.getElementById('y-label').innerHTML = "Lat: ";
				self.UseLatLon = true;
			} else {
				document.getElementById('x-label').innerHTML = "X: ";
				document.getElementById('y-label').innerHTML = "Y: ";
				self.UseLatLon = false;
			}
		});
		
		dojo.connect(dijit.byId('gotoxy-submit'),'onClick',function(evt){
			var self = agd.Utils.widgets.GoToXY;
			var oPnt = undefined;
			
			try {
			self.xVal = parseFloat(dijit.byId('widget-x-value').value);
			self.yVal = parseFloat(dijit.byId('widget-y-value').value);
			oPnt = new esri.geometry.Point(self.xVal, self.yVal);
			} catch ( error ) {alert(error);}
			
			if(!oPnt){
				return;
			}
			
			if(self.UseLatLon){
				oPnt.spatialReference = self.WGS84;
				var params = new esri.tasks.ProjectParameters();
				params.geometries = [oPnt];
				params.outSR = map.spatialReference;
				
				self.geometryService.project(params, function(projectedPoints) {
					var pnt = projectedPoints[0];
					self.GoToPoint(pnt);
				});
			}
			else {
				self.GoToPoint(oPnt);
			}
		});
		
		self.GoToDialog.startup();
		self.GoToDialog.show();
		self.GoToDialog.bringToTop();;
	},

	/**
	 *
	 * Method: GoToPoint
	 *
	 * Moves the map to an X,Y location
	 *
	 * Parameters:
	 * pnt - {esri.geometry.Point}
	 *
	 */
	GoToPoint: function (pnt) {
		var self = agd.Utils.widgets.GoToXY;
		
		map.graphics.clear();
		
		if(map.ContainsPoint(pnt)){
			map.centerAt(pnt);
			self.graphic = esri.Graphic(pnt, self.pointSymbol);
			map.graphics.add(self.graphic);
		} else {
			alert('Coordinates outside of bounds of the map');
		}
		
	}
});