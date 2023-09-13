require('dotenv').config();

if (!process.env.BASE) console.error('No Base!');

if (!process.env.KEY) console.error('No Key!');

const { v4 } = require('uuid');
const axios = require('axios');

const instance = axios.create({
  baseURL: `${process.env.BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.KEY
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
      language: 'CHINESE'
    });
  } catch (error) {
    console.error(error);
    return;
  }
  console.log('collection updated!');

  // Get Updated Collection Info
  console.log('=== Get Updated Collection Info === ');
  try {
    collectionB = await instance.get(`/collections/${collectionId}`);
  } catch (error) {
    console.error(error);
    return;
  }
  console.log(collectionB.data);

  // Chat with Collection
  console.log('=== Chat with Collection ===');
  let message = '王二狗是什么品种的狗';
  let extraInfo = `
  {
    "worker_name": "张三",
    "pet_gender": 1,
    "create_time": 2023-09-01 14:24:29",
    "pet_name": "比熊犬（体长＜35cm） ",
    "service_name": "健康洗·护理套餐",
    "age_year": 2,
    "age_month": 24,
    "content": "很活泼，整体还算配合",
    "nick_name": "王二狗",
    "age": "2岁",
    "before_pics": "",
    "baby_situation": "很乖，毛发打结，建议平时经常梳理毛发。期待跟二狗的下次见面",
  }
  [
    {
      "position": "头部",
      "check_item_name": "耳部",
      "check_name": "未发现异常",
    },
    {
      "position": "头部",
      "check_item_name ": "口腔",
      "check_name": "未发现异常",
    },
    {
      "position":  "身体",
      "check_item_name": "毛发",
      "check_name": "毛发打结",
    }
  ]
  `;
  console.log(`message: ${message}`);
  console.log(`extra_info: ${extraInfo}`);
  let response;
  try {
    response = await instance.post('/chat', {
      collection_id: collectionId,
      conversation_id: v4(),
      message,
      extra_info: extraInfo
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
            question: 'What is MyScale Chat',
            answer:
              'MyScale Chat is a chatbot that can answer questions about documents ' +
              'or websites and provide information about data.'
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

  // Chat with Collection
  console.log('=== Chat with Collection for QA ===');
  message = 'what is myscale chat?';
  console.log(`message: ${message}`);
  try {
    response = await instance.post('/chat', {
      collection_id: collectionId,
      conversation_id: v4(),
      message: message
    });
  } catch (error) {
    console.error(error);
    return;
  }
  console.log(response.data);

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

  // Chat with Collection
  console.log('=== Chat with Collection Again ===');
  message = 'what is myscale chat?';
  console.log(`message: ${message}`);
  try {
    response = await instance.post('/chat', {
      collection_id: collectionId,
      conversation_id: v4(),
      message: message
    });
  } catch (error) {
    console.error(error);
    return;
  }
  console.log(response.data);

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
