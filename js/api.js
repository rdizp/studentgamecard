const API_URL =
  'https://script.google.com/macros/s/AKfycbwqDppJc8kVL4tkjlibwLTbU4wtb030Q3AyEgr6g82rMT9ld1AWILgdsYdQneeOy8Wlxg/exec';


async function apiGet(action, params = {}) {

  const url =
    new URL(API_URL);

  url.searchParams.set(
    'action',
    action
  );


  Object.entries(params).forEach(
    ([key, value]) => {

      if (
        value !== undefined &&
        value !== null
      ) {

        url.searchParams.set(
          key,
          value
        );

      }

    }
  );


  const response =
    await fetch(
      url.toString(),
      {
        method: 'GET'
      }
    );


  if (!response.ok) {

    throw new Error(
      `HTTP ${response.status}`
    );

  }


  return response.json();

}


async function apiPost(
  action,
  data = {}
) {

  const response =
    await fetch(
      API_URL,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'text/plain;charset=utf-8'
        },

        body:
          JSON.stringify({
            action,
            ...data
          })
      }
    );


  if (!response.ok) {

    throw new Error(
      `HTTP ${response.status}`
    );

  }


  return response.json();

}