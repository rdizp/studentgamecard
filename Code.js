function doGet(e) {

  const action =
    String(
      e.parameter.action || ''
    )
      .trim()
      .toLowerCase();


  // ==========================================
  // GET CARD
  // ==========================================

  if (action === 'card') {

    const cardCode =
      String(
        e.parameter.card || ''
      ).trim();


    if (!cardCode) {

      return jsonResponse({
        success: false,
        message:
          'Card Code tidak diberikan.'
      });

    }


    const result =
      getCardForScanner(
        cardCode
      );


    return jsonResponse(
      result
    );

  }


  // ==========================================
  // ACTIVATION CONFIG
  // ==========================================

  if (
    action ===
    'activation-config'
  ) {

    return jsonResponse(
      getActivationConfig()
    );

  }


  // ==========================================
  // DEACTIVATION CONFIG
  // ==========================================

  if (
    action ===
    'load-cards-for-deactivation'
  ) {

    return jsonResponse(
      loadCardsForDeactivation()
    );

  }


  // ==========================================
  // EXISTING WEB APP
  // ==========================================

  return handleQRRequest(e);

}


// ==========================================
// POST API
// ==========================================

function doPost(e) {

  try {

    const data =
      JSON.parse(
        e.postData.contents
      );


    const action =
      String(
        data.action || ''
      )
        .trim()
        .toLowerCase();


    // ========================================
    // RECORD SCORE
    // ========================================

    if (
      action ===
      'record-score'
    ) {

      return jsonResponse(
        recordScore(
          data.cardCode,
          data.points
        )
      );

    }


    // ========================================
    // ACTIVATE CARD
    // ========================================

    if (
      action ===
      'activate'
    ) {

      return jsonResponse(
        activateCard(
          data.cardCode,
          data.fullName,
          data.nim,
          data.course
        )
      );

    }


    // ========================================
    // DEACTIVATE CARD
    // ========================================

    if (
      action ===
      'deactivate'
    ) {

      return jsonResponse(
        deactivateCard(
          data.cardCode
        )
      );

    }


    return jsonResponse({

      success: false,

      message:
        'Unknown API action.'

    });


  } catch (error) {

    return jsonResponse({

      success: false,

      message:
        'API error: ' +
        error.message

    });

  }

}


// ==========================================
// JSON RESPONSE
// ==========================================

function jsonResponse(data) {

  return ContentService
    .createTextOutput(
      JSON.stringify(data)
    )
    .setMimeType(
      ContentService
        .MimeType
        .JSON
    );

}
