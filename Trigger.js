function createRawSubmitTrigger() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const triggers =
    ScriptApp.getProjectTriggers();

  const alreadyExists =
    triggers.some(function(trigger) {

      return (
        trigger.getHandlerFunction() ===
        'updateRecap' &&
        trigger.getEventType() ===
        ScriptApp.EventType.ON_FORM_SUBMIT
      );

    });


  if (alreadyExists) {

    return 'Trigger RAW RESPONSES → Recap sudah ada.';

  }


  ScriptApp
    .newTrigger('updateRecap')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();


  return (
    'Trigger RAW RESPONSES → Recap berhasil dibuat.'
  );

}