/**
 *
 * @constructor
 *
 * Paramaters:
 *      identifyDef {Object}
 *
 */
agd.Widgets.Identify = agd.Class({

	initialize: function(identifyDef) {
		
		
		this.idDef = identifyDef;
		this.idTask = new esri.tasks.IdentifyTask(identifyDef.url);
		this.idParams = new esri.tasks.IdentifyParameters();
		this.idParams.layerIds = identifyDef.layerIds;
		this.idParams.returnGeometry = true;
		this.idParams.spatialReference = map.spatialReference;
		this.idParams.tolerance = identifyDef.tolerance;
		this.idParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
		
		this.idPoint = null;
		this.idGraphics = null;
		this.returnedFeatures = {};
	
	},

	doIdentify : function(evt) {
		var self;
		
		self = agd.Utils.widgets.Identify;
		
		map.graphics.clear();
		
		self.idPoint = new esri.geometry.Point(evt.mapPoint.x, evt.mapPoint.y, map.spatialReference);
		
		self.idGraphics = new esri.Graphic(self.idPoint,agd.Utils.symbols['DefaultPointSymbol']);
		map.graphics.add(location);
		
		self.idParams.geometry = self.idPoint;
		self.idParams.mapExtent = map.extent;
		
		self.idTask.execute(self.idParams, agd.Utils.widgets.Identify.resultHandler, agd.Utils.widgets.Identify.errorHandler)
	},

	resultHandler : function(results) {
		//fn is short for feature name
		var self, ScreenPoint, feature, template, tmp, fn, content, count, firstFeature;
		
		self = agd.Utils.widgets.Identify;
		
		ScreenPoint = map.toScreen(self.idPoint);
		
		self.returnedFeatures = {};
		
		for (var i = 0; i < results.length; i += 1) {
			feature = results[i].feature;
			fn = results[i].layerName;
			if (self.returnedFeatures.hasOwnProperty(fn)) {
				self.returnedFeatures[fn].push(results[i]);
			} else {
				self.returnedFeatures[fn] = [];
				self.returnedFeatures[fn].push(results[i]);
			}
		}
		
		content = "";
		
		content += '<select id="info_feature_select" onchange="agd.Utils.widgets.Identify.selectChange()">';
		count = 0;
		for(var prop in self.returnedFeatures) {
			if (prop) {
				count += 1;
			}
			var res = self.returnedFeatures[prop];
			for (var j = 1; j <= res.length; j += 1) {
				if(count == 1 && j == 1) {
					firstFeature = self.returnedFeatures[prop][j - 1];
				}
				content += '<option value="' + prop + '_' + j + '">' + prop + " " + j + '</option>';
			}
		}
		
		content += '</select><hr /><div id="identify_item_container">';
		
		content += self._getWindowContent(firstFeature);
		self._setMapGraphic(firstFeature);
		
		content += '</div>';
		
		map.infoWindow.resize(415, 200);
		map.infoWindow.setContent(content);
		map.infoWindow.setTitle("Identify Results");
		map.infoWindow.show(self.idPoint, map.getInfoWindowAnchor(ScreenPoint));
        
        if(map.graphics._div.children.length > 0) {
            agd.Utils.currentIdentifyGeom.clear();
            if(map.graphics._div.children.length > 0) {
                for(var k = 0; k < map.graphics._div.children.length; k += 1) {
                    agd.Utils.currentIdentifyGeom.push(map.graphics._div.children[k].shape.path);
                }
                agd.Utils.currentIdentifyMatrix = map.graphics._div.getTransform();
            }
        }
	},

	selectChange : function() {
		var self, vlu, parts, layerName, idx, nContent, result;
		self = agd.Utils.widgets.Identify;
		
		vlu = document.getElementById("info_feature_select").value;
		parts = vlu.split("_");
		if (parts.length > 1) {
			layerName = parts[0];
			idx = parseInt(parts[1]);
			
			result = self.returnedFeatures[layerName][idx - 1];
			
			if(result) {
				nContent = self._getWindowContent(result);
				document.getElementById("identify_item_container").innerHTML = nContent;
				self._setMapGraphic(result);
			}
		}
	
	},

	_setMapGraphic : function(result) {
		var self, template, tGraphics;
		self = agd.Utils.widgets.Identify;
		
		agd.Utils.currentFeatures = [result];
		
		template = self.idDef.templates[result.layerId]
		
		tGraphics = agd.Utils.CreateFeatureGraphic(result.feature, template);
		
		try {
			map.graphics.clear();
		} catch (err) {
			console.log(err);
		}
		
		map.graphics.add(tGraphics);
	},

	_getWindowContent : function(result) {
		var self, tmp, template;
		self = agd.Utils.widgets.Identify;
		
		tmp = self.idDef.templates[result.layerId].replace("#URL", self.idDef.url + "/" + result.layerId);
		template = new esri.InfoTemplate();
		template.setTitle(self.idDef.title);
		template.setContent(tmp);
		result.feature.infoTemplate = template;
		return result.feature.getContent();
	},

	errorHandler : function(error) {
		agd.Utils.Notify('error',error);
	}

});