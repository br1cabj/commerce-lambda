export const calculateShipping = async (req, res) => {
    try {
        const { postalCodeDestination } = req.body;

        if(!postalCodeDestination){
            return res.status(400).json({ message: "Destination postal code is required." });
        }

        const authString = Buffer.from(`${process.env.CARRIER_USER}:${process.env.CARRIER_PASSWORD}`).toString('base64');

        const tokenResponse = await fetch(`${process.env.CARRIER_BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`
            }
        });

        if (!tokenResponse.ok) {
            throw new Error('Error authenticating with shipping carrier');
        }

        const tokenData = await tokenResponse.json();
        const token = tokenData.token;

        const ratesResponse = await fetch(`${process.env.CARRIER_BASE_URL}/rates`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerId: process.env.CARRIER_CUSTOMER_ID,
                postalCodeOrigin: process.env.CARRIER_POSTAL_CODE_ORIGIN,
                postalCodeDestination: postalCodeDestination,
                deliveredType: "D",
                dimensions: {
                    weight: 1500,
                    height: 15,
                    width: 25,
                    length: 35
                }
            })
        });

        const ratesData = await ratesResponse.json();

        if (!ratesResponse.ok) {
            return res.status(400).json({ message: "Shipping carrier could not quote this destination.", error: ratesData });
        }

        res.status(200).json({
            price: ratesData.rates[0].price,
            productName: ratesData.rates[0].productName,
            deliveryTimeMin: ratesData.rates[0].deliveryTimeMin,
            deliveryTimeMax: ratesData.rates[0].deliveryTimeMax
        });

    } catch (error) {
        console.log("Error in shipping:", error.message);
        res.status(500).json({ message: "Error calculating shipping cost." });
    }
};
