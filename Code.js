function doGet(e) {
  const action = String(
    e.parameter.action || ''
  ).trim().toLowerCase();


  // ==========================================
  // PUBLIC CARD LOOKUP
  // ==========================================

  if (action === 'card') {

    const cardCode = String(
      e.parameter.card || ''
    ).trim();

    if (!cardCode) {
      return jsonResponse({
        success: false,
        message: 'Card Code tidak diberikan.'
      });
    }

    return jsonResponse(
      getCardForScanner(cardCode)
    );
  }


  // ==========================================
  // ACTIVATION CONFIG
  // ==========================================

  if (action === 'activation-config') {
    return jsonResponse(
      getActivationConfig()
    );
  }


  // ==========================================
  // DEACTIVATION CONFIG
  // ==========================================

  if (action === 'deactivation-config') {
    return jsonResponse(
      getDeactivationConfig()
    );
  }


  // ==========================================
  // LOAD CARDS FOR DEACTIVATION
  // ==========================================

  if (action === 'load-cards-for-deactivation') {
    return jsonResponse(
      loadCardsForDeactivation()
    );
  }


  // ==========================================
  // OTHER QR REQUESTS
  // ==========================================

  return handleQRRequest(e);
}


function doPost(e) {

  try {

    const data = JSON.parse(
      e.postData.contents
    );

    const action = String(
      data.action || ''
    ).trim().toLowerCase();


    // ==========================================
    // CREATE AUTHENTICATED OPERATOR SESSION
    // ==========================================
    //
    // Frontend sends:
    //
    // {
    //   action: "create-session",
    //   operatorPin: "1234"
    // }
    //
    // SessionService handles:
    // - PIN authentication
    // - session ID generation
    // - session token generation
    // - expiry
    // - ACTIVE status
    //
    // ==========================================

    if (action === 'create-session') {

      return jsonResponse(
        createSession(
          data.operatorPin
        )
      );
    }


    // ==========================================
    // TERMINATE SESSION
    // ==========================================

    if (action === 'terminate-session') {

      return jsonResponse(
        terminateSession(
          data.sessionToken
        )
      );
    }


    // ==========================================
    // RECORD SCORE
    // ==========================================
    //
    // Backend MUST validate sessionToken
    // inside recordScore().
    //
    // ==========================================

    if (action === 'record-score') {

      return jsonResponse(
        recordScore(
          data.sessionToken,
          data.cardCode,
          data.points
        )
      );
    }


    // ==========================================
    // ACTIVATE CARD
    // ==========================================

    if (action === 'activate') {

      return jsonResponse(
        activateCard(
          data.cardCode,
          data.fullName,
          data.nim,
          data.course
        )
      );
    }


    // ==========================================
    // DEACTIVATE CARD
    // ==========================================

    if (action === 'deactivate') {

      return jsonResponse(
        deactivateCard(
          data.cardCode
        )
      );
    }


    // ==========================================
    // UNKNOWN ACTION
    // ==========================================

    return jsonResponse({
      success: false,
      message: 'Unknown API action.'
    });


  } catch (error) {

    console.error(
      'API error:',
      error
    );

    return jsonResponse({
      success: false,
      message:
        'API error: ' +
        error.message
    });
  }
}


 // ============================================================
 // JSON RESPONSE
 // ============================================================

function jsonResponse(data) {

  return ContentService
    .createTextOutput(
      JSON.stringify(data)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}
