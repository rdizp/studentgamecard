function findCard(cardCode) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName('QR');


  if (!sheet) {

    return {
      success: false,
      message:
        'ERROR: Sheet QR tidak ditemukan.'
    };

  }


  const data =
    sheet
      .getDataRange()
      .getValues();


  if (data.length < 2) {

    return {
      success: false,
      message:
        'ERROR: Sheet QR belum memiliki data kartu.'
    };

  }


  const headers =
    data[0];


  const cardCodeIndex =
    headers.indexOf('Card Code');

  const fullNameIndex =
    headers.indexOf('Full Name');

  const nimIndex =
    headers.indexOf('NIM');

  const courseIndex =
    headers.indexOf(
      'Enrolled Practical Course'
    );

  const statusIndex =
    headers.indexOf('Status');


  if (cardCodeIndex === -1) {

    return {
      success: false,
      message:
        'ERROR: Kolom Card Code tidak ditemukan.'
    };

  }


  const card =
    data
      .slice(1)
      .find(function(row) {

        return (
          String(
            row[cardCodeIndex]
          )
            .trim()
            .toUpperCase() ===

          String(cardCode)
            .trim()
            .toUpperCase()
        );

      });


  if (!card) {

    return {
      success: false,
      message:
        'Card tidak ditemukan: ' +
        cardCode
    };

  }


  return {

    success: true,

    data: {

      cardCode:
        card[cardCodeIndex],

      fullName:
        fullNameIndex !== -1
          ? card[fullNameIndex]
          : '',

      nim:
        nimIndex !== -1
          ? card[nimIndex]
          : '',

      course:
        courseIndex !== -1
          ? card[courseIndex]
          : '',

      status:
        statusIndex !== -1
          ? card[statusIndex]
          : ''

    }

  };

}


// ==================================================
// ACTIVATION CONFIG
// ==================================================

function getActivationConfig() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();


  const qrSheet =
    ss.getSheetByName('QR');

  const configSheet =
    ss.getSheetByName('System Config');


  if (!qrSheet) {

    return {
      success: false,
      message:
        'ERROR: Sheet QR tidak ditemukan.'
    };

  }


  if (!configSheet) {

    return {
      success: false,
      message:
        'ERROR: Sheet System Config tidak ditemukan.'
    };

  }


  // ------------------------------------------
  // AVAILABLE CARDS
  // ------------------------------------------

  const qrData =
    qrSheet
      .getDataRange()
      .getValues();


  const qrHeaders =
    qrData[0];


  const cardCodeIndex =
    qrHeaders.indexOf('Card Code');

  const statusIndex =
    qrHeaders.indexOf('Status');


  if (
    cardCodeIndex === -1 ||
    statusIndex === -1
  ) {

    return {
      success: false,
      message:
        'ERROR: Struktur header QR tidak sesuai.'
    };

  }


  const availableCards = [];


  for (
    let i = 1;
    i < qrData.length;
    i++
  ) {

    const cardCode =
      String(
        qrData[i][cardCodeIndex]
      ).trim();


    const status =
      String(
        qrData[i][statusIndex]
      )
        .trim()
        .toLowerCase();


    if (
      cardCode &&
      status !== 'active'
    ) {

      availableCards.push(
        cardCode
      );

    }

  }


  // ------------------------------------------
  // SYSTEM CONFIG
  // ------------------------------------------

  const configData =
    configSheet
      .getDataRange()
      .getValues();


  const configHeaders =
    configData[0];


  const settingIndex =
    configHeaders.indexOf('Setting');

  const valueIndex =
    configHeaders.indexOf('Value');


  if (
    settingIndex === -1 ||
    valueIndex === -1
  ) {

    return {
      success: false,
      message:
        'ERROR: Struktur header System Config tidak sesuai.'
    };

  }


  let currentPeriod = '';

  const courses = [];


  for (
    let i = 1;
    i < configData.length;
    i++
  ) {

    const setting =
      String(
        configData[i][settingIndex]
      ).trim();


    const value =
      String(
        configData[i][valueIndex]
      ).trim();


    if (!value) {
      continue;
    }


    if (
      setting.toLowerCase() ===
      'current period'
    ) {

      currentPeriod =
        value;

    }


    if (
      setting.toLowerCase() ===
      'course'
    ) {

      courses.push(
        value
      );

    }

  }


  if (!currentPeriod) {

    return {
      success: false,
      message:
        'Current Period belum diatur di System Config.'
    };

  }


  if (courses.length === 0) {

    return {
      success: false,
      message:
        'Belum ada Course di System Config.'
    };

  }


  return {

    success: true,

    data: {

      cards:
        availableCards,

      courses:
        courses,

      currentPeriod:
        currentPeriod

    }

  };

}


// ==================================================
// ACTIVATE CARD
// ==================================================

function activateCard(
  cardCode,
  fullName,
  nim,
  course
) {

  try {

    cardCode =
      String(
        cardCode || ''
      ).trim();

    fullName =
      String(
        fullName || ''
      ).trim();

    nim =
      String(
        nim || ''
      ).trim();

    course =
      String(
        course || ''
      ).trim();


    // ------------------------------------------
    // VALIDATE INPUT
    // ------------------------------------------

    if (!cardCode) {

      return {
        success: false,
        message:
          'Card Code harus dipilih.'
      };

    }


    if (!fullName) {

      return {
        success: false,
        message:
          'Full Name harus diisi.'
      };

    }


    if (!nim) {

      return {
        success: false,
        message:
          'NIM harus diisi.'
      };

    }


    if (!course) {

      return {
        success: false,
        message:
          'Enrolled Practical Course harus dipilih.'
      };

    }


    // ------------------------------------------
    // GET SPREADSHEET
    // ------------------------------------------

    const ss =
      SpreadsheetApp.getActiveSpreadsheet();


    const qrSheet =
      ss.getSheetByName('QR');

    const historySheet =
      ss.getSheetByName(
        'Activation History'
      );

    const configSheet =
      ss.getSheetByName(
        'System Config'
      );


    if (!qrSheet) {

      return {
        success: false,
        message:
          'ERROR: Sheet QR tidak ditemukan.'
      };

    }


    if (!historySheet) {

      return {
        success: false,
        message:
          'ERROR: Sheet Activation History tidak ditemukan.'
      };

    }


    if (!configSheet) {

      return {
        success: false,
        message:
          'ERROR: Sheet System Config tidak ditemukan.'
      };

    }


    // ------------------------------------------
    // READ QR
    // ------------------------------------------

    const qrData =
      qrSheet
        .getDataRange()
        .getValues();


    const qrHeaders =
      qrData[0];


    const cardCodeIndex =
      qrHeaders.indexOf(
        'Card Code'
      );

    const fullNameIndex =
      qrHeaders.indexOf(
        'Full Name'
      );

    const nimIndex =
      qrHeaders.indexOf(
        'NIM'
      );

    const courseIndex =
      qrHeaders.indexOf(
        'Enrolled Practical Course'
      );

    const statusIndex =
      qrHeaders.indexOf(
        'Status'
      );


    if (
      cardCodeIndex === -1 ||
      fullNameIndex === -1 ||
      nimIndex === -1 ||
      courseIndex === -1 ||
      statusIndex === -1
    ) {

      return {
        success: false,
        message:
          'ERROR: Struktur header QR tidak sesuai.'
      };

    }


    // ------------------------------------------
    // FIND CARD ROW
    // ------------------------------------------

    let cardRowIndex = -1;


    for (
      let i = 1;
      i < qrData.length;
      i++
    ) {

      const currentCode =
        String(
          qrData[i][cardCodeIndex]
        )
          .trim()
          .toUpperCase();


      if (
        currentCode ===
        cardCode.toUpperCase()
      ) {

        cardRowIndex = i;

        break;

      }

    }


    if (cardRowIndex === -1) {

      return {
        success: false,
        message:
          'Card tidak ditemukan: ' +
          cardCode
      };

    }


    // ------------------------------------------
    // CHECK CURRENT STATUS
    // ------------------------------------------

    const currentStatus =
      String(
        qrData[cardRowIndex][statusIndex]
      )
        .trim()
        .toLowerCase();


    if (
      currentStatus === 'active'
    ) {

      return {
        success: false,
        message:
          'Card sudah aktif dan sedang digunakan.'
      };

    }


    // ------------------------------------------
    // GET CURRENT PERIOD
    // ------------------------------------------

    const configData =
      configSheet
        .getDataRange()
        .getValues();


    const configHeaders =
      configData[0];


    const settingIndex =
      configHeaders.indexOf(
        'Setting'
      );

    const valueIndex =
      configHeaders.indexOf(
        'Value'
      );


    if (
      settingIndex === -1 ||
      valueIndex === -1
    ) {

      return {
        success: false,
        message:
          'ERROR: Struktur header System Config tidak sesuai.'
      };

    }


    let currentPeriod = '';


    for (
      let i = 1;
      i < configData.length;
      i++
    ) {

      const setting =
        String(
          configData[i][settingIndex]
        )
          .trim()
          .toLowerCase();


      if (
        setting ===
        'current period'
      ) {

        currentPeriod =
          String(
            configData[i][valueIndex]
          ).trim();

        break;

      }

    }


    if (!currentPeriod) {

      return {
        success: false,
        message:
          'Current Period belum diatur di System Config.'
      };

    }


    // ------------------------------------------
    // UPDATE QR
    // ------------------------------------------

    const sheetRow =
      cardRowIndex + 1;


    qrSheet
      .getRange(
        sheetRow,
        fullNameIndex + 1
      )
      .setValue(fullName);


    qrSheet
      .getRange(
        sheetRow,
        nimIndex + 1
      )
      .setValue(nim);


    qrSheet
      .getRange(
        sheetRow,
        courseIndex + 1
      )
      .setValue(course);


    qrSheet
      .getRange(
        sheetRow,
        statusIndex + 1
      )
      .setValue('ACTIVE');


    // ------------------------------------------
    // ACTIVATION HISTORY
    // ------------------------------------------

    const historyData =
      historySheet
        .getDataRange()
        .getValues();


    const historyHeaders =
      historyData[0];

    const historyCardCodeIndex =
      historyHeaders.indexOf(
        'Card Code'
      );

    const historyFullNameIndex =
      historyHeaders.indexOf(
        'Full Name'
      );

    const historyNimIndex =
      historyHeaders.indexOf(
        'NIM'
      );

    const historyCourseIndex =
      historyHeaders.indexOf(
        'Enrolled Practical Course'
      );

    const historyPeriodIndex =
      historyHeaders.indexOf(
        'Period'
      );

    const activatedAtIndex =
      historyHeaders.indexOf(
        'Activated At'
      );

    const deactivatedAtIndex =
      historyHeaders.indexOf(
        'Deactivated At'
      );

    const durationIndex =
      historyHeaders.indexOf(
        'Duration'
      );


    if (
      historyCardCodeIndex === -1 ||
      historyFullNameIndex === -1 ||
      historyNimIndex === -1 ||
      historyCourseIndex === -1 ||
      historyPeriodIndex === -1 ||
      activatedAtIndex === -1 ||
      deactivatedAtIndex === -1 ||
      durationIndex === -1
    ) {

      return {
        success: false,
        message:
          'ERROR: Struktur header Activation History tidak sesuai.'
      };

    }


    const activatedAt =
      new Date();


    const nextNo =
      historyData.length;


    const newHistoryRow =
      new Array(
        historyHeaders.length
      ).fill('');

    newHistoryRow[
      historyCardCodeIndex
    ] =
      cardCode;

    newHistoryRow[
      historyFullNameIndex
    ] =
      fullName;

    newHistoryRow[
      historyNimIndex
    ] =
      nim;

    newHistoryRow[
      historyCourseIndex
    ] =
      course;

    newHistoryRow[
      historyPeriodIndex
    ] =
      currentPeriod;

    newHistoryRow[
      activatedAtIndex
    ] =
      activatedAt;

    newHistoryRow[
      deactivatedAtIndex
    ] =
      '';

    newHistoryRow[
      durationIndex
    ] =
      '';


    historySheet
      .appendRow(
        newHistoryRow
      );


    return {

      success: true,

      message:
        'Card berhasil diaktifkan.',

      data: {

        cardCode:
          cardCode,

        fullName:
          fullName,

        nim:
          nim,

        course:
          course,

        period:
          currentPeriod,

        activatedAt:
          activatedAt.toISOString()

      }

    };


  } catch (error) {

    return {

      success: false,

      message:
        'Activation error: ' +
        error.message

    };

  }

}


// ==================================================
// RECORD SCORE
// ==================================================

function recordScore(
  cardCode,
  points
) {

  const recordSheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        'Individual Record'
      );


  if (!recordSheet) {

    return {
      success: false,
      message:
        'ERROR: Sheet Individual Record tidak ditemukan.'
    };

  }


  const cardResult =
    findCard(cardCode);


  if (!cardResult.success) {
    return cardResult;
  }


  const card =
    cardResult.data;


  if (
    String(card.status)
      .trim()
      .toLowerCase() !==
    'active'
  ) {

    return {
      success: false,
      message:
        'Kartu belum aktif atau sudah tidak aktif.'
    };

  }


  const score =
    Number(points);


  if (
    !Number.isFinite(score) ||
    score <= 0
  ) {

    return {
      success: false,
      message:
        'Poin tidak valid.'
    };

  }


  const data =
    recordSheet
      .getDataRange()
      .getValues();


  const headers =
    data[0];


  const noIndex =
    headers.indexOf('NO');

  const timestampIndex =
    headers.indexOf('Timestamp');

  const cardCodeIndex =
    headers.indexOf('Card Code');

  const fullNameIndex =
    headers.indexOf('Full Name');

  const nimIndex =
    headers.indexOf('NIM');

  const courseIndex =
    headers.indexOf(
      'Enrolled Practical Course'
    );

  const pointsIndex =
    headers.indexOf('Points');


  if (
    noIndex === -1 ||
    timestampIndex === -1 ||
    cardCodeIndex === -1 ||
    fullNameIndex === -1 ||
    nimIndex === -1 ||
    courseIndex === -1 ||
    pointsIndex === -1
  ) {

    return {
      success: false,
      message:
        'ERROR: Struktur header Individual Record tidak sesuai.'
    };

  }


  const nextNo =
    data.length;


  const timestamp =
    new Date();


  const newRow =
    new Array(
      headers.length
    ).fill('');


  newRow[noIndex] =
    nextNo;

  newRow[timestampIndex] =
    timestamp;

  newRow[cardCodeIndex] =
    card.cardCode;

  newRow[fullNameIndex] =
    card.fullName;

  newRow[nimIndex] =
    card.nim;

  newRow[courseIndex] =
    card.course;

  newRow[pointsIndex] =
    score;


  recordSheet
    .appendRow(
      newRow
    );


  try {

    updateRecap();

  } catch (error) {

    return {
      success: false,
      message:
        'Points berhasil disimpan, tetapi Recap gagal diperbarui: ' +
        error.message
    };

  }


  return {

    success: true,

    message:
      'Points recorded successfully.',

    data: {

      no:
        nextNo,

      timestamp:
        timestamp.toISOString(),

      cardCode:
        card.cardCode,

      fullName:
        card.fullName,

      nim:
        card.nim,

      course:
        card.course,

      points:
        score

    }

  };

}


// ==================================================
// GENERATE RECORD QR
// ==================================================

const WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbwqDppJc8kVL4tkjlibwLTbU4wtb030Q3AyEgr6g82rMT9ld1AWILgdsYdQneeOy8Wlxg/exec';


function generateRecordQRs() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName('QR');


  if (!sheet) {

    throw new Error(
      'Sheet QR tidak ditemukan.'
    );

  }


  const data =
    sheet
      .getDataRange()
      .getValues();


  if (data.length < 2) {

    throw new Error(
      'Belum ada data card di sheet QR.'
    );

  }


  const headers =
    data[0];


  const cardCodeIndex =
    headers.indexOf(
      'Card Code'
    );

  const qrIndex =
    headers.indexOf(
      'QR'
    );


  if (cardCodeIndex === -1) {

    throw new Error(
      'Kolom Card Code tidak ditemukan.'
    );

  }


  if (qrIndex === -1) {

    throw new Error(
      'Kolom QR tidak ditemukan.'
    );

  }


  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    const cardCode =
      String(
        data[i][cardCodeIndex]
      ).trim();


    if (!cardCode) {
      continue;
    }


    const recordUrl =
      WEB_APP_URL +
      '?card=' +
      encodeURIComponent(
        cardCode
      );


    const qrUrl =
      'https://quickchart.io/qr' +
      '?size=1000' +
      '&margin=4' +
      '&text=' +
      encodeURIComponent(
        recordUrl
      );


    sheet
      .getRange(
        i + 1,
        qrIndex + 1
      )
      .setFormula(
        '=IMAGE("' +
        qrUrl +
        '";4;180;180)'
      );

  }


  sheet.setColumnWidth(
    qrIndex + 1,
    200
  );


  for (
    let i = 2;
    i <= data.length;
    i++
  ) {

    sheet.setRowHeight(
      i,
      190
    );

  }


  SpreadsheetApp.flush();


  return (
    'Record QR berhasil dibuat.'
  );

}


// ==================================================
// UPDATE RECAP
// ==================================================

function updateRecap() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const rawSheet = ss.getSheetByName('RAW RESPONSES');
  const recordSheet = ss.getSheetByName('Individual Record');
  const historySheet = ss.getSheetByName('Activation History');
  const recapSheet = ss.getSheetByName('Recap');


  // ==========================================
  // VALIDATE SHEETS
  // ==========================================

  if (!rawSheet) {
    throw new Error('Sheet RAW tidak ditemukan.');
  }

  if (!recordSheet) {
    throw new Error('Sheet Individual Record tidak ditemukan.');
  }

  if (!historySheet) {
    throw new Error('Sheet Activation History tidak ditemukan.');
  }

  if (!recapSheet) {
    throw new Error('Sheet Recap tidak ditemukan.');
  }


  // ==========================================
  // READ DATA
  // ==========================================

  const rawData =
    rawSheet.getDataRange().getValues();

  const recordData =
    recordSheet.getDataRange().getValues();

  const historyData =
    historySheet.getDataRange().getValues();


  // ==========================================
  // HEADER RAW
  // ==========================================

  if (rawData.length < 1) {
    throw new Error('RAW belum memiliki header.');
  }

  const rawHeaders = rawData[0];

  const rawNameIndex =
    rawHeaders.indexOf('Nama Lengkap');

  const rawNimIndex =
    rawHeaders.indexOf('NIM');

  const rawCourseIndex =
    rawHeaders.indexOf(
      'Mata Kuliah Praktek yang Diikuti'
    );

  const rawScoreIndex =
    rawHeaders.indexOf('Hasil Game');


  if (
    rawNameIndex === -1 ||
    rawNimIndex === -1 ||
    rawCourseIndex === -1 ||
    rawScoreIndex === -1
  ) {
    throw new Error(
      'Header RAW tidak sesuai. ' +
      'Pastikan ada: Nama Lengkap, NIM, ' +
      'Mata Kuliah Praktek yang Diikuti, Hasil Game.'
    );
  }


  // ==========================================
  // HEADER INDIVIDUAL RECORD
  // ==========================================

  if (recordData.length < 1) {
    throw new Error(
      'Individual Record belum memiliki header.'
    );
  }

  const recordHeaders = recordData[0];

  const recordTimestampIndex =
    recordHeaders.indexOf('Timestamp');

  const recordCardCodeIndex =
    recordHeaders.indexOf('Card Code');

  const recordFullNameIndex =
    recordHeaders.indexOf('Full Name');

  const recordNimIndex =
    recordHeaders.indexOf('NIM');

  const recordCourseIndex =
    recordHeaders.indexOf(
      'Enrolled Practical Course'
    );

  const recordPointsIndex =
    recordHeaders.indexOf('Points');


  if (
    recordTimestampIndex === -1 ||
    recordCardCodeIndex === -1 ||
    recordFullNameIndex === -1 ||
    recordNimIndex === -1 ||
    recordCourseIndex === -1 ||
    recordPointsIndex === -1
  ) {
    throw new Error(
      'Header Individual Record tidak sesuai.'
    );
  }


  // ==========================================
  // HEADER ACTIVATION HISTORY
  // ==========================================

  if (historyData.length < 1) {
    throw new Error(
      'Activation History belum memiliki header.'
    );
  }

  const historyHeaders = historyData[0];

  const historyCardCodeIndex =
    historyHeaders.indexOf('Card Code');

  const historyPeriodIndex =
    historyHeaders.indexOf('Period');

  const historyActivatedAtIndex =
    historyHeaders.indexOf('Activated At');

  const historyDeactivatedAtIndex =
    historyHeaders.indexOf('Deactivated At');


  if (
    historyCardCodeIndex === -1 ||
    historyPeriodIndex === -1 ||
    historyActivatedAtIndex === -1 ||
    historyDeactivatedAtIndex === -1
  ) {
    throw new Error(
      'Header Activation History tidak sesuai.'
    );
  }


  // ==========================================
  // FIND ACTIVATION PERIOD
  // ==========================================

  function findActivationPeriod(
    cardCode,
    recordTimestamp
  ) {

    const normalizedCardCode =
      String(cardCode || '')
        .trim()
        .toUpperCase();

    const scoreDate =
      new Date(recordTimestamp);


    if (
      !normalizedCardCode ||
      isNaN(scoreDate.getTime())
    ) {
      return '';
    }


    for (
      let i = historyData.length - 1;
      i >= 1;
      i--
    ) {

      const row = historyData[i];

      const historyCardCode =
        String(
          row[historyCardCodeIndex] || ''
        )
          .trim()
          .toUpperCase();


      if (
        historyCardCode !==
        normalizedCardCode
      ) {
        continue;
      }


      const activatedAt =
        row[historyActivatedAtIndex];


      if (!activatedAt) {
        continue;
      }


      const activatedDate =
        new Date(activatedAt);


      if (
        isNaN(
          activatedDate.getTime()
        )
      ) {
        continue;
      }


      const deactivatedAt =
        row[historyDeactivatedAtIndex];


      let deactivatedDate = null;


      if (
        deactivatedAt !== '' &&
        deactivatedAt !== null
      ) {

        deactivatedDate =
          new Date(deactivatedAt);


        if (
          isNaN(
            deactivatedDate.getTime()
          )
        ) {
          deactivatedDate = null;
        }

      }


      const afterActivation =
        scoreDate.getTime() >=
        activatedDate.getTime();


      const beforeDeactivation =
        deactivatedDate === null ||
        scoreDate.getTime() <=
        deactivatedDate.getTime();


      if (
        afterActivation &&
        beforeDeactivation
      ) {

        return String(
          row[historyPeriodIndex] || ''
        ).trim();

      }

    }


    return '';

  }


  // ==========================================
  // GROUPED STUDENT DATA
  // ==========================================

  const grouped = {};


  function normalizeNim(value) {

    return String(value || '')
      .trim();

  }


  function normalizeCourse(value) {

    return String(value || '')
      .trim()
      .toLowerCase();

  }


  function makeKey(nim, course) {

    return (
      normalizeNim(nim) +
      '||' +
      normalizeCourse(course)
    );

  }


  // ==========================================
  // READ RAW
  // ==========================================
  //
  // RAW = BASE SCORE
  //
  // Semua RAW submission dianggap valid.
  //
  // Identitas:
  // Nama Lengkap
  // NIM
  // Mata Kuliah
  //
  // Score:
  // Hasil Game
  //
  // Multiple submission mahasiswa
  // akan dijumlahkan.
  // ==========================================

  for (
    let i = 1;
    i < rawData.length;
    i++
  ) {

    const row = rawData[i];

    const fullName =
      String(
        row[rawNameIndex] || ''
      ).trim();

    const nim =
      normalizeNim(
        row[rawNimIndex]
      );

    const course =
      String(
        row[rawCourseIndex] || ''
      ).trim();

    const gameScore =
      Number(
        row[rawScoreIndex]
      ) || 0;


    if (!nim || !course) {
      continue;
    }


    const key =
      makeKey(
        nim,
        course
      );


    if (!grouped[key]) {

      grouped[key] = {

        fullName: fullName,

        nim: nim,

        course: course,

        basePoints: 0,

        periods: {}

      };

    }


    // Identity comes from RAW.
    // Do NOT overwrite it later.

    grouped[key].basePoints +=
      gameScore;

  }


  // ==========================================
  // READ INDIVIDUAL RECORD
  // ==========================================
  //
  // Individual Record = ADDITIONAL POINTS
  //
  // Individual Record tetap masuk
  // walaupun mahasiswa tidak ada di RAW.
  // ==========================================

  for (
    let i = 1;
    i < recordData.length;
    i++
  ) {

    const row = recordData[i];

    const timestamp =
      row[recordTimestampIndex];

    const cardCode =
      String(
        row[recordCardCodeIndex] || ''
      ).trim();

    const recordFullName =
      String(
        row[recordFullNameIndex] || ''
      ).trim();

    const nim =
      normalizeNim(
        row[recordNimIndex]
      );

    const course =
      String(
        row[recordCourseIndex] || ''
      ).trim();

    const points =
      Number(
        row[recordPointsIndex]
      ) || 0;


    if (!nim || !course) {
      continue;
    }


    const key =
      makeKey(
        nim,
        course
      );


    // ========================================
    // STUDENT NOT IN RAW
    // ========================================
    //
    // Tetap buat student record.
    // Identity diambil dari Individual Record
    // hanya karena RAW belum punya student ini.
    // ========================================

    if (!grouped[key]) {

      grouped[key] = {

        fullName:
          recordFullName,

        nim:
          nim,

        course:
          course,

        basePoints:
          0,

        periods: {}

      };

    }


    const period =
      findActivationPeriod(
        cardCode,
        timestamp
      );


    // Kalau tidak menemukan activation,
    // poin individual tetap jangan dibuang.
    //
    // Kita taruh sebagai period kosong.

    const periodKey =
      period || '';


    if (
      grouped[key]
        .periods[periodKey] === undefined
    ) {

      grouped[key]
        .periods[periodKey] = 0;

    }


    grouped[key]
      .periods[periodKey] +=
      points;

  }


  // ==========================================
  // BUILD RECAP
  // ==========================================

  const recapRows = [];


  Object.values(
    grouped
  ).forEach(
    function(item) {

      const periods =
        Object.keys(
          item.periods
        );


      // ========================================
      // ADA INDIVIDUAL RECORD
      // ========================================

      if (periods.length > 0) {

        periods.forEach(
          function(period) {

            const additionalPoints =
              item.periods[period] || 0;


            const totalPoints =
              item.basePoints +
              additionalPoints;


            recapRows.push({

              fullName:
                item.fullName,

              nim:
                item.nim,

              course:
                item.course,

              period:
                period,

              totalPoints:
                totalPoints

            });

          }
        );


      } else {

        // ======================================
        // BELUM ADA INDIVIDUAL RECORD
        // ======================================

        recapRows.push({

          fullName:
            item.fullName,

          nim:
            item.nim,

          course:
            item.course,

          period:
            '',

          totalPoints:
            item.basePoints

        });

      }

    }
  );


  // ==========================================
  // CLEAR OLD RECAP
  // ==========================================

  const oldLastRow =
    recapSheet.getLastRow();


  if (oldLastRow > 1) {

    recapSheet
      .getRange(
        2,
        1,
        oldLastRow - 1,
        recapSheet.getLastColumn()
      )
      .clearContent();

  }


  // ==========================================
  // EMPTY RECAP
  // ==========================================

  if (
    recapRows.length === 0
  ) {

    return 'Recap kosong.';

  }


  // ==========================================
  // UPDATED AT
  // ==========================================

  const updatedAt =
    new Date();


  // ==========================================
  // BUILD OUTPUT
  // ==========================================

  const output = [];


  recapRows.forEach(
    function(item, index) {

      const totalPoints =
        item.totalPoints;


      let conversion = 0;


      if (
        totalPoints >= 17
      ) {

        conversion =
          Math.floor(
            (totalPoints - 1) / 16
          );

      }


      conversion =
        Math.min(
          conversion,
          5
        );


      output.push([

        index + 1,

        item.fullName,

        item.nim,

        item.course,

        item.period,

        totalPoints,

        '+' + conversion,

        updatedAt

      ]);

    }
  );


  // ==========================================
  // WRITE RECAP
  // ==========================================

  recapSheet
    .getRange(
      2,
      1,
      output.length,
      8
    )
    .setValues(
      output
    );


  SpreadsheetApp.flush();


  return (
    'Recap berhasil diperbarui: ' +
    recapRows.length +
    ' mahasiswa.'
  );

}

function getActiveCardsForDeactivation() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const qrSheet =
    ss.getSheetByName('QR');

  const historySheet =
    ss.getSheetByName('Activation History');


  // ==========================================
  // VALIDATE SHEETS
  // ==========================================

  if (!qrSheet) {

    return {
      success: false,
      message:
        'ERROR: Sheet QR tidak ditemukan.',
      data: []
    };

  }


  if (!historySheet) {

    return {
      success: false,
      message:
        'ERROR: Sheet Activation History tidak ditemukan.',
      data: []
    };

  }


  // ==========================================
  // READ QR
  // ==========================================

  const qrData =
    qrSheet
      .getDataRange()
      .getValues();


  if (qrData.length < 2) {

    return {
      success: true,
      data: []
    };

  }


  const qrHeaders =
    qrData[0];


  const qrCardCodeIndex =
    qrHeaders.indexOf('Card Code');

  const qrFullNameIndex =
    qrHeaders.indexOf('Full Name');

  const qrNimIndex =
    qrHeaders.indexOf('NIM');

  const qrCourseIndex =
    qrHeaders.indexOf(
      'Enrolled Practical Course'
    );

  const qrStatusIndex =
    qrHeaders.indexOf('Status');


  if (
    qrCardCodeIndex === -1 ||
    qrStatusIndex === -1
  ) {

    return {
      success: false,
      message:
        'ERROR: Struktur header QR tidak sesuai.',
      data: []
    };

  }


  // ==========================================
  // READ ACTIVATION HISTORY
  // ==========================================

  const historyData =
    historySheet
      .getDataRange()
      .getValues();


  if (historyData.length < 2) {

    return {
      success: true,
      data: []
    };

  }


  const historyHeaders =
    historyData[0];


  const historyCardCodeIndex =
    historyHeaders.indexOf(
      'Card Code'
    );

  const historyFullNameIndex =
    historyHeaders.indexOf(
      'Full Name'
    );

  const historyNimIndex =
    historyHeaders.indexOf(
      'NIM'
    );

  const historyCourseIndex =
    historyHeaders.indexOf(
      'Enrolled Practical Course'
    );

  const historyPeriodIndex =
    historyHeaders.indexOf(
      'Period'
    );

  const historyActivatedAtIndex =
    historyHeaders.indexOf(
      'Activated At'
    );

  const historyDeactivatedAtIndex =
    historyHeaders.indexOf(
      'Deactivated At'
    );


  if (
    historyCardCodeIndex === -1 ||
    historyFullNameIndex === -1 ||
    historyNimIndex === -1 ||
    historyCourseIndex === -1 ||
    historyPeriodIndex === -1 ||
    historyActivatedAtIndex === -1 ||
    historyDeactivatedAtIndex === -1
  ) {

    return {
      success: false,
      message:
        'ERROR: Struktur header Activation History tidak sesuai.',
      data: []
    };

  }


  // ==========================================
  // FIND ACTIVE CARDS
  // ==========================================

  const activeCards = [];


  for (
    let i = 1;
    i < qrData.length;
    i++
  ) {

    const qrRow =
      qrData[i];


    const cardCode =
      String(
        qrRow[qrCardCodeIndex]
      ).trim();


    const status =
      String(
        qrRow[qrStatusIndex]
      )
      .trim()
      .toLowerCase();


    // Only ACTIVE cards

    if (
      !cardCode ||
      status !== 'active'
    ) {

      continue;

    }


    // ========================================
    // FIND CURRENT ACTIVATION
    // ========================================

    let currentActivation = null;


    for (
      let j = historyData.length - 1;
      j >= 1;
      j--
    ) {

      const historyRow =
        historyData[j];


      const historyCardCode =
        String(
          historyRow[
            historyCardCodeIndex
          ]
        ).trim();


      if (
        historyCardCode !==
        cardCode
      ) {

        continue;

      }


      const deactivatedAt =
        historyRow[
          historyDeactivatedAtIndex
        ];


      // Current activation =
      // latest history row with
      // no Deactivated At

      if (
        deactivatedAt === '' ||
        deactivatedAt === null
      ) {

        currentActivation =
          historyRow;

        break;

      }

    }


    // ========================================
    // BUILD RESULT
    // ========================================

    if (currentActivation) {

      activeCards.push({

        cardCode:
          cardCode,

        fullName:
          currentActivation[
            historyFullNameIndex
          ] ||
          (
            qrFullNameIndex !== -1
              ? qrRow[qrFullNameIndex]
              : ''
          ),

        nim:
          currentActivation[
            historyNimIndex
          ] ||
          (
            qrNimIndex !== -1
              ? qrRow[qrNimIndex]
              : ''
          ),

        course:
          currentActivation[
            historyCourseIndex
          ] ||
          (
            qrCourseIndex !== -1
              ? qrRow[qrCourseIndex]
              : ''
          ),

        period:
          currentActivation[
            historyPeriodIndex
          ] || '',

        activatedAt:
          currentActivation[
            historyActivatedAtIndex
          ] || ''

      });

    }

  }


  // ==========================================
  // RESPONSE
  // ==========================================

  return {

    success: true,

    data:
      activeCards

  };

}

function testGetActiveCardsForDeactivation() {

  const result =
    getActiveCardsForDeactivation();

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}

function loadCardsForDeactivation() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('QR');

  if (!sheet) {
    return {
      success: false,
      message: 'ERROR: Sheet QR tidak ditemukan.',
      data: []
    };
  }

  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    return {
      success: true,
      data: []
    };
  }

  const headers = data[0];

  const cardCodeIndex =
    headers.indexOf('Card Code');

  const fullNameIndex =
    headers.indexOf('Full Name');

  const nimIndex =
    headers.indexOf('NIM');

  const courseIndex =
    headers.indexOf('Enrolled Practical Course');

  const statusIndex =
    headers.indexOf('Status');

  if (
    cardCodeIndex === -1 ||
    fullNameIndex === -1 ||
    nimIndex === -1 ||
    courseIndex === -1 ||
    statusIndex === -1
  ) {
    return {
      success: false,
      message:
        'ERROR: Struktur header QR tidak sesuai.',
      data: []
    };
  }

  const cards = [];

  for (let i = 1; i < data.length; i++) {

    const row = data[i];

    const cardCode =
      String(row[cardCodeIndex]).trim();

    const status =
      String(row[statusIndex])
        .trim()
        .toLowerCase();

    if (!cardCode || status !== 'active') {
      continue;
    }

    cards.push({

      cardCode:
        cardCode,

      fullName:
        row[fullNameIndex] || '',

      nim:
        row[nimIndex] || '',

      course:
        row[courseIndex] || '',

      status:
        row[statusIndex] || 'Active'

    });

  }

  return {
    success: true,
    data: cards
  };
}

function deactivateCard(cardCode) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const qrSheet =
    ss.getSheetByName('QR');

  const historySheet =
    ss.getSheetByName('Activation History');


  // ==========================================
  // VALIDATE SHEETS
  // ==========================================

  if (!qrSheet) {
    return {
      success: false,
      message:
        'ERROR: Sheet QR tidak ditemukan.'
    };
  }

  if (!historySheet) {
    return {
      success: false,
      message:
        'ERROR: Sheet Activation History tidak ditemukan.'
    };
  }


  // ==========================================
  // VALIDATE CARD CODE
  // ==========================================

  cardCode =
    String(cardCode || '').trim();

  if (!cardCode) {
    return {
      success: false,
      message:
        'Card Code tidak diberikan.'
    };
  }


  // ==========================================
  // READ QR
  // ==========================================

  const qrData =
    qrSheet
      .getDataRange()
      .getValues();

  if (qrData.length < 2) {
    return {
      success: false,
      message:
        'Sheet QR belum memiliki data kartu.'
    };
  }

  const qrHeaders =
    qrData[0];


  const qrCardCodeIndex =
    qrHeaders.indexOf('Card Code');

  const qrFullNameIndex =
    qrHeaders.indexOf('Full Name');

  const qrNimIndex =
    qrHeaders.indexOf('NIM');

  const qrCourseIndex =
    qrHeaders.indexOf(
      'Enrolled Practical Course'
    );

  const qrStatusIndex =
    qrHeaders.indexOf('Status');


  if (
    qrCardCodeIndex === -1 ||
    qrFullNameIndex === -1 ||
    qrNimIndex === -1 ||
    qrCourseIndex === -1 ||
    qrStatusIndex === -1
  ) {
    return {
      success: false,
      message:
        'ERROR: Struktur header QR tidak sesuai.'
    };
  }


  // ==========================================
  // FIND CARD
  // ==========================================

  let qrRowNumber = -1;
  let qrRow = null;

  for (
    let i = 1;
    i < qrData.length;
    i++
  ) {

    const currentCode =
      String(
        qrData[i][qrCardCodeIndex]
      )
      .trim()
      .toUpperCase();

    if (
      currentCode ===
      cardCode.toUpperCase()
    ) {

      qrRowNumber =
        i + 1;

      qrRow =
        qrData[i];

      break;

    }

  }


  if (
    qrRowNumber === -1 ||
    !qrRow
  ) {

    return {
      success: false,
      message:
        'Card tidak ditemukan: ' +
        cardCode
    };

  }


  // ==========================================
  // CHECK CURRENT STATUS
  // ==========================================

  const currentStatus =
    String(
      qrRow[qrStatusIndex]
    )
    .trim()
    .toLowerCase();


  if (
    currentStatus !==
    'active'
  ) {

    return {
      success: false,
      message:
        'Card ini tidak sedang aktif.'
    };

  }


  // ==========================================
  // READ ACTIVATION HISTORY
  // ==========================================

  const historyData =
    historySheet
      .getDataRange()
      .getValues();


  if (
    historyData.length < 2
  ) {

    return {
      success: false,
      message:
        'Tidak ditemukan Activation History untuk card ini.'
    };

  }


  const historyHeaders =
    historyData[0];


  const historyCardCodeIndex =
    historyHeaders.indexOf(
      'Card Code'
    );

  const historyFullNameIndex =
    historyHeaders.indexOf(
      'Full Name'
    );

  const historyNimIndex =
    historyHeaders.indexOf(
      'NIM'
    );

  const historyCourseIndex =
    historyHeaders.indexOf(
      'Enrolled Practical Course'
    );

  const historyPeriodIndex =
    historyHeaders.indexOf(
      'Period'
    );

  const historyActivatedAtIndex =
    historyHeaders.indexOf(
      'Activated At'
    );

  const historyDeactivatedAtIndex =
    historyHeaders.indexOf(
      'Deactivated At'
    );

  const historyDurationIndex =
    historyHeaders.indexOf(
      'Duration'
    );


  if (
    historyCardCodeIndex === -1 ||
    historyFullNameIndex === -1 ||
    historyNimIndex === -1 ||
    historyCourseIndex === -1 ||
    historyPeriodIndex === -1 ||
    historyActivatedAtIndex === -1 ||
    historyDeactivatedAtIndex === -1 ||
    historyDurationIndex === -1
  ) {

    return {
      success: false,
      message:
        'ERROR: Struktur header Activation History tidak sesuai.'
    };

  }


  // ==========================================
  // FIND CURRENT ACTIVATION
  // ==========================================

  let historyRowNumber = -1;
  let historyRow = null;


  for (
    let i = historyData.length - 1;
    i >= 1;
    i--
  ) {

    const row =
      historyData[i];


    const historyCardCode =
      String(
        row[
          historyCardCodeIndex
        ]
      )
      .trim()
      .toUpperCase();


    const deactivatedAt =
      row[
        historyDeactivatedAtIndex
      ];


    const isStillActive =
      deactivatedAt === '' ||
      deactivatedAt === null;


    if (
      historyCardCode ===
      cardCode.toUpperCase() &&
      isStillActive
    ) {

      historyRowNumber =
        i + 1;

      historyRow =
        row;

      break;

    }

  }


  if (
    historyRowNumber === -1 ||
    !historyRow
  ) {

    return {
      success: false,
      message:
        'Activation aktif untuk card ini tidak ditemukan di Activation History.'
    };

  }


  // ==========================================
  // ACTIVATED AT
  // ==========================================

  const activatedAt =
    historyRow[
      historyActivatedAtIndex
    ];


  if (!activatedAt) {

    return {
      success: false,
      message:
        'Activated At pada Activation History tidak valid.'
    };

  }


  const activatedDate =
    new Date(
      activatedAt
    );


  if (
    isNaN(
      activatedDate.getTime()
    )
  ) {

    return {
      success: false,
      message:
        'Activated At pada Activation History tidak valid.'
    };

  }


  // ==========================================
  // DEACTIVATED AT
  // ==========================================

  const deactivatedDate =
    new Date();


  // ==========================================
  // CALCULATE DURATION
  // ==========================================

  const durationMs =
    deactivatedDate.getTime() -
    activatedDate.getTime();


  const durationMinutes =
    Math.max(
      0,
      Math.floor(
        durationMs /
        (1000 * 60)
      )
    );


  const durationDays =
    Math.floor(
      durationMinutes /
      (60 * 24)
    );


  const remainingAfterDays =
    durationMinutes -
    (
      durationDays *
      60 *
      24
    );


  const durationHours =
    Math.floor(
      remainingAfterDays /
      60
    );


  const durationRemainingMinutes =
    remainingAfterDays %
    60;


  let durationText =
    '';


  if (
    durationDays > 0
  ) {

    durationText +=
      durationDays +
      ' day' +
      (
        durationDays !== 1
          ? 's'
          : ''
      );

  }


  if (
    durationHours > 0
  ) {

    if (durationText) {
      durationText += ' ';
    }

    durationText +=
      durationHours +
      ' hour' +
      (
        durationHours !== 1
          ? 's'
          : ''
      );

  }


  if (
    durationRemainingMinutes > 0 ||
    durationText === ''
  ) {

    if (durationText) {
      durationText += ' ';
    }

    durationText +=
      durationRemainingMinutes +
      ' minute' +
      (
        durationRemainingMinutes !== 1
          ? 's'
          : ''
      );

  }


  // ==========================================
  // SAVE ACTIVATION HISTORY
  // ==========================================

  historySheet
    .getRange(
      historyRowNumber,
      historyDeactivatedAtIndex + 1
    )
    .setValue(
      deactivatedDate
    );


  historySheet
    .getRange(
      historyRowNumber,
      historyDurationIndex + 1
    )
    .setValue(
      durationText
    );


  // ==========================================
  // RESET CURRENT CARD STATE
  // ==========================================

  qrSheet
    .getRange(
      qrRowNumber,
      qrFullNameIndex + 1
    )
    .clearContent();


  qrSheet
    .getRange(
      qrRowNumber,
      qrNimIndex + 1
    )
    .clearContent();


  qrSheet
    .getRange(
      qrRowNumber,
      qrCourseIndex + 1
    )
    .clearContent();


  qrSheet
    .getRange(
      qrRowNumber,
      qrStatusIndex + 1
    )
    .setValue(
      'Inactive'
    );


  SpreadsheetApp.flush();


  // ==========================================
  // RESPONSE
  // ==========================================

  return {

    success: true,

    message:
      'Card deactivated successfully.',

    data: {

      cardCode:
        cardCode,

      fullName:
        historyRow[
          historyFullNameIndex
        ] || '',

      nim:
        historyRow[
          historyNimIndex
        ] || '',

      course:
        historyRow[
          historyCourseIndex
        ] || '',

      period:
        historyRow[
          historyPeriodIndex
        ] || '',

      activatedAt:
        activatedDate.toISOString(),

      deactivatedAt:
        deactivatedDate.toISOString(),

      duration:
        durationText

    }

  };

}