export const calculateShipping = async (req, res) => {
  try {
    const { postalCodeDestination, weight, height, width, length } = req.body;

    if (!postalCodeDestination) {
      return res
        .status(400)
        .json({ message: "Destination postal code is required." });
    }

    const tenant = req.tenant;
    const localCarrierConfig = tenant.settings.shippingMethods.find(
      (m) => m.type === "local_carrier" && m.enabled,
    );

    const apiKey = localCarrierConfig?.config?.apiKey;
    const provider = localCarrierConfig?.config?.provider || "correo_argentino";
    const postalCodeOrigin = localCarrierConfig?.config?.originZipCode || "1000";

    if (!apiKey) {
      // Check if flat rate or free shipping is enabled since we can't calculate API rates
      const flatShipping = tenant.settings.shippingMethods.find(
        (m) => m.type === "flat" && m.enabled,
      );
      const freeShipping = tenant.settings.shippingMethods.find(
        (m) => m.type === "free" && m.enabled,
      );

      if (freeShipping) {
        return res.status(200).json({
          price: 0,
          productName: "Free Shipping",
          deliveryTimeMin: 2,
          deliveryTimeMax: 5,
        });
      } else if (flatShipping) {
        return res.status(200).json({
          price: flatShipping.config?.price || 1500,
          productName: "Standard Shipping",
          deliveryTimeMin: 3,
          deliveryTimeMax: 7,
        });
      }
      return res
        .status(400)
        .json({ message: "Shipping carrier is not configured." });
    }

    // Mock API integration based on Provider and Package Data
    // In a real app, this would use fetch() with the `apiKey` to provider's endpoint
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const w = weight || 1; // kg
    
    let basePrice = 5000;
    let name = "Envío Estandar";
    
    if (provider === "correo_argentino") {
      basePrice = 4500 + (w * 500); // 4500 base + 500 per kg
      name = "Correo Argentino - Clásico";
    } else if (provider === "andreani") {
      basePrice = 5500 + (w * 600);
      name = "Andreani - Estándar";
    } else if (provider === "fedex") {
      basePrice = 8000 + (w * 1000);
      name = "FedEx - International Economy";
    }

    // If destination starts with same digit as origin, it's closer -> discount
    if (postalCodeOrigin[0] === postalCodeDestination[0]) {
      basePrice *= 0.8;
    }

    res.status(200).json({
      price: Math.round(basePrice),
      productName: name,
      deliveryTimeMin: 3,
      deliveryTimeMax: 7,
    });
  } catch (error) {
    console.error("Error in shipping:", error.message);
    res.status(500).json({ message: "Error calculating shipping cost." });
  }
};
