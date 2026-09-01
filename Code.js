// ==========================================================
// GET API
// ==========================================================

function doGet(e) {

  const action =
    String(
      e.parameter.action || ''
    )
      .trim()
      .toLowerCase();


  // ========================================================
  // GET CARD
  // ========================================================

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


  // ========================================================
  // ACTIVATION CONFIG
  // ========================================================

  if (
    action ===
    'activation-config'
  ) {

    return jsonResponse(
      getActivationConfig()
    );

  }


  // ========================================================
  // DEACTIVATION CONFIG
  // ========================================================

  if (
    action ===
    'deactivation-config'
  ) {

    return jsonResponse(
      getDeactivationConfig()
    );

  }


  // ========================================================
  // LOAD ACTIVE CARDS FOR DEACTIVATION
  // ========================================================

  if (
    action ===
    'load-cards-for-deactivation'
  ) {

    return jsonResponse(
      loadCardsForDeactivation()
    );

  }


  // ========================================================
  // EXISTING WEB APP / QR ROUTES
  // ========================================================

  return handleQRRequest(e);

}


// ==========================================================
// POST API
// ==========================================================

function doPost(e) {

  try {

    if (
      !e ||
      !e.postData ||
      !e.postData.contents
    ) {

      return jsonResponse({

        success: false,

        message:
          'POST data tidak diberikan.'

      });

    }


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


    // ======================================================
    // CREATE SESSION
    // ======================================================

    if (
      action ===
      'create-session'
    ) {

      return jsonResponse(
        createSession(
          data.operatorPin
        )
      );

    }


    // ======================================================
    // TERMINATE SESSION
    // ======================================================

    if (
      action ===
      'terminate-session'
    ) {

      return jsonResponse(
        terminateSession(
          data.sessionToken
        )
      );

    }


    // ======================================================
    // RECORD SCORE
    // ======================================================

    if (
      action ===
      'record-score'
    ) {

      return jsonResponse(
        recordScore(
          data.sessionToken,
          data.cardCode,
          data.points
        )
      );

    }


    // ======================================================
    // ACTIVATE CARD
    // ======================================================

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


    // ======================================================
    // DEACTIVATE CARD
    // ======================================================

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


    // ======================================================
    // UNKNOWN ACTION
    // ======================================================

    return jsonResponse({

      success: false,

      message:
        'Unknown API action.'

    });


  } catch (error) {

    console.error(
      'API ERROR:',
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


// ==========================================================
// JSON RESPONSE
// ==========================================================

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
