define([
    "dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has", // feature detection
    "esri/kernel", // esri namespace
    "dijit/_WidgetBase",
    "dijit/a11yclick", // Custom press, release, and click synthetic events which trigger on a left mouse click, touch, or space/enter keyup.
    "dijit/_TemplatedMixin",
    "dojo/on",
    "dojo/Deferred",  
    //"dojo/text!application/dijit/templates/HomeButton.html", // template html
    //"dojo/i18n!application/nls/jsapi", // localization
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/color",
    "dojox/layout/FloatingPane",
    "dojox/layout/ContentPane",
    "dojox/grid/EnhancedGrid",
    "dijit/layout/BorderContainer",
    "dijit/layout/TabContainer",
    "dojo/data/ItemFileWriteStore",
    "esri/toolbars/draw",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters",
    "esri/tasks/IdentifyResult",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/graphic"
],
function (
    Evented,
    declare,
    lang,
    has, esriNS,
    _WidgetBase, a11yclick, _TemplatedMixin,
    on,
    Deferred,
    //dijitTemplate, i18n,
    domClass, domStyle, Color,
    FloatingPane, ContentPane, EnhancedGrid,
    BorderContainer,
    TabContainer, ItemFileWriteStore,
    DrawToolbar, IdentifyTask,
    IdentifyParameters, IdentifyResult,
    SimpleFillSymbol, SimpleLineSymbol,
    Graphic
) {
    var Widget = declare("agd.dijit.MultiSelect", [_WidgetBase, _TemplatedMixin, Evented], {
        options: {
            url: null,
            map: null,
            layerIds: null,
            serviceUrl: null,
            limit: 500,
            visible: false
        },
        constructor: function(options, srcRefNode){
            var defaults = lang.mixin({},this.options, options);
            this.domNode = srcRefNode;
            //properties
            this.set("map",defaults.map);
            this.set("url",defaults.url);
            this.set("layerIds",defaults.layerIds);
            this.set("serviceUrl",defaults.serviceUrl);
            this.set("limit",defaults.limit);

            this.toolbar = new DrawToolbar(this.map);
		    this.geom = null;
		    this.table = null;
		    this.tableStructure = null;
		    this.encodedUri = null;
		    this.grid = {};

            this.identifyTask = new IdentifyTask(url);

            this.identifyParams = new IdentifyParameters();
            this.identifyParams.tolerance = 3;
            this.identifyParams.returnGeometry = true;
            this.identifyParams.layerIds = layerIds;
            this.identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;

            this.selection = null;
            this.handle = null;

            this.symbol = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_FORWARDDIAGONAL, 
                new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, 
                new Color([255,0,0]), 2), 
                new Color([255,255,0,0.25])
                );

            //listeners
            this.watch("visible", this._visible);
        },

        Activate : function(option) {
            if(option == 'rectangle' || option == undefined || option == null) {
                this.toolbar.activate(DrawToolbar.EXTENT);
            }
            if(option == 'polygon') {
                this.toolbar.activate(DrawToolbar.POLYGON);
            }
            if(option == 'circle') {
                this.toolbar.activate(DrawToolbar.CIRCLE);
            }
            this.handle = dojo.connect(this.toolbar, "onDrawEnd", this.DrawEnd);
        },

        DrawEnd : function(geometry) {
            this.map.graphics.clear();
            this.map.graphics.add(new Graphic(geometry, this.symbol));
            this.geom = geometry;
            this.toolbar.deactivate();
            this.doSelect();
            dojo.disconnect(this.handle);
        },

        doSelect : function() {
            this.identifyParams.geometry = this.geom;
            this.identifyParams.width = this.map.width;
            this.identifyParams.height = this.map.height;
            this.identifyParams.mapExtent = this.map.extent;

            this.identifyTask.execute(this.identifyParams, function(idResults) {
                    this.AddResults(idResults);
                },
                function(error) {
                    alert(error);
                }
            );
        },

        AddResults : function(results) {
            this.map.graphics.clear();
            this.selection = results;

            this.table = {};
            this.tableStructure = {};

            for(var i = 0; i < results.length; i += 1) {
                if(this.table.hasOwnProperty(results[i].layerName)) {
                    this.table[results[i].layerName].items.push(results[i].feature.attributes);
                } else {
                    this.table[results[i].layerName] = {};
                    this.table[results[i].layerName].items = [];
                    this.table[results[i].layerName].identifier = "OBJECTID";
                    this.table[results[i].layerName].items.push(results[i].feature.attributes);

                    this.tableStructure[results[i].layerName] = [];

                    for(var attr in results[i].feature.attributes) {
                        var collen = '60px';
                        if( results[i].feature.attributes[attr].length > 60) {
                            collen = (results[i].feature.attributes[attr].length + 5) + 'px';
                        }
                        this.tableStructure[results[i].layerName].push({field: attr, name: attr, width: '60px'});
                    }
                }
                this.map.graphics.add(new Graphic(results[i].feature.geometry, agd.Utils.symbols['DefaultPolygonSymbol']));
            }

            this.ShowResults();
        },

        ShowResults : function() {
            var pfloatingPane, styletext, tabContainer, contentPane,contentPane2, borderContainer;

            this._clear();

            this.CreateDiv();
            var bcDiv = this._constructFloat();


            styletext = "position:absolute;top:100px;left:"+ parseInt(this.map.width / 2)+ "px;width:800px;height:400px;visibility:hidden;z-index=100;";

            pfloatingPane = new FloatingPane({
                title: "Selection Results",
                resizeable: true,
                dockable: false,
                style: styletext,
                id: "pfloatingPane"
            },dojo.byId("pfloatingPane"));

            pfloatingPane.containerNode.appendChild(bcDiv);

            borderContainer = new BorderContainer({
                design: 'headline',
                gutters: false,
                style: 'width: 100%; height: 100%'
            },"bc-float");

            contentPane = new ContentPane({
                region: 'top',
                splitter: true,
                style: 'width:100%;height:35px;'
            },"bc-container1");

            contentPane2 = new ContentPane({
                region: 'center',
                splitter: true
            },"bc-container2");



            tabContainer = new TabContainer({ style: "height: 100%; width: 100%;" }, "tc1-prog");

            this.encodedUri = {};
            this.grid = {};

            for (var prop in this.table)
            {
                if(prop) {

                    this.encodedUri[prop] = null;

                    var dataStore = new ItemFileWriteStore({ data:this.table[prop] });
                    dataStore.data = this.table[prop];

                    var CpName = 'tab-cp-' + prop;
                    var DgName = 'tab-cp-dg-' + prop;

                    var cp1 = new ContentPane({
                        title: prop
                    },CpName);

                    // var csvButon = new dijit.form.Button({
                        // label: 'Export' + prop + ' to CSV',
                        // name: prop,
                        // onClick: function(){
                            // agd.Utils.widgets.MultiSelect.ExportToCSV(this.name);
                        // }
                    // },'csv-button');

                    var dg = new EnhancedGrid({
                        query: {OBJECTID: '*'},
                        id: DgName,
                        store: dataStore,
                        structure: this.tableStructure[prop],
                        clientSort: true,
                        rowSelector: '20px',
                        style: 'width:100%;height:100%;',
                        plugins: {
                            exporter: true
                        }
                    },DgName);

                    dg.setStore(dataStore);

                    this.grid[prop] = dg;

                    var csvString = "data:text/csv;charset=utf-8,";

                    this.grid[prop].exportGrid("csv", {writerArgs: {separator:","}}, function(str){
                        csvString += str;
                    });

                    //browser name and version as array
                    var bid = this._browserId();

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

        ExportToCSV : function(name) {
            
            var csvString = "";

            this.grid[name].exportGrid("csv", {writerArgs: {separator:","},fetchArgs:{start:0,count:this.limit}}, function(str){
                csvString += str;
            });

            var output = csvString.replace(/(\r\n|\n|\r)/gm, "|");


            var form = document.createElement("form");
            form.setAttribute("id","csv-form");
            form.setAttribute("method", "post");
            form.setAttribute("action", this.serviceUrl);

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

        Clear : function() {
            this.map.graphics.clear();

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

            for (var prop in this.table) {
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

        _browserId: function(){
            var N, M, ua, tem;
            N = window.navigator.appName;
            ua = window.navigator.userAgent;
            M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
            if(M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
            M= M? [M[1], M[2]]: [N, window.navigator.appVersion,'-?'];
            return M;
        },

        // show widget
        show: function(){
            this.set("visible", true);  
        },
        // hide widget
        hide: function(){
            this.set("visible", false);
        },
        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _init: function() {
            // show or hide widget
            this._visible();
            // widget is now loaded
            this.set("loaded", true);
            this.emit("load", {});
        },
        // show or hide widget
        _visible: function(){
            if(this.get("visible")){
                domStyle.set(this.domNode, 'display', 'block');
            }
            else{
                domStyle.set(this.domNode, 'display', 'none');
            }
        }
        
    });
    return Widget;
});