const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const cors = require("cors");
const mongoose = require("mongoose");

const { Store, Customer, Product } = require("./schema/schema");

const { shopifyDao } = require("./dao/shopifyDao");

const app = express();
const port = 8080;

const dbConnection =
  "mongodb+srv://admin:admin@cluster0.ljnsc.azure.mongodb.net/db?retryWrites=true&w=majority";

mongoose.connect(dbConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); // connect mongodb

const api_key = "a023f63bfab7cb93394fd1a60828e824";
const api_secret_key = "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";
const scope = [
  "read_script_tags",
  "write_script_tags",
  "read_customers",
  "write_customers",
  "read_themes",
  "write_themes",
];
const redirect_uri = "http://dd017a0603de.ngrok.io/connect";

const script_tag_body = {
  script_tag: {
    event: "onload",
    src: "https://dd017a0603de.ngrok.io/script",
  },
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/install", (req, res) => {
  let auth_url = `https://${req.query.shop}/admin/oauth/authorize?client_id=${api_key}&scope=${scope}&redirect_uri=${redirect_uri}`;
  res.redirect(auth_url);
});

app.get("/connect", async (req, res) => {
  let params = {
    client_id: api_key,
    client_secret: api_secret_key,
    code: req.query.code,
  };

  let { access_token } = await fetch(
    `https://${req.query.shop}/admin/oauth/access_token`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(params),
    }
  ).then((r) => r.json());

  console.log("access_token:", access_token);

  let header = {
    "X-Shopify-Access-Token": access_token,
    "Content-Type": "application/json",
  };

  fetch(`https://${req.query.shop}/admin/api/2020-07/script_tags.json`, {
    headers: header,
    method: "POST",
    body: JSON.stringify(script_tag_body),
  });

  let { themes } = await fetch(
    `https://${req.query.shop}/admin/api/2020-07/themes.json`,
    {
      headers: header,
      method: "GET",
    }
  ).then((r) => r.json());

  const currentTheme = themes.filter((theme) => theme.role === "main");

  console.log("current_theme:", currentTheme);

  let themeAsset = await fetch(
    `https://${req.query.shop}/admin/api/2020-07/themes/${currentTheme[0].id}/assets.json?asset[key]=layout/theme.liquid`,
    {
      headers: header,
      method: "GET",
    }
  ).then((r) => r.json());

  let themeMatch = /<head>\n/.exec(themeAsset.asset.value);
  let themeModifiedHTML =
    themeAsset.asset.value.slice(0, themeMatch.index + 7) +
    "<script>\nvar customerid = {{ customer.id }}\nvar customerphone = {{ customer.phone }}\n</script>\n" +
    themeAsset.asset.value.slice(themeMatch.index + 7);
  fetch(
    `https://${req.query.shop}/admin/api/2020-07/themes/${currentTheme[0].id}/assets.json`,
    {
      headers: header,
      method: "PUT",
      body: JSON.stringify({
        asset: {
          key: "layout/theme.liquid",
          value: themeModifiedHTML,
        },
      }),
    }
  );

  let productAsset = await fetch(
    `https://${req.query.shop}/admin/api/2020-07/themes/${currentTheme[0].id}/assets.json?asset[key]=templates/product.liquid`,
    {
      headers: header,
      method: "GET",
    }
  ).then((r) => r.json());

  let productModifiedHTML =
    "<script>var productid = {{ product.id }}</script>\n" +
    productAsset.asset.value;
  fetch(
    `https://${req.query.shop}/admin/api/2020-07/themes/${currentTheme[0].id}/assets.json`,
    {
      headers: header,
      method: "PUT",
      body: JSON.stringify({
        asset: {
          key: "templates/product.liquid",
          value: productModifiedHTML,
        },
      }),
    }
  );

  res.send("OK");
});

app.get("/script", (req, res) => {
  res.download("scripts/script_tag.js");
});

app.post("/cart", async (req, res) => {
  console.log(req.body);
  if (req.body.ecommerce === "shopify") {
    shopifyDao(req)
  }
});

app.get("/db", async (req, res) => {
  console.log("fuck ");
  // const product1 = new Product({
  //   product_id: 1,
  //   product_name: "name",
  //   quantity: 1,
  // });

  const product2 = new Product({
    product_id: 2,
    product_name: "na42me",
    quantity: 1,
  });

  // const customer1 = new Customer({
  //   customer_id: 11,
  //   customer_phone: "+852",
  // });

  // const store2 = new Store({
  //   store_id: 222,
  //   store_name: "test789hk",
  // });

  const a = await Customer.findOne({ customer_id: 3982246019222 });
  // console.log(a)
  // product2.save()
  // await a.carts.push(product2)
  // a.save();
  console.log(
    await Customer.findOne({ customer_id: 3982246019222 }).populate({
      path: "carts",
    })
  );

  // product2.save()

  // Customer.findByIdAndUpdate(
  //   {_id:"5f48847e99aea24e25a0fd7f"},
  //   {$push: {carts: product2}}
  // ).then(x=>{console.log(x)})

  // product1.save()
  // customer1.carts.push(product1)
  // customer1.save()
  // store1.customers.push(customer1)
  // store1.save()
  // try{

  // const a = await Store.findOne({store_id:111})

  // if(a){
  //   Store.findOne({store_id:111}).populate({
  //     path: 'customers',
  //     match:{ customer_id: 11 },
  //     populate:{
  //       path: 'carts',
  //       match:{product_id: 3}
  //     }
  //   }).exec((err,cmt)=>{
  //     console.log(cmt)
  //   })
  // }else{
  //   console.log("shit")
  // }

  // }catch(e){
  //   console.log(e)
  // }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
