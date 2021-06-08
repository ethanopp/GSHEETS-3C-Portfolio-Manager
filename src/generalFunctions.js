/** Helper functions */

  function sheetsUiMessage(title,message) {
    var ui = SpreadsheetApp.getUi();
    ui.alert(title,message, ui.ButtonSet.OK);
  }