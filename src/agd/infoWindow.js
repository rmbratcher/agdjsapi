define([
    "dojo/Evented",
    "dojo/parser",
    "dojo/on",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/fx/Toggler",
    "dojo/fx",
    "dojo/Deferred",
    "esri/domUtils",
    "esri/InfoWindowBase",
    "dijit/_TemplatedMixin"

],
function(
    Evented,
    parser,
    on,
    declare,  
    domConstruct,
    array,
    domStyle,
    lang,
    domClass,
    Toggler,
    coreFx,
    Deferred,
    domUtils,
    InfoWindowBase,
    _TemplatedMixin
) {
    return declare([InfoWindowBase, Evented], {
        
        isContentShowing :false,
        templateString: "",

        constructor: function(parameters) {


          lang.mixin(this, parameters);
 

          domClass.add(this.domNode, "agdInfoWindow");

          this._closeButton = domConstruct.create("div",{"class": "close", "title": "Close"}, this.domNode);
          this._title = domConstruct.create("div",{"class": "title"}, this.domNode);
          this._content = domConstruct.create("div",{"class": "content"}, this.domNode);

          this._toggleButton = domConstruct.create("div",{"class": "toggleOpen", "title": "Toggle"}, this.domNode);

          var toggler = new  Toggler({
            "node": this._content,
            showFunc: coreFx.wipeIn,
            hideFunc: coreFx.wipeOut
          });
          //toggler.hide();

          on(this._closeButton, "click", lang.hitch(this, function(){
            //hide the content when the info window is toggled close.
            this.hide(); 
            if(this.isContentShowing){
              toggler.hide();
              this.isContentShowing = false;
              domClass.remove(this._toggleButton);
              domClass.add(this._toggleButton, "toggleOpen");
            }
          }));
          on(this._toggleButton, "click", lang.hitch(this, function(){
            //animate the content display 
              if(this.isContentShowing){
  
                toggler.hide();
                this.isContentShowing = false;
                domClass.remove(this._toggleButton);
                domClass.add(this._toggleButton,"toggleOpen");

              }else{
                toggler.show();
                this.isContentShowing=true;
                domClass.remove(this._toggleButton);
                domClass.add(this._toggleButton,"toggleClose");  
              }

          }));
          //hide initial display 
          domUtils.hide(this.domNode);
          this.isShowing = false;

        },
        setMap: function(map){
          this.inherited(arguments);
          map.on("pan-start", lang.hitch(this, function(){
            this.hide();
          }));
          map.on("zoom-start", lang.hitch(this, function(){
            this.hide();
          }));
         // map.on("zoom-start", //this, this.hide);

        },
        setTitle: function(title){
          this.place(title, this._title);

        },
        setContent: function(content){
          this.place(content, this._content);
        },

        setTemplate: function(template) {
          this.templateString = template;
        },

        setFeatures: function(features) {
            if (features[0].hasOwnProperty("promise")){
              features[0].callback = this.setFeatures;
              return;
            }
            var attr = features[0].attributes;
            var html = "";
            if(this.templateString ==  ""){
              html += "<table>"
              for(var key in attr){

                html += "<tr><td><b>" + key + "</b> : </td><td>" + attr[key] + "</td></tr>"
              }
              html += "</table>";
            }

            this.place(attr[features[0]._layer.displayField],this._title);
            this.place(html,this._content);
            this.show(features[0].geometry.getExtent().getCenter());
        },

        show: function(location){
          if(location.spatialReference){
            location = this.map.toScreen(location);
          }

          //Position 10x10 pixels away from the specified location
          domStyle.set(this.domNode,{
            "left": (location.x + 10) + "px",
            "top": (location.y + 10) + "px"
          });

          //display the info window
          domUtils.show(this.domNode); 
          this.isShowing = true;
          this.onShow();
        },
        hide: function(){
          domUtils.hide(this.domNode);
          this.isShowing = false;
          this.onHide();

        },
        resize: function(width, height){
          domStyle.set(this._content,{
            "width": width + "px",
            "height": height + "px"
          });
          domStyle.set(this._title,{
            "width": width + "px"
          });

        },
        destroy: function(){
          domConstruct.destroy(this.domNode);
          this._closeButton = this._title = this._content = null;

        }


      });

});
