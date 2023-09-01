require('dotenv').config();

if (!process.env.BASE) console.error('No Base!');

if (!process.env.KEY) console.error('No Key!');

const { v4 } = require('uuid');
const axios = require('axios');

const instance = axios.create({
  baseURL: `${process.env.BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'X-API-TOKEN': process.env.KEY
  }
});
instance.interceptors.response.use(null, error => {
  let status = 0;
  let statusText = '';
  let code = '';
  let message = '';
  let data = null;

  if (error.response) {
    status = error.response.status;
    statusText = error.response.statusText;
    code = error.response.data?.code ?? '';
    message = error.response.data?.message ?? '';
    data = error.response.data?.data ?? null;
  } else if (error.request) {
    message = 'Unknown network error';
  } else {
    message = error.message;
  }
  return Promise.reject({ status, statusText, code, message, data });
});

run();

async function run() {
  // Create Collection
  console.log('=== Create Collection === ');
  let collectionA;
  try {
    collectionA = await instance.post('/collections', {
      name: 'example'
    });
  } catch (error) {
    console.error(error);
    return;
  }
  console.log(collectionA.data);

  const collectionId = collectionA.data.id;

  // Get Collection List
  console.log('=== Get Collection List === ');
  let collections;
  try {
    collections = await instance.get('/collections');
  } catch (error) {
    console.error(error);
    return;
  }
  console.log(collections.data);

  // Get Collection Info
  console.log('=== Get Collection Info === ');
  let collectionB;
  try {
    collectionB = await instance.get(`/collections/${collectionId}`);
  } catch (error) {
    console.error(error);
    return;
  }
  console.log(collectionB.data);

  // Update Collection Settings
  console.log('=== Update Collection Settings === ');
  try {
    await instance.put(`/collections/${collectionId}`, {
      knowledge_source: 'GENERALIZED'
    });
  } catch (error) {
    console.error(error);
    return;
  }
  console.log('collection updated!');

  // Chat with Collection
  console.log('=== Chat with Collection ===');
  let response;
  try {
    response = await instance.post('/chat', {
      chatbotId: collectionId,
      conversationId: v4(),
      message: 'Hello'
    });
  } catch (error) {
    console.error(error);
    return;
  }
  console.log(response.data);

  // Add Sources to Collection
  console.log('=== Add Sources to Collection === ');
  let collectionC;
  try {
    collectionC = await instance.post(
      `/collections/${collectionId}/sources`,
      {
        sources: [
          {
            type: 'QA_PAIR',
            question: 'question 1',
            answer: 'answer 1'
          },
          {
            type: 'QA_PAIR',
            question: 'question 2',
            answer: 'answer 2'
          }
        ]
      },
      {
        params: {
          source_type: 'QA_PAIR'
        }
      }
    );
  } catch (error) {
    console.error(error);
    return;
  }
  console.log(collectionC.data);

  const sourceId = collectionC.data[collectionC.data.length - 1].id;

  // Delete Sources from Collection
  console.log('=== Delete Sources from Collection === ');
  let collectionD;
  try {
    collectionD = await instance.delete(
      `/collections/${collectionId}/sources`,
      { data: { ids: [sourceId] } }
    );
  } catch (error) {
    console.error(error);
    return;
  }
  console.log(collectionD.data);

  // Get Collection Sources
  console.log('=== Get Collection Sources === ');
  let sources;
  try {
    sources = await instance.get(`/collections/${collectionId}/sources`);
  } catch (error) {
    console.error(error);
    return;
  }
  console.log(sources.data);

  // Delete Collection
  console.log('=== Delete Collection === ');
  try {
    await instance.delete(`/collections/${collectionId}`);
  } catch (error) {
    console.error(error);
    return;
  }
  console.log('collection deleted!');

  // Process Website Url
  console.log('=== Process Website Url === ');
  let urls;
  try {
    urls = await instance.post(
      '/websites',
      {
        url: 'https://docs.myscale.com/en/overview/'
      },
      {
        params: {
          type: 'CRAWL'
        }
      }
    );
  } catch (error) {
    console.error(error);
    return;
  }
  console.log(urls.data);
}
