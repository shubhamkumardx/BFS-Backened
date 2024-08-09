const express = require("express");
const jsforce = require("jsforce");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require('cors');
require("dotenv").config();
const PORT = 5000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const CLIENT_ID =
  "3MVG99OxTyEMCQ3hqNYB7_tfGjDs0Ap6mq7R1pESCy3N06VqumLGSh7Kk3iiz5f7H8V0cSlKLa6F6X8QTgmeJ";
const CLIENT_SECRET =
  "6D8C3C2BA86CA575F74EB0F9FC7237CD12D97AEEFBEE28DF87F1AC49A96E1464";
const USERNAME = "staff@designersx.com.dx";
const PASSWORD = "DesignersX575";
const LOGIN_URL =
  " https://beautyfashionsales--dx.sandbox.my.salesforce.com/services/oauth2/token";

let accessToken =
  "00DO8000001NKS5!AQEAQPOaNmoPVRTfvat8zvi6P3ptlF1LXQkND0WYMsDVxTiR4VjzEdz1Yx8sDWpCyPzRom_d.1H0lsg5OgsLokKeytzHE15L";
let instanceUrl = "https://beautyfashionsales--dx.sandbox.my.salesforce.com";

// LOGIN API

app.post("/login", async (req, res) => {
  try {
    const response = await axios.post(LOGIN_URL, null, {
      params: {
        grant_type: "password",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username: USERNAME,
        password: PASSWORD,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = response.data;
    res.status(200).json({
      data
      // access_token: data.access_token,
      // instance_url: data.instance_url,
    });
  } catch (error) {
    console.error("Error logging in to Salesforce:", error.message);
    res.status(500).json({ error: "Failed to login to Salesforce" });
  }
});

// GET ACCOUNTS API

// app.get("/accounts", async (req, res) => {
//   if (!accessToken || !instanceUrl) {
//     return res
//       .status(401)
//       .json({ error: "Not authenticated. Please login first." });
//   }

//   try {
//     const response = await axios.get(
//       `${instanceUrl}/services/data/v52.0/query?q=SELECT+Id,Name,OwnerId,Manufacturers_Names__c+FROM+Account`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     res.status(200).json(response.data.records);
//   } catch (error) {
//     console.error("Error fetching accounts from Salesforce:", error.message);
//     res.status(500).json({ error: "Failed to fetch accounts from Salesforce" });
//   }
// });

app.get("/accounts", async (req, res) => {
  if (!accessToken || !instanceUrl) {
    return res
      .status(401)
      .json({ error: "Not authenticated. Please login first." });
  }

  try {
    const response = await axios.get(
      `${instanceUrl}/services/data/v52.0/query?q=SELECT+Id,Name,Manufacturers_Names__c,Account_ID__c,AccountSource,AccountNumber,OwnerId+FROM+Account`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json(response.data.records);
  } catch (error) {
    console.error("Error fetching accounts from Salesforce:", error.message);
    res.status(500).json({ error: "Failed to fetch accounts from Salesforce" });
  }
});


// GET MANUFACTURER API 

app.get('/manufacturers/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);
  
  if (!accessToken || !instanceUrl) {
    return res.status(401).json({ error: 'Not authenticated. Please login first.' });
  }

  try {
    const response = await axios.get(`${instanceUrl}/services/data/v52.0/query?q=SELECT+Id,Name,Tester_Margin__c+FROM+Manufacturer__c+WHERE+OwnerId='${id}'`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    res.status(200).json(response.data.records);
  } catch (error) {
    console.error('Error fetching manufacturers from Salesforce:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch manufacturers from Salesforce', details: error.response ? error.response.data : error.message });
  }
});

// GET PRODUCTS 

// app.get('/products', async (req, res) => {
//   const { manufacturerId } = req.query;

//   if (!accessToken || !instanceUrl) {
//     return res.status(401).json({ error: 'Not authenticated. Please login first.' });
//   }

//   try {
//     const describeResponse = await axios.get(`${instanceUrl}/services/data/v52.0/sobjects/Product2/describe`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`
//       }
//     });

//     const fields = describeResponse.data.fields.map(field => field.name);

//     let query = `
//       SELECT ${fields.join(', ')}
//       FROM Product2
//     `;

//     if (manufacturerId) {
//       query += ` WHERE ManufacturerId__c = '${manufacturerId}'`;
//     }

//     const encodedQuery = encodeURIComponent(query.trim());

//     const productsResponse = await axios.get(`${instanceUrl}/services/data/v52.0/query?q=${encodedQuery}`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`
//       }
//     });

//     res.status(200).json(productsResponse.data.records);
//   } catch (error) {
//     console.error('Error fetching products or describe data from Salesforce:', error.message);

//     if (error.response) {
//       res.status(500).json({
//         error: 'Failed to fetch products from Salesforce',
//         details: error.response.data
//       });
//     } else {
//       res.status(500).json({
//         error: 'Failed to fetch products from Salesforce',
//         details: error.message
//       });
//     }
//   }
// });


app.get('/products', async (req, res) => {
  const { manufacturer_name } = req.query;

  if (!accessToken || !instanceUrl) {
    return res.status(401).json({ error: 'Not authenticated. Please login first.' });
  }

  try {
    // Describe call to get all fields from Product2
    const describeResponse = await axios.get(`${instanceUrl}/services/data/v52.0/sobjects/Product2/describe`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const fields = describeResponse.data.fields.map(field => field.name);

    // Initial query to get products
    let query = `
      SELECT ${fields.join(', ')}
      FROM Product2
    `;

    if (manufacturer_name) {
      query += ` WHERE 	ManufacturerName__c = '${manufacturer_name}'`;
    }

    const encodedQuery = encodeURIComponent(query.trim());

    const productsResponse = await axios.get(`${instanceUrl}/services/data/v52.0/query?q=${encodedQuery}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const products = productsResponse.data.records;

    // Query to get pricebook entries linked to the products
    const productIds = products.map(product => product.Id).join("','");
    const pricebookQuery = `
      SELECT 	Product2Id, UnitPrice 
      FROM PricebookEntry 
      WHERE 	Product2Id IN ('${productIds}')
    `;
    const encodedPricebookQuery = encodeURIComponent(pricebookQuery.trim());

    const pricebookResponse = await axios.get(`${instanceUrl}/services/data/v52.0/query?q=${encodedPricebookQuery}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const pricebookEntries = pricebookResponse.data.records;

    // Combine products with their respective prices
    const productsWithPrices = products.map(product => {
      const pricebookEntry = pricebookEntries.find(entry => entry.Product2Id === product.Id);
      return {
        ...product,
        ListPrice: pricebookEntry ? pricebookEntry.UnitPrice : null
      };
    });

    res.status(200).json(productsWithPrices);
  } catch (error) {
    console.error('Error fetching products or describe data from Salesforce:', error.message);

    if (error.response) {
      res.status(500).json({
        error: 'Failed to fetch products from Salesforce',
        details: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'Failed to fetch products from Salesforce',
        details: error.message
      });
    }
  }
});


// GET NORMAL PRODUCT MARGIN

// app.get("/product-margin", async (req, res) => {
//   const { manufacturerName } = req.query; 

//   if (!accessToken || !instanceUrl) {
//     return res
//       .status(401)
//       .json({ error: "Not authenticated. Please login first." });
//   }

//   if (!manufacturerName) {
//     return res
//       .status(400)
//       .json({ error: "Manufacturer name is required." });
//   }

//   // Define the SOQL query to get Margin__c for the given ManufacturerName__c
//   const soqlQuery = 
//   `
//     SELECT Id, Margin__c, ManufacturerName__c 
//     FROM Account_Manufacturer__c 
//     WHERE ManufacturerName__c = '${manufacturerName}'
//   `
 
//   ;

//   // Encode the query for the URL
//   const encodedQuery = encodeURIComponent(soqlQuery.trim());

//   try {
//     // Fetch data from Salesforce
//     const response = await axios.get(
//       `${instanceUrl}/services/data/v52.0/query?q=${encodedQuery}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     // Send the fetched records as the response
//     res.status(200).json(response.data.records);
//   } catch (error) {
//     console.error("Error fetching margin from Salesforce:", error.message);
//     res.status(500).json({ error: "Failed to fetch margin from Salesforce" });
//   }
// });



app.get("/product-margin", async (req, res) => {
  const { manufacturerName, Account_Id } = req.query;

  if (!accessToken || !instanceUrl) {
    return res
      .status(401)
      .json({ error: "Not authenticated. Please login first." });
  }

  if (!manufacturerName || !Account_Id) {
    return res
      .status(400)
      .json({ error: "Manufacturer name and CreatedById are required." });
  }

  // Define the SOQL query to get Margin__c, Active_Closed__c for the given criteria
  const soqlQuery = `
    SELECT Id, Margin__c, Active_Closed__c 
    FROM Account_Manufacturer__c 
    WHERE AccountId__c = '${Account_Id}' 
    AND ManufacturerName__c = '${manufacturerName}'
  `;

  // Encode the query for the URL
  const encodedQuery = encodeURIComponent(soqlQuery.trim());

  try {
    // Fetch data from Salesforce
    const response = await axios.get(
      `${instanceUrl}/services/data/v52.0/query?q=${encodedQuery}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Send the fetched records as the response
    res.status(200).json(response.data.records);
  } catch (error) {
    console.error("Error fetching margin from Salesforce:", error.message);
    res.status(500).json({ error: "Failed to fetch margin from Salesforce" });
  }
});








app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
