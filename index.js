require('dotenv').config();

if (!process.env.BASE) {
  console.error('No Base!');
  return;
}

if (!process.env.KEY) {
  console.error('No Key!');
  return;
}

const axios = require('axios');
const instance = axios.create({
  baseURL: `${process.env.BASE}/api/v1`,
  headers: { 'X-API-TOKEN': process.env.KEY }
});

run();

async function run() {
  // Create Collection
  console.log('=== Create Collection === ');
  const collectionA = await instance.post('/collections', { name: 'example' });
  console.log(collectionA.data);

  const collectionId = collectionA.data.id;

  // Get Collection List
  console.log('=== Get Collection List === ');
  const collections = await instance.get('/collections');
  console.log(collections.data);

  // Get Collection Info
  console.log('=== Get Collection Info === ');
  const collectionB = await instance.get(`/collections/${collectionId}`);
  console.log(collectionB.data);

  // Update Collection Settings
  console.log('=== Update Collection Settings === ');
  await instance.put(`/collections/${collectionId}`, { knowledge_source: 'GENERALIZED' });
  console.log('collection updated!');
  
  // Add Sources to Collection
  console.log('=== Add Sources to Collection === ');
  const collectionC = await instance.post(
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
  console.log(collectionC.data)

  const sourceId = collectionC.data[1].id;

  // Delete Collection
  console.log('=== Delete Collection === ');
  await instance.delete(`/collections/${collectionId}`);
  console.log('collection deleted!');
}
