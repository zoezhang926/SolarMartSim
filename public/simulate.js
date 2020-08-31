// this function use jquery to post parameters from form, and modify changes in 
// the simulation result. It avoids to use POST on the home webpage, so that it
// does not refresh the page, and reloading 3d model.
//
// it refers to this online tutorials:
// https://code.tutsplus.com/tutorials/submit-a-form-without-page-refresh-using-jquery--net-59

/* global $*/

$(function() {
  $("#parameters").on("submit", function(event) {

    if ($("#parameters").valid()) { // if all required field are validated
      // do simulation, and modify the simulation result table
      // $("input[name='modelUnit']").prop("value", 99);
      var data = {
        roofTilt: $("input#roofTilt").val(),
        roofAzimuth: $("input#roofAzimuth").val(),
        unitOfModel: $("input#modelUnit").val(),
        pvModule: $("select#pvModule").val(),
        installCost: $("input#installCost").val(),
        unitElectricityCost: $("input#unitElecCost").val()
      };
      console.log(data);
      // Post and run simulation
      $.ajax({
        type: "POST",
        dataType: "json",
        url: "/simulate",
        // async: false,
        data: data,
        success: function(data) {
          var result = JSON.parse(data);
          // modify the table value
          $("th#annualElec").text(result.annualElec).css('color', 'red');
          $("th#annualSave").text(result.annualSave).css('color', 'red');
          $("th#totalInstallCost").text(result.totalInstallCost).css('color', 'red');
          $("th#payback").text(result.payback).css('color', 'red');
        },
        error: function() {
          console.log("error on call /simulate");
        }
      }).done(function() {
        console.log("call /simulate endpoint success!");
      });

      event.preventDefault();
    }
  });
});
