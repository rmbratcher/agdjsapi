/**
 *
 * @constructor
 *
 * Paramaters:
 * TaxInfo - {Object} Object that has tax districts as name - rate pairs,
 *  baseRate, and special homestead rate  
 * 
 */
agd.Widgets.TaxEstCalc = agd.Class({
	
	initialize: function(TaxInfo) {
        this.baseCalc = TaxInfo.baseRate;
        this.SHCalc = TaxInfo.specialRate;
        this.distvals = TaxInfo.districts;
        this.CalcDialog = null;
    },

    /** 
	 *
	 * Method: ShowDialog
	 * 
	 * Create a new dojo dialog and display it to the user.
	 */
	ShowDialog:  function() {
		
	
		var self = agd.Utils.widgets.TaxEstCalc;

        if(self.CalcDialog != null) {
			try {
				self.CalcDialog.destroyRecursive();
			} catch( error ){}
		}

        var xy = dojo.coords('taxcalc-dailog-button');
		var leftVal = xy.x - 8;
		var topVal = xy.y + 20;
		
		var contentHtml = '<div id="taxcalc-container" style="align: center; padding=10px;"><label>District:</label><br /> \
        <select id="seldistrict" data-dojo-type="dijit.form.ComboBox"><option>--Select--</option>';
        for(var dist in self.distvals) {
            contentHtml += '<option value="' + self.distvals[dist] + '">' + dist + '</option>';
        }
        contentHtml += '</select> <br /><label>Market Value:</label><br />\
                <input id="valInput" data-dojo-type="dijit.form.ValidationTextBox" class="numeric" type="text"/> \
                <button data-dojo-type="dijit.form.Button" id="calculateBtn" value="Calculate">Calculate</button> \
            </div> \
            <div id="results" class="calcresult" style="width=100%;"> \
                <table cellpadding="3"> \
                    <tr><td><b>District:</b></td><td id="distval"></td><td><b>Regular Homestead:</b></td><td id="rhs"></td></tr> \
                    <tr><td><b>Market Value:</b></td><td id="fmv"></td><td><b>Special Homestead:</b></td><td id="shs"></td></tr> \
                    <tr><td></td><td></td><td><b>Without Homestead:</b></td><td id="nhs"></td></tr> \
                </table> \
            </div>';
		
		var styletext = 'width: 450px; height: 245px; top: ' + topVal + 'px; left: ' + leftVal + 'px; visibility:hidden; z-index:100;';

        var showDiv = document.createElement('div');
		showDiv.setAttribute('id','pTaxCalc');
		showDiv.setAttribute('style',styletext);
		showDiv.innerHTML = contentHtml;
		document.body.appendChild(showDiv);
		
		self.CalcDialog = new dojox.layout.FloatingPane({
			resizeable: true,
			dockable: false,
			title: 'Tax Estimate Calculator',
			style: styletext
		},dojo.byId('pTaxCalc'));

        var valInputWidget = dijit.byId('valInput');
        
        //var calcButtonWidget = dijit.byId('calculateBtn');

        dojo.connect(dijit.byId('calculateBtn'),'onClick',function(evt){
            var self = agd.Utils.widgets.TaxEstCalc;
            self.calculate();
        });

        dojo.connect(dijit.byId('seldistrict'),'onChange',function(evt){
            var self = agd.Utils.widgets.TaxEstCalc;
            var realval=parseInt(dijit.byId('valInput').value);
            if(isNaN(realval)){
                return;
            } else {
                self.calculate();
            }
        });

        dojo.connect(dijit.byId('valInput'),'onKeyUp',function(evt){
            var self = agd.Utils.widgets.TaxEstCalc;
            var realval=parseInt(dijit.byId('valInput').value);
            if(isNaN(realval)){
                return;
            } else {
                self.calculate();
            }
            
        });

        self.CalcDialog.startup();
		self.CalcDialog.show();
		self.CalcDialog.bringToTop();
    },

    

    pround: function(num,decimals){
            return Math.round(num*Math.pow(10,decimals))/Math.pow(10,decimals);
        },

    calculate: function() {
            var self = agd.Utils.widgets.TaxEstCalc;
            var fmv = parseInt(dijit.byId('valInput').value);

            var credRate = (Math.ceil((fmv * self.baseCalc ) / 150) * 6);
            if (credRate > 300) {
                credRate = 300;
            }

            var seldist = parseFloat(dijit.byId("seldistrict").item.value);
            var millage = self.pround((seldist * 0.001),5);
            var assessedVal = self.pround((fmv * self.baseCalc),2);
            var taxSubTotal = self.pround((assessedVal * millage),5);

            var amtHS = self.pround((taxSubTotal - credRate),2);
            if (amtHS < 0) {
                amtHS = 0;
            }

            var shs = self.pround(((assessedVal - 7500) * millage),2);
            if (shs < 0) {
                shs = 0;
            }

            //var oth = pround(taxSubTotal,2);
            //if (cname == "Lafayette" && curDist == "County"){s
            var oth = self.pround((fmv * self.SHCalc) * millage,2);
           // }

            if (oth < 0) {
                oth = 0;
            }

            self.showResults(amtHS,shs,oth,fmv);
    },

    showResults: function(amtHS,shs,oth,fmv) {
            document.getElementById("rhs").innerHTML='$' + amtHS.toFixed(2);
            document.getElementById("distval").innerHTML= dijit.byId("seldistrict").item.name;
            document.getElementById("shs").innerHTML='$' + shs.toFixed(2);
            document.getElementById("fmv").innerHTML='$' +  fmv.toFixed(2);
            document.getElementById("nhs").innerHTML='$' +  oth.toFixed(2);
    }

});