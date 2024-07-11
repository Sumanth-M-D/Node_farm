import { readFileSync, writeFileSync, readFile, writeFile } from 'node:fs';
import http from 'node:http';
import url from 'node:url';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// import { slugify } from "slugify";

const __dirname = dirname(fileURLToPath(import.meta.url));

/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                     FILE SYSTEM
 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */

// // synchronous way
// const text = readFileSync("./txt/input.txt", "utf-8");

// const textOut = `This is what we know about avacado: ${text}. \nCreated on ${Date.now()}`;

// writeFileSync("./txt/output.txt", textOut, "UTF-8");

// // Asynchronous Way
// readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   if (err) throw err;

//   readFile(`./txt/${data1}.txt`, "UTF-8", (err, data2) => {
//     if (err) throw err;

//     readFile("./txt/append.txt", "UTF-8", (err, data3) => {
//       if (err) throw err;
//       console.log(data3);

//       writeFile("./txt/final.txt", `${data2}\n${data3}`, "UTF-8", (err) => {
//         if (err) throw err;
//         console.log("Your file has been saved");
//       });
//     });
//   });
// });

/* %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                        SERVER (HTTP)
 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% */

//  Reading the HTML-templates as strings
const tempOverview = readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

// Reading the data from data.json file
const data = readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

// Function for Replacing the variables in the templates dynamically
function replaceTemplate(temp, product) {
   let output = temp.replaceAll('{%PRODUCTNAME%}', product.productName);
   output = output.replaceAll('{%IMAGE%}', product.image);
   output = output.replaceAll('{%PRICE%}', product.price);
   output = output.replaceAll('{%FROM%}', product.from);
   output = output.replaceAll('{%NUTRIENTS%}', product.nutrients);
   output = output.replaceAll('{%QUANTITY%}', product.quantity);
   output = output.replaceAll('{%DESCRIPTION%}', product.description);
   output = output.replaceAll('{%ID%}', product.id);

   if (!product.organic) {
      output = output.replaceAll('{%NOT_ORGANIC%}', 'not-organic');
   }
   return output;
}

/*
 */

// Creating the http server and rendering the website
const server = http.createServer((req, res) => {
   // Parsing the url to get the queries and pathname
   const { query, pathname } = url.parse(req.url, true);

   // Dynamically creating the html for overview page
   if (pathname === '/overview' || pathname === '/') {
      const cardsHtml = dataObj.map((ele) => replaceTemplate(tempCard, ele)).join('');
      const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(output);
   }

   // Dynamically creating the html for Product page
   else if (pathname === '/product') {
      // Getting the requested product from the dataObj through (query.id)
      const product = dataObj[query.id];

      res.writeHead(200, { 'content-type': 'text/html' });
      const output = replaceTemplate(tempProduct, product);
      res.end(output);
   }

   //Sending the data in json (API)
   else if (pathname === '/api') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(data);
   }

   // Not found
   else {
      res.writeHead(404, {
         'content-type': 'text/html',
         'my-own-header': 'hello world',
      });
      res.end(`<h1>Page Not Found ${res.statusCode}</h1>`);
   }
});

server.listen(8000, '127.0.0.1', () => {
   console.log('Listenining on port 8000');
});
