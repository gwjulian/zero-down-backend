import Express from 'express';
import Shopify, { DataType } from '@shopify/shopify-api';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';


dotenv.config()


const app = Express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  const client = new  Shopify.Clients.Rest(process.env.SHOP!, process.env.SHOPIFY_ACCESS_TOKEN);

  (req as any).client = client;

  next();
})

app.get('/orders', async (req, res) => {
  const data = await (req as any).client.get({
    path: 'orders',
    query: {status: 'closed'}
  })

  res.json({length: data.body.orders.length}).status(200);
});

app.get('/users', async (req, res) => {
  const data = await (req as any).client.get({
    path: 'customers/search',
    query: {
      'query': encodeURIComponent("'VIP'")
    }
  })

  res.json({length: data.body.customers.length}).status(200);
})


app.post('/order', async(req, res) => {
  
  const customer = req.body.customer;
  if(customer){
    console.log('email marketing', customer, customer.state);
    if(customer.state === 'disabled' || customer.state === 'invited') {
      console.log('sending to customer', customer.email, customer.id);
      await (req as any).client.post({
        path: `/customers/${customer.id}/send_invite`,
        data: {'customer_invite': {}},
        type: DataType.JSON
      })
    }
  }
})

app.listen(3000, () => {
  console.log('Server started');
})