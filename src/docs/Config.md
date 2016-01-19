# Conf.json - the site configuration #

Last update - 7/3/2013 4:30:44 PM 

The conf.json file holds all the information to display your web
application.

Be very careful when making edits as the file must contain valid
json syntax [JSON Lint](http://jsonlint.com/) is a good resource for checking JSON validity.  Also don't forget that javascript and JSON (**J**ava**S**cript **O**bject **N**otation) are case sensitive so section/object/type names listed below must be used exactly as shown.

## Sections of the configuration file: ##

- **mapConfig {Object}** 
	* the container for all of the configuration all of the following sections are contained within this object.

			{
				"mapConfig":{
				}
			}

- **Page {Object}**
		
		"Page": {
		    "style": "steal-gray",
		    "title": "Some Name",
		    "links": [{
			"label": "Google",
			"url": "http://www.google.com/"
		    }, {
			"label": "Yahoo",
			"url": "http://www.yahoo.com/"
		    }],
		    "helpTab": "help.html",
		    "scalebar": true,
		    "scaleview": true
		}

	 * style - {String} name of the css style sheet in the ./css folder without extension
	 * title - {String} text displayed at the top left of the page
	 * links - {Array} list of links displayed at top right of the page
	  
	 	* label - text of link
	 	* url - url of link
	 	
				[
	                {
	                    "label": "Google",
	                    "url": "http://www.google.com/"
	                },
	                {
	                    "label": "Plats",
	                    "url": "http://www.mysite.com/plats/"
	                }
	            ]
	 * helpTab - {String} relative path to help html file
	 * scalebar - {Boolean} whether or not to show a scalebar on the map
	 * scaleview - {Boolean} whether or not to show scale text

- **Extent {Object}**

		"Extent": {
		    "xmin": 436961.12172705395,
		    "ymin": 175832.12411863936,
		    "xmax": 546848.1439280566,
		    "ymax": 239782.768186436,
		    "spatialReference": {
			"wkid": 26985
		    }
		}

	* xmin - {Double} lowest x value for the bounds of the map
	* ymin - {Double} lowest y value for the bounds of the map
	* xmax - {Double} highest x value for the bounds of the map
	* ymax - {Double} highest y value for the bounds of the map
	* spatialReference - {Object} the spatial reference system used
	 		
		* wkid - esri coordinate system id
		* epsg - epsg coordianate system id
		
				"spatialReference":{
	                    "wkid": 26985
	                    }
				or

				"spatialReference":{
	                    "epsg": 2264
	                    }

- **Layers {Array}**

		"layers" : [
		]

    * Layer Object
		* name - {String} name of the layer in the map
		* type - {String} options are 
			* ArcGISTiledMapServiceLayer
			* ArcGISDynamicMapServiceLayer
			* WMS
			* Bing
		* url - {String} url of the resource
		* toggle - {Boolean} show a button in the top right of the map to toggle layer on/off
		* transbtn - {Boolean} add a transparency slider to the toggle button only valid if toggle = true
		* visible - {Boolean} whether or not the layer is visible by default
		* bingKey - {String} only used with Bing layer type is the bing api key received from microsoft.
		
				{
		            "name": "Layer1",
		            "type": "ArcGISDynamicMapServiceLayer",
		            "url": "http://myserver.com/arcgis/rest/services/map1/MapServer",
		            "toggle": false,
		            "transbtn": false,
					"visible":true
		        }

- **Tools {Array}**
	* Optional tool Objects
		* NavTools
			* type - {String} always set to "NavTools"
		* Identify
			* type - {String} always set to "Identify"
			* label - {String} tool tip for button
			* task - {Array}
				* Identify Task Object
					* tolerance - {Integer} radius around click point to search
					* returnGeometry - {Boolean} always set to true
					* layerIds - {Array} an array of layer ids {Integer} to query when the map is clicked
					* layerOptions - {String} always set to "ALL"
					* show - {Boolean}
					* title - {String} text for the popup window use ${PROPERTY_NAME} syntax to use the value of a property from the attributes ie ${PID} to get the PID value from the layer attributes
					* width - {Integer} width of the popup
					* height - {Integer} height of the popup
					* templates - {Object} for each layer id in layerIds you must have a template, it can be empty but it must exist in the templates array. You may use html markup in the template as well as the ${PROPERTY_NAME} syntax to use attribute values.
							
							{
								"21":"<b>${PID}</b>,
								"65":"<h1>${NAME}-${AGE}<h1>"
							}
							
		* Print
			* type - {String} always set to "Print"
			* url - {String} url to a running instance of agd ArcServer Extensions services print service
			* title - {String} text to be displayed at the top of the output pdf.
			* disclaimer - {String} (limit 255 characters) text to be displayed at the bottom of the pdf.
			* printDefs - {Object} an object with properties of layerIds that hold an array of attribute values to put on the printed map.
			
					"printDefs": {
	                    "28": [
	                        "PPIN",
	                        "TaxParcel.Parcel_Number",
	                        "Appraised_AC",
	                        "NAME",
	                        "ADDRESS1",
	                        "ADDRESS2",
	                        "CITY",
	                        "STATE",
	                        "ZIPCODE",
	                        "RANGE",
	                        "TR_SECTION",
	                        "TAX_DIST",
	                        "SUBDIV_CODE",
	                        "PROP_ADD_NUM",
	                        "PROP_STREET",
	                        "LEGAL_DESC",
	                        "TOTAL_ASSESED_VAL"
	                    ],
						"31": [
							"NAME",
							"AGE",
							"SIZE"
						]
                	}

		* Hyperlink
			* type - {String} always set to "Hyperlink"
			* label - {String} tooltip to display for the button
			* target - {String} where on the page to display the retrieved url
			* task - {Object}
				* name - {String} name of the task
				* url - {String} url of the layer
				* tolerance - {Integer}
				* returnGeometry - {Boolean} always set to true
				* layerIds - {Array} only put one item {Integer} in the array it is the layerId of the feature class that you wish to hyperlink from
				* layerOptions - {String} always set to "ALL"
				* show - {Boolean} whether or not to display a popup (normally false)
				* iconClass - {String} a class name for the button to use a custom button default is "hyperlinkIcon"
				* template - {String} the url template to use to retrieve data.  <p>Use **{PROPERTY_NAME}** syntax to get a value from an attribute and **#functionName#** syntax to use a user defined function to format data. The user defined function must be added into the agd.Utils.userFunctions object via the addUserFunction method this can be added into the html template for the page. The example below creates a user defined function of MyFormater (#MyFormater#) and the propertyValue variable will be whatever follows the #MyFormater# tag in the template, for example `http://norealurl.com/getStuff/#MyFormater#{ACCOUNTID}` <br />If {ACCOUNTID} was billbagens the formatted url would be <br /> `http://norealurl.com/getStuff/bobbagens`.</p>
				
						agd.Utils.addUserFunction(
							"MyFormater",
							function(propertyValue){
								return propertyValue.replace("bill","bob");
							});

		* Measure
			* type - {String} always set to "Measure"
			* geometryService - {String} url to the ArcGIS server geometry service
		* GoToXY
			* type - {String} always set to "GoToXY"
			* geometryService - {String} url to the ArcGIS server geometry service
		* MultiSelect
			* type - {String} always set to "MultiSelect"
			* label - {String} tool tip text
			* serviceUrl - {String} url for the Agd ArcServer Extensions services csv service
			* limit - {Integer} number of CSV records to return (may also be limited by the server max records returned value)
			* url - {String} ArcGIS Server map service url
			* layerIds - {Array} list of layer ids {Integer} from the ArcGIS service to allow mulitselct on
			

- **Queries {Array}**

		"Queries" : [
		]

	* QueryTask
		* label - {String} text displayed above input box for search
		* type - {String} always set to "QueryTask"
		* url - {String} url of the ArcGIS server layer to be queried
		* operator - {String} compare operator
			* Options
				* LIKE
				* >
				* <
				* =
		* isNumber - {Boolean} true if the property to be searched is a number field
		* searchBoxLable - {String} text displayed beside the search box to help the user understand what type of text to input
		* searchFields - {Array} an array of field names {String} to search for the search term
		* outFields - {Array} an array of field names to return with query results
		* symbol - {String} name of a symbol from the Symbols section of the configuration
		
				{
			    "label": "Search by Owner",
			    "type": "QueryTask",
			    "url": "http://noname.org/arcgis/rest/services/map1/MapServer/22",
			    "operator": "LIKE",
			    "isNumber": false,
			    "searchBoxLable": "Owner Name",
			    "searchFields": ["OWNNAME1", "OWNNAME2"],
			    "outFields": ["OWNNAME1", "OWNADD1", "OWNCITY", "OWNSTATE", "ACCTID"],
			    "symbol": "DefaultPolygonSymbol"
				}

	* GeocodeTask
		* label - {String} text displayed above input box for search
		* type - {String} always set to "GeocodeTask"
		* searchLable - {String} text displayed beside the search box to help the user understand what type of text to input
		* url - {String} url of the ArcGIS geocode service

				{
				    "label": "Find Address",
				    "type": "GeocodeTask",
				    "searchBoxLable": "Address",
				    "url": "http://noname.org/arcgis/rest/services/AddressLocator/GeocodeServer",
				    "layerIds": [],
				    "searchFields": []
				}


	* FindTask
		* label - {String} text displayed above input box for search
		* type - {String} always set to "FindTask"
		* searchLable - {String} text displayed beside the search box to help the user understand what type of text to input
		* url - {String} url of the ArcGIS map service
		* layerIds - {Array} an array of {Integer} layer id's from the map service to search in
		* searchFields - {Array} an array of field names to search
		
- **Symbols {Array}**

		"Symbols": [
			]

	* name - {String} unique identifier to use when assigning symbol to result
	* style - {Object} Symbol Object [(see esri symbol json representation)](https://developers.arcgis.com/en/javascript/jsapi/symbol.html)

			"name": "DefaultLineSymbol",
			    "style": {
				"type": "esriSFS",
				"style": "esriSFSSolid",
				"color": [115, 76, 0, 255],
				"outline": {
				    "type": "esriSLS",
				    "style": "esriSLSSolid",
				    "color": [110, 110, 110, 255],
				    "width": 1
				}
		    }

		
