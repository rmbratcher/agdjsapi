/**
 * @class agd.Widgets.Print
 * @constructor
 *
 * Parameters:
 * url - {String} url of the print service
 * PrintDefs - {object} object that contains key : value pairs of parameters for the print service
 *
 */
agd.Widgets.Print = agd.Class({ /** @this {agd.Widgets.Print} */
    initialize: function(url, PrintDefs, title, subtitle, disclamer) {
        this.currentIdentifyAttributes = null;

        this.currentIdentifyGeom = null;

        this.currentIdentifyMatrix = null;

        this.printDefs = PrintDefs;

        this.url = url;

        this.title = title;

        this.subtitle = subtitle;

        this.disclamer = disclamer;
    },

    /**
     * Method: createPrintImage
     *
     */
    createPrintImage: function() {

        var printInfo, form;

        printInfo = {};

        printInfo.bounds = map.extent;
        printInfo.height = map.height;
        printInfo.width = map.width;
        printInfo.layers = [];
        printInfo.title = this.title;
        printInfo.subtitle = this.subtitle;
        printInfo.disclamer = this.disclamer;
        printInfo.srs = map.spatialReference.wkid;

        // Check the layer id from the last identify to see if it is in the printDefs Object
        // if it's there use the field names and order from it.  else use them all
        if (agd.Utils.currentFeatures.length > 0) {
            var layerId = undefined;

            if (agd.Utils.currentFeatures[0].hasOwnProperty('layerId')) {
                layerId = agd.Utils.currentFeatures[0].layerId.toString();
            }


            if (layerId != undefined || layerId != 'undefined') {
                if (this.printDefs.hasOwnProperty(layerId)) {
                    printInfo.attributes = {};
                    for (var x = 0; x < this.printDefs[layerId].length; x += 1) {
                        var name = this.printDefs[layerId][x];
                        var split = name.split('.');
                        if (split.length > 1) {
                            name = split[1];
                        }
                        printInfo.attributes[name] = agd.Utils.currentFeatures[0].feature.attributes[name];
                    }
                } else {
                    printInfo.attributes = agd.Utils.currentFeatures[0].feature.attributes;
                }
            } else {
                printInfo.attributes = agd.Utils.currentFeatures[0].feature.attributes;
            }
        } else {
            printInfo.attributes = {};
        }

        printInfo.path = []; //agd.Utils.currentIdentifyGeom;
        //printInfo.matrix = agd.Utils.currentIdentifyMatrix;

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
                            if (lyrInfoH.visible || lyrInfoH.parentLayerId > -1) {
                                if (lyrInfoH.subLayerIds != null || lyrInfoH.subLayerIds != undefined) {

                                    if (lyrInfoH.subLayerIds.length > 0) {
                                        for (var u = 0; u < lyrInfoH.subLayerIds.length; u += 1) {
                                            var sublyrInfoH = lyr.layerInfos[lyrInfoH.subLayerIds[u]];
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
                        if (hasVisibleLayers || lyr.visibleLayers.length > 0) {
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
        form.setAttribute("action", this.url);
        form.setAttribute("target", "formresult");

        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("name", "printinfo");
        hiddenField.setAttribute("value", JSON.stringify(printInfo));
        form.appendChild(hiddenField);
        document.body.appendChild(form);

        // creating the 'formresult' window with custom features prior to submitting the form
        window.open('test.html', 'formresult');

        form.submit();

    }
});