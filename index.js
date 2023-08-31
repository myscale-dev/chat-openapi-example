require("dotenv").config();

if (!process.env.BASE) {
  console.error("No Base!");
  return;
}

if (!process.env.KEY) {
  console.error("No Key!");
  return;
}

const axios = require("axios");
const instance = axios.create({
  baseURL: `${process.env.BASE}/api/v1`,
  headers: { "X-API-TOKEN": process.env.KEY },
});

run();

async function run() {
  // Create Collection
  console.log("=== Create Collection === ");
  const collectionA = await instance.post("/collections", { name: "example" });
  console.log(collectionA.data);

  const collectionId = collectionA.data.id;

  // Get Collection List
  console.log("=== Get Collection List === ");
  const collections = await instance.get("/collections");
  console.log(collections.data);

  // Get Collection Info
  console.log("=== Get Collection Info === ");
  const collectionB = await instance.get(`/collections/${collectionId}`);
  console.log(collectionB.data);

  // Update Collection Settings
  console.log("=== Update Collection Settings === ");
  await instance.put(`/collections/${collectionId}`, {
    knowledge_source: "GENERALIZED",
  });
  console.log("collection updated!");

  // Add Sources to Collection
  console.log("=== Add Sources to Collection === ");
  const collectionC = await instance.post(
    `/collections/${collectionId}/sources`,
    {
      sources: [
        {
          type: "QA_PAIR",
          question: "question 1",
          answer: "answer 1",
        },
        {
          type: "QA_PAIR",
          question: "question 2",
          answer: "answer 2",
        },
      ],
    },
    {
      params: {
        source_type: "QA_PAIR",
      },
    }
  );
  console.log(collectionC.data);

  const sourceId = collectionC.data[0].id;

  // Delete Sources from Collection
  console.log("=== Delete Sources from Collection === ");
  const collectionD = await instance.delete(
    `/collections/${collectionId}/sources`,
    { data: { ids: [sourceId] } }
  );
  console.log(collectionD.data);

  // Get Collection Sources
  console.log("=== Get Collection Sources === ");
  const sources = await instance.get(`/collections/${collectionId}/sources`);
  console.log(sources);

  // Delete Collection
  console.log("=== Delete Collection === ");
  await instance.delete(`/collections/${collectionId}`);
  console.log("collection deleted!");

  // Process Website Url
  console.log("=== Process Website Url === ");
  const urls = await instance.post(
    "/websites",
    {
      url: "https://docs.myscale.com/en/overview/",
    },
    {
      params: {
        type: "CRAWL",
      },
    }
  );
  console.log(urls);

  // Generate API Token
  console.log("=== Generate API Token ===");
  const token = await instance.post("/users/api-token", { name: "example" });
  console.log(token.data);

  // Get API Token List
  console.log("=== Get API Token List ===");
  const tokens = await instance.get("/users/api-token");
  console.log(tokens.data);

  const tokenId = tokens.data[0].id;

  // Delete API Token
  console.log("===  Delete API Token === ");
  await instance.delete(`/users/api-token/${tokenId}`);
  console.log("api token deleted!");
}
