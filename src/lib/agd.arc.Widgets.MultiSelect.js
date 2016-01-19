/**
 *
 * @constructor
 *
 * Parameters:
 * 	url {String}
 * 	layerIds {Array}
 * 	serviceUrl {String}
 *
 */

agd.Widgets.MultiSelect = agd.Class({

	initialize: function(url, layerIds,serviceUrl,limit) {
		

		this.toolbar = new esri.toolbars.Draw(map);
		this.geom = null;
		this.table = null;
		this.tableStructure = null;
		this.encodedUri = null;
		this.grid = {};
		this.serviceUrl = serviceUrl;
		this.limit = limit;

		if (!agd.IsInt(this.limit)) {
			this.limit = 500;
		}

		this.identifyTask = new esri.tasks.IdentifyTask(url);

		this.identifyParams = new esri.tasks.IdentifyParameters();
		this.identifyParams.tolerance = 3;
		this.identifyParams.returnGeometry = true;
		this.identifyParams.layerIds = layerIds;
		this.identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;

		this.selection = null;
		this.handle = null;

		this.symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_FORWARDDIAGONAL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]));


	},

	Activate : function(option) {
		agd.Utils.changeTool('pan');
		var self = agd.Utils.widgets.MultiSelect;
		if(option == 'rectangle' || option == undefined || option == null) {
			self.toolbar.activate(esri.toolbars.Draw.EXTENT);
		}
		if(option == 'polygon') {
			self.toolbar.activate(esri.toolbars.Draw.POLYGON);
		}
		if(option == 'circle') {
			self.toolbar.activate(esri.toolbars.Draw.CIRCLE);
		}
		self.handle = dojo.connect(this.toolbar, "onDrawEnd", this.DrawEnd);
	},

	DrawEnd : function(geometry) {
		map.graphics.clear();
		var self = agd.Utils.widgets.MultiSelect;
		map.graphics.add(new esri.Graphic(geometry, self.symbol));
		self.geom = geometry;
		self.toolbar.deactivate();
		self.doSelect();
		dojo.disconnect(self.handle);
	},

	CreateDiv : function() {
		var panel = document.getElementById('pfloatingPane');
		if (panel == null || panel == 'undefined')
		{
			panel = document.createElement("div");
			panel.setAttribute('id','pfloatingPane');
			panel.setAttribute('sytle','visibility:hidden;');

			// panel.innerHTML += "<div data-dojo-type=\"dijit.layout.BorderContainer\" data-dojo-props=\"design: 'sidebar', gutters: false \"style=\"width: 400px; height: 300px;\">";
			// panel.innerHTML += "<div id=\"float-top\" data-dojo-type=\"dijit.layout.ContentPane\" data-dojo-props=\"region: 'top'\">header text</div>";
			// panel.innerHTML += "<div data-dojo-type=\"dijit.layout.ContentPane\" data-dojo-props=\"region: 'center'\">client area</div>";
			// panel.innerHTML += "<div id=\"float-Tabs\" data-dojo-type=\"dijit.layout.TabContainer\" data-dojo-props=\"region: 'center', tabPosition: 'top'\"></div>";
			// panel.innerHTML += "</div>";

			document.body.appendChild(panel);
		}
	},

	_clear : function() {

		try{
			dijit.byId('pfloatingPane').destroyRecursive();
			dijit.byId('bc-float').destroyRecursive();
		}catch(err){}


		for (var prop in this.table)
		{
			try{
				dijit.byId(CpName).destroyRecursive();
			}catch(err){}

			try{
				dijit.byId(DgName).destroyRecursive();
			}catch(err){}

		}

	},

	Clear : function() {
		map.graphics.clear();

		try{
			dijit.byId('pfloatingPane').destroyRecursive();
			dijit.byId('bc-float').destroyRecursive();
		}catch(err){}


		for (var prop in this.table)
		{
			try{
				dijit.byId(CpName).destroyRecursive();
			}catch(err){}

			try{
				dijit.byId(DgName).destroyRecursive();
			}catch(err){}

		}

	},

	_constructFloat : function() {
		var self = agd.Utils.widgets.MultiSelect;

		var bcDiv = document.createElement('div');
		bcDiv.setAttribute('id',"bc-float");

		var cp1Div = document.createElement("div");
		cp1Div.setAttribute('id','bc-container1');

		var csvBtn = document.createElement('div');
		csvBtn.setAttribute('id', 'csv-buttons');
		csvBtn.setAttribute('align', 'center');
		csvBtn.setAttribute('style','position:relative;width:100%;height:30px;');

		cp1Div.appendChild(csvBtn);

		bcDiv.appendChild(cp1Div);

		var cp2Div = document.createElement("div");
		cp2Div.setAttribute('id','bc-container2');

		bcDiv.appendChild(cp2Div);

		var tc = document.createElement('div');
		tc.setAttribute('id','tc1-prog');

		cp2Div.appendChild(tc);

		for (var prop in self.table) {
				var theCpDiv = document.createElement('div');
				var theDgDiv = document.createElement('div');
				var CpName = 'tab-cp-' + prop;
				var DgName = 'tab-cp-dg-' + prop;
				theCpDiv.setAttribute('id',CpName);
				theDgDiv.setAttribute('id',DgName);
				tc.appendChild(theCpDiv);
				theCpDiv.appendChild(theDgDiv);

			try{
				dijit.byId(CpName).destroyRecursive();
			}catch(err){}

			try{
				dijit.byId(DgName).destroyRecursive();
			}catch(err){}

		}

		return bcDiv;
	},


	ExportToCSV : function(name) {
		var self = agd.Utils.widgets.MultiSelect;
		//data:text/csv;charset=utf-8,
		var csvString = "";

		self.grid[name].exportGrid("csv", {writerArgs: {separator:","},fetchArgs:{start:0,count:self.limit}}, function(str){
			csvString += str;
		});

		var output = csvString.replace(/(\r\n|\n|\r)/gm, "|");


		var form = document.createElement("form");
		form.setAttribute("id","csv-form");
		form.setAttribute("method", "post");
		form.setAttribute("action", self.serviceUrl);

		//setting form target to a window named 'formresult'
		form.setAttribute("target", "formresult");

		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("name", "csvinfo");
		hiddenField.setAttribute("value", output);
		var hiddenField2 = document.createElement('input');
		hiddenField2.setAttribute("name", "filename");
		hiddenField2.setAttribute("value", name);
		form.appendChild(hiddenField);
		form.appendChild(hiddenField2);
		document.body.appendChild(form);

		//creating the 'formresult' window with custom features prior to submitting the form
		window.open('nothing.html', 'formresult', 'scrollbars=no,menubar=no,height=600,width=800,resizable=yes,toolbar=no,status=no');

		form.submit();
	},

	ShowResults : function() {
		var self = agd.Utils.widgets.MultiSelect;

		var pfloatingPane, styletext, tabContainer, contentPane,contentPane2, borderContainer;

		self._clear();

		this.CreateDiv();
		var bcDiv = this._constructFloat();


		styletext = "position:absolute;top:100px;left:"+ parseInt(map.width / 2)+ "px;width:800px;height:400px;visibility:hidden;z-index=100;";

		pfloatingPane = new dojox.layout.FloatingPane({
			title: "Selection Results",
			resizeable: true,
			dockable: false,
			style: styletext,
			id: "pfloatingPane"
		},dojo.byId("pfloatingPane"));

		pfloatingPane.containerNode.appendChild(bcDiv);

		borderContainer = new dijit.layout.BorderContainer({
			design: 'headline',
			gutters: false,
			style: 'width: 100%; height: 100%'
		},"bc-float");

		contentPane = new dijit.layout.ContentPane({
			region: 'top',
			splitter: true,
			style: 'width:100%;height:35px;'
		},"bc-container1");

		contentPane2 = new dijit.layout.ContentPane({
			region: 'center',
			splitter: true
		},"bc-container2");



		tabContainer = new dijit.layout.TabContainer({ style: "height: 100%; width: 100%;" }, "tc1-prog");

		self.encodedUri = {};
		self.grid = {};

		for (var prop in self.table)
		{
			if(prop) {

				self.encodedUri[prop] = null;

				var dataStore = new dojo.data.ItemFileWriteStore({ data:self.table[prop] });
				dataStore.data = self.table[prop];

				var CpName = 'tab-cp-' + prop;
				var DgName = 'tab-cp-dg-' + prop;

				var cp1 = new dojox.layout.ContentPane({
					 title: prop
				},CpName);

				// var csvButon = new dijit.form.Button({
					// label: 'Export' + prop + ' to CSV',
					// name: prop,
					// onClick: function(){
						// agd.Utils.widgets.MultiSelect.ExportToCSV(this.name);
					// }
				// },'csv-button');

				var dg = new dojox.grid.EnhancedGrid({
					query: {OBJECTID: '*'},
					id: DgName,
					store: dataStore,
					structure: self.tableStructure[prop],
					clientSort: true,
					rowSelector: '20px',
					style: 'width:100%;height:100%;',
					plugins: {
						exporter: true
					}
				 },DgName);

				 dg.setStore(dataStore);

				 self.grid[prop] = dg;

				var csvString = "data:text/csv;charset=utf-8,";

				self.grid[prop].exportGrid("csv", {writerArgs: {separator:","}}, function(str){
					csvString += str;
				});

				//browser name and version as array
				var bid = agd.BrowserId;

				var link = document.createElement("a");
				link.setAttribute("class","downloadButton");

				if(bid[0] == "Chrome")
				{
					var encodedUri = encodeURI(csvString);

					link.setAttribute("href", encodedUri);

					link.setAttribute("target","_blank");
					link.setAttribute("download", prop + ".csv");


				} else {
					link.setAttribute('href',"javascript:agd.Utils.widgets.MultiSelect.ExportToCSV('" + prop + "');");
				}

				link.innerText = 'Download ' + prop + " as CSV  ";
				link.textContent = 'Download ' + prop + " as CSV  ";

				var buttonsDiv = document.getElementById('csv-buttons');
				buttonsDiv.appendChild(link);

				 dg.startup();
			 }
		}

		pfloatingPane.startup();
		pfloatingPane.show();
		pfloatingPane.bringToTop();
	},

	AddResults : function(results) {
		var self = agd.Utils.widgets.MultiSelect;
		map.graphics.clear();
		self.selection = results;

		self.table = {};
		self.tableStructure = {};

		for(var i = 0; i < results.length; i += 1) {
			if(self.table.hasOwnProperty(results[i].layerName)) {
				self.table[results[i].layerName].items.push(results[i].feature.attributes);
			} else {
				self.table[results[i].layerName] = {};
				self.table[results[i].layerName].items = [];
				self.table[results[i].layerName].identifier = "OBJECTID";
				self.table[results[i].layerName].items.push(results[i].feature.attributes);

				self.tableStructure[results[i].layerName] = [];

				for(var attr in results[i].feature.attributes) {
					var collen = '60px';
					if( results[i].feature.attributes[attr].length > 60) {
						collen = (results[i].feature.attributes[attr].length + 5) + 'px';
					}
					self.tableStructure[results[i].layerName].push({field: attr, name: attr, width: '60px'});
				}
			}
			map.graphics.add(new esri.Graphic(results[i].feature.geometry, agd.Utils.symbols['DefaultPolygonSymbol']));
		}

		self.ShowResults();
	},

	doSelect : function() {
		this.identifyParams.geometry = this.geom;
		this.identifyParams.width = map.width;
		this.identifyParams.height = map.height;
		this.identifyParams.mapExtent = map.extent;

		this.identifyTask.execute(this.identifyParams, function(idResults) {
				agd.Utils.widgets.MultiSelect.AddResults(idResults);
			},
			function(error) {
				alert(error);
			}
		);
	}
});