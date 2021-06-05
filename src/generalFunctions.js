/** Helper functions */

function utcnow() {
    var d = new Date();
    return d.getTime() * .001; // Number of ms since Jan 1, 1970
  }
  
  function utcnowdate() {
    return Utilities.formatDate(new Date(), "GMT+0", "MM/dd/yyyy")
  }
  

  function sheetsUiMessage(title,message) {
    var ui = SpreadsheetApp.getUi();
    ui.alert(title,message, ui.ButtonSet.OK);
  }