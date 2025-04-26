const express = require('express');
const cors = require('cors');
const request = require('request');

const app = express();
app.use(cors());
const port = 8006;

/*
Crear una aplicacion en PayPal
Agregar las credenciales de nuestra app de PayPal
https://developer.paypal.com/developer/applications (debemos acceder con nuestra cuenta de paypal)
cuentas de test -> https://developer.paypal.com/developer/accounts/
*/
const CLIENT = 'ASvnlzo-PymyeRSxwq4L4RtpuqQvCUBzyZkKqNz5IKzrPzFnEEUQH6ny-ZVyTedWoINPUCeqtExWpCUi';
const SECRET = 'EIhQjimqEeHCSS75NsYMuAOu7BBuINHzbrNlqomuy2M4QwdvwNmtMYcInGezkHgE8ziNlse7nEPRTb-c';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Live https://api-m.paypal.com
const auth = {user: CLIENT, pass: SECRET}
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // puedes usar Gmail, Outlook, etc.
    auth: {
        user: 'WiChat4a@gmail.com', // tu correo de envío
        pass: 'ongv ptdj dwcc nbjb' // tu contraseña o app password si es Gmail
    }
});

/*
Establecemos los controladores que vamos a usar
*/
const createPayment = (req, res) => {
    const body = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'EUR',
          value: '1'
        }
      }],
      application_context: {
        brand_name: `Wichat`,
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `http://localhost:8006/execute-payment`,
        cancel_url: `http://localhost:8006/cancel-payment`
      }
    };
  
    request.post(`${PAYPAL_API}/v2/checkout/orders`, {
      auth,
      body,
      json: true
    }, (err, response) => {
      if (err) {
        return res.status(500).json({ error: 'Error al crear el pago' });
      }
  
      const links = response.body.links;
      const approvalUrl = links.find(link => link.rel === 'approve')?.href;
  
      res.json({ approvalUrl }); //  esto es lo que espera el frontend
    });
  };
  

/*
Esta funcion captura el dinero REALMENTE
*/
const executePayment = (req, res) => {
  const token = req.query.token;

  request.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
      auth,
      body: {},
      json: true
  }, (err, response) => {
      if (err) {
          return res.status(500).send('Error capturando el pago');
      }
      const status = response.body.status; // ejemplo: COMPLETED, etc.

      if (status === 'COMPLETED') {
        console.log('Pago completado:', response.body);
        console.log('Enviando correo');
        const nombreDonante = response.body.payer.name.given_name;
        const correoDelDonante = 'andreaacerobus@gmail.com'; //response.body.payer.email_address;
        const cantidadDonada = response.body.purchase_units[0].payments.captures[0].amount.value;
        const moneda = response.body.purchase_units[0].payments.captures[0].amount.currency_code;
        const mailOptions = {
          from: 'WiChat4a@gmail.com',
          to: correoDelDonante, // <- este lo sacamos de los datos de PayPal
          subject: '¡Gracias por tu donación a Wichat!',
          html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; color: #333;">
                  <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                      <div style="text-align: center;">
                          <img src="cid:logo" alt="Logo de Wichat" style="width: 100px; margin-bottom: 20px;" />
                          <h1 style="color: #4CAF50;">¡Gracias ${nombreDonante}!</h1>
                      </div>
                      <p style="font-size: 16px;">
                          Tu apoyo significa muchísimo para nosotros. 🙏<br>
                          Hemos recibido tu donación de <strong>${cantidadDonada} ${moneda}</strong>.<br><br>
                          Cada donación nos impulsa a seguir mejorando y a seguir creando mejores experiencias para ti.
                      </p>
                      <p style="font-size: 16px;">
                          <em>Apoyarnos nos hace mejorar día a día. 💪</em>
                      </p>
                      <hr style="margin: 30px 0;">
                      <div style="text-align: center; font-size: 14px;">
                          <p>Con cariño,</p>
                          <p>
                              👩 Claudia, 👨 Javier, 👩 Adriana, 👩 Ana, 👩 Andrea, 👨 Aitor
                          </p>
                          <p>Equipo de <strong>Wichat</strong></p>
                      </div>
                  </div>
              </div>
          `,
          attachments: [{
              filename: 'logo.png',
              path: __dirname + '/public/images/logo.png', // asegúrate que esté en la carpeta correcta
              cid: 'logo' // el mismo que pusimos en <img src="cid:logo">
          }]
      };
      
        transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  console.error('Error al enviar el correo:', error);
              } else {
                  console.log('Correo enviado:', info.response);
              }
          });
      }
      // Redirigir al usuario a la página principal después del pago exitoso
      res.redirect('http://localhost:3000');
  });
};

//http://localhost:8006/create-payment
app.post(`/create-payment`, createPayment)

app.get(`/execute-payment`, executePayment)

app.get('/cancel-payment', (req, res) => {
    res.redirect(`http://localhost:3000`)
});

app.post('/api/donate', (req, res) => {
    console.log("estoy aqui");
});

app.listen(port, () => {
    console.log(`Comenzemos a generar dinero --> http://localhost:8006`);
})

