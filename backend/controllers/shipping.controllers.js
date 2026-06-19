export const calculateShipping = async (req, res) => {
    try {
        const { postalCodeDestination, weight, height, width, length } = req.body;

        if (!postalCodeDestination) {
            return res.status(400).json({ message: "Destination postal code is required." });
        }

        const tenant = req.tenant;
        const localCarrierConfig = tenant.settings.shippingMethods.find(m => m.type === "local_carrier" && m.enabled);
        
        // Use tenant-specific credentials if they exist, otherwise fallback to global ones.
        const carrierUser = localCarrierConfig?.config?.user || process.env.CARRIER_USER;
        const carrierPassword = localCarrierConfig?.config?.password || process.env.CARRIER_PASSWORD;
        const carrierCustomerId = localCarrierConfig?.config?.customerId || process.env.CARRIER_CUSTOMER_ID;
        const postalCodeOrigin = localCarrierConfig?.config?.postalCodeOrigin || tenant.settings.address?.match(/\d{4}/)?.[0] || process.env.CARRIER_POSTAL_CODE_ORIGIN;

        if (!carrierUser || !carrierPassword) {
            // Check if flat rate or free shipping is enabled since we can't calculate API rates
            const flatShipping = tenant.settings.shippingMethods.find(m => m.type === "flat" && m.enabled);
            const freeShipping = tenant.settings.shippingMethods.find(m => m.type === "free" && m.enabled);
            
            if (freeShipping) {
                 return res.status(200).json({ price: 0, productName: "Free Shipping", deliveryTimeMin: 2, deliveryTimeMax: 5 });
            } else if (flatShipping) {
                 return res.status(200).json({ price: flatShipping.config?.price || 1500, productName: "Standard Shipping", deliveryTimeMin: 3, deliveryTimeMax: 7 });
            }
            return res.status(400).json({ message: "Shipping carrier is not configured." });
        }

        const authString = Buffer.from(`${carrierUser}:${carrierPassword}`).toString('base64');

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
                customerId: carrierCustomerId,
                postalCodeOrigin: postalCodeOrigin,
                postalCodeDestination: postalCodeDestination,
                deliveredType: "D",
                dimensions: {
                    weight: weight || 1500,
                    height: height || 15,
                    width: width || 25,
                    length: length || 35
                }
            })
        });

        const ratesData = await ratesResponse.json();

        if (!ratesResponse.ok) {
            return res.status(400).json({ message: "Shipping carrier could not quote this destination.", error: ratesData });
        }

        if (!ratesData.rates || ratesData.rates.length === 0) {
            return res.status(404).json({ message: "No shipping rates found for this destination." });
        }

        res.status(200).json({
            price: ratesData.rates[0].price,
            productName: ratesData.rates[0].productName,
            deliveryTimeMin: ratesData.rates[0].deliveryTimeMin,
            deliveryTimeMax: ratesData.rates[0].deliveryTimeMax
        });

    } catch (error) {
        console.error("Error in shipping:", error.message);
        res.status(500).json({ message: "Error calculating shipping cost." });
    }
};
