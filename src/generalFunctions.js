/** Helper functions */

function utcnow() {
    var d = new Date();
    return d.getTime() * .001; // Number of ms since Jan 1, 1970
  }
  
  function utcnowdate() {
    return Utilities.formatDate(new Date(), "GMT+0")
  }
  

  function sheetsUiMessage(title,message) {
    var ui = SpreadsheetApp.getUi();
    ui.alert(title,message, ui.ButtonSet.OK);
  }


  function sheetsUiConfirmation(title,message) {
    var ui = SpreadsheetApp.getUi();
    let response = ui.alert(title,message, ui.ButtonSet.YES_NO);

    let result;
    if(response === ui.Button.YES){
      result = true
    } else {
      result = false
    }
    return result
  }