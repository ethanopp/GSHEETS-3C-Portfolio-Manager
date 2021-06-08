/** Helper functions */

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