const BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/' : 'https://dcc-2017-api.now.sh/';
const data = {};

function getData(url) {
  const dataDate = Number(localStorage[`${url}-date`]);
  const now = +new Date();
  if (dataDate && now - dataDate >= 3600000) {
    localStorage.removeItem(url);
    localStorage.removeItem(`${url}-date`);
  }

  if (data[url]) {
    return Promise.resolve(data[url]);
  } else if (localStorage[url]) {
    data[url] = JSON.parse(localStorage[url]);
    return Promise.resolve(data[url]);
  }

  return fetch(url)
    .then(res => res.json())
    .then((json) => {
      data[url] = json;
      localStorage[url] = JSON.stringify(json);
      localStorage[`${url}-date`] = +new Date();
      return json;
    });
}

const Data = {
  getVenues() {
    return getData(`${BASE_URL}api/venue`);
  },
  getEvents(date = '2017-07-01') {
    return getData(`${BASE_URL}api/schedule/${date}`);
  },
};

export default Data;
