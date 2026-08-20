function handleQRRequest(e) {

  const mode =
    String(e.parameter.mode || '')
      .trim()
      .toLowerCase();

  const cardCode =
    String(e.parameter.card || '')
      .trim();


  // ==========================================
  // ACTIVATE STUDENT CARD
  // ==========================================

  if (mode === 'activate') {

    return HtmlService
      .createHtmlOutputFromFile(
        'Activation'
      )
      .setTitle(
        'Activate Student Card'
      );

  }


  // ==========================================
  // DEACTIVATE STUDENT CARD
  // ==========================================

  if (mode === 'deactivate') {

    return HtmlService
      .createHtmlOutputFromFile(
        'Deactivation'
      )
      .setTitle(
        'Deactivate Student Card'
      );

  }


  // ==========================================
  // PLAYER CARD / SCORING
  // ==========================================

  if (!cardCode) {

    return HtmlService
      .createHtmlOutput(
        '<h2>Card Code belum diberikan.</h2>'
      );

  }


  const result =
    findCard(cardCode);


  if (!result.success) {

    return HtmlService
      .createHtmlOutput(
        '<h2>' +
        result.message +
        '</h2>'
      );

  }


  const template =
    HtmlService
      .createTemplateFromFile(
        'Index'
      );


  template.cardData =
    result.data;


  return template
    .evaluate()
    .setTitle(
      'Student Game Card'
    );

}


function getCardForScanner(cardCode) {

  return findCard(cardCode);

}