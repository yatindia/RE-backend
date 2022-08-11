import express from "express";
const app = express();
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors"
import {ProProperty} from "./model/ProProperty"
import  jwt  from "jsonwebtoken";
import bodyParser from 'body-parser'
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! , {apiVersion: '2022-08-01'});


const connect = () => {
  try { mongoose.connect(`mongodb+srv://${process.env.MONGO_USERID}:${process.env.MONGO_PASSWORD}@cluster0.segtq.mongodb.net/test`);
    console.log("Connected to mongoDB.");
  } catch (error) {
    throw error;
  }
};



app.use(express.json());
app.use(cors({
    origin: true,
  }))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))

  // server.js
//
// Use this sample code to handle webhook events in your integration.
//
// 1) Paste this code into a new file (server.js)
//
// 2) Install dependencies
//   npm install stripe
//   npm install express
//
// 3) Run the server on http://localhost:4242
//   node server.js



// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_6ae6cde2632030e04dbebcdb8d5d251268149a59e9acc45d6e3a7cc56c3f3140";

app.post('/webhook', express.raw({type: "*/*"}), async(request, response) => {
  console.log('ok');
  
  const sig : any= request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    console.log(event);
    
  } catch (err:any) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Then define and call a function to handle the event checkout.session.completed
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});





// app.post("/stripe_webhooks", bodyParser.raw({type: 'application/json'}), async (req, res) => {

// console.log('hhh');

    
//     const sig:any = req.headers['stripe-signature']
//     const payload = req.body
//     let secret = process.env.STRIPE_WEB_HOOK!
//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(payload, sig, secret)
     

//          let data = JSON.parse((req.body).toString('utf8')).data.object.metadata || false

         
//          console.log("Data from webhook: "+data);
         
      
        
//     } catch (error) {
//         console.log(error);
//         res.sendStatus(500)
//         return
//     }
    

//     res.sendStatus(200)
// })







app.get('/' , (req , res) => {
    console.log('ok');
res.send('hi')
})
app.post("/payment", async (req, res) => {

  // await new ProProperty({name : 'a'}).save()
  await new ProProperty({name : 'Premium'})
        .save()
        .catch( error => {
            
            console.log(error)
            
        })

    let headers = req.headers['authorization']
    let bearer:any = headers?.split(" ")
    let token = bearer[1]

    let user:any = jwt.verify(token, process.env.JWT_TOKEN_KEY2!)
console.log(user);


    // const  payment  = (req.body.payment);
    // console.log(payment);
 
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: 'Premium', 
                    },
                    unit_amount: 30 * 100,
                },
                quantity: 1,
            },
             ],
             metadata: {
                id : user.id
            },
        mode: 'payment',
        success_url: `https://www.google.com`,
        cancel_url: `https://www.facebook.com`,
      });

      res.send({ url: session.url });
});
 

  

const port = 8000
app.listen(port, () =>{
  connect();
 console.log(`Listening on port ${port}`)});