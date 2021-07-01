const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");

const app = express();

const STYLES_TABLE = process.env.STYLES_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

app.get("/styles/:styleId", async function (req, res) {
  const params = {
    TableName: STYLES_TABLE,
    Key: {
      styleId: req.params.styleId,
    },
  };

  try {
    const { Item } = await dynamoDbClient.get(params).promise();
    if (Item) {
      const { styleId, name } = Item;
      res.json({ styleId, name });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find style with provided "styleId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve style" });
  }
});

app.post("/styles", async function (req, res) {
  const { styleId, name } = req.body;
  if (typeof styleId !== "string") {
    res.status(400).json({ error: '"styleId" must be a string' });
  } else if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: STYLES_TABLE,
    Item: {
      styleId: styleId,
      name: name,
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.json({ styleId, name });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create style" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});


module.exports.handler = serverless(app);
