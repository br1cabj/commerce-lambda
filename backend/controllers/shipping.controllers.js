// Funcion exportable para Corrreo Argentino.

export const calculateShipping = async (req, res) => {
    try {
        // Recibo el codigo postal del usuario que quiera comprar
        const { postalCodeDestination } = req.body;

        if(!postalCodeDestination){
            return res.status(400).json({ message: "Se requiere un codigo postal de destino." });
        }

        // Conecto con Correo Argentino, convierto el usuario y contraseña a formato Base64 como pide el manual.
        const authString = Buffer.from(`${process.env.CORREO_USER}:${process.env.CORREO_PASSWORD}`).toString('base64');

        const tokenResponse = await fetch(`${process.env.CORREO_BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`
            }
        });

        if (!tokenResponse.ok) {
            throw new Error('Error al identificarse con Correo Argentino');
        }

        // Guardamos la credencial temporal (Token)
        const tokenData = await tokenResponse.json();
        const token = tokenData.token;

        // Pido la cotización con la caja de zapatillas estándar
        const ratesResponse = await fetch(`${process.env.CORREO_BASE_URL}/rates`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerId: process.env.CORREO_CUSTOMER_ID,
                postalCodeOrigin: process.env.CORREO_POSTAL_CODE_ORIGIN,
                postalCodeDestination: postalCodeDestination,
                deliveredType: "D", // "D" significa envío a Domicilio
                dimensions: {
                    weight: 1500, // Peso en gramos (1.5 kg por caja aprox)
                    height: 15,   // Alto en cm
                    width: 25,    // Ancho en cm
                    length: 35    // Largo en cm
                }
            })
        });

        const ratesData = await ratesResponse.json();

        if (!ratesResponse.ok) {
            return res.status(400).json({ message: "El Correo no pudo cotizar este destino.", error: ratesData });
        }

        // Enviamos el precio exacto a mi Frontend
        res.status(200).json({
            price: ratesData.rates[0].price,
            productName: ratesData.rates[0].productName,
            deliveryTimeMin: ratesData.rates[0].deliveryTimeMin,
            deliveryTimeMax: ratesData.rates[0].deliveryTimeMax
        });

    } catch (error) {
        console.log("Error en envío:", error.message);
        res.status(500).json({ message: "Error interno al cotizar el envío con Correo Argentino." });
    }
};
