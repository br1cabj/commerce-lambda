"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";

export default function TermsPage() {
  const { config } = useTenant();
  const { currentLanguage } = useTranslations();
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "privacy") {
        setActiveTab("privacy");
      } else if (tab === "terms") {
        setActiveTab("terms");
      }
    }
  }, []);

  if (!config) return null;

  const isEs = currentLanguage === "es";

  // Resolve custom text from database settings
  const customTerms = config.settings.footer?.termsOfService?.[currentLanguage] || config.settings.footer?.termsOfService?.en || "";
  const customPrivacy = config.settings.footer?.privacyPolicy?.[currentLanguage] || config.settings.footer?.privacyPolicy?.en || "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">
        {activeTab === "terms"
          ? (isEs ? "Términos y Condiciones" : "Terms & Conditions")
          : (isEs ? "Política de Privacidad" : "Privacy Policy")}
      </h1>

      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("terms")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "terms"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-950"
          }`}
        >
          {isEs ? "Términos y Condiciones" : "Terms & Conditions"}
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "privacy"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-950"
          }`}
        >
          {isEs ? "Política de Privacidad" : "Privacy Policy"}
        </button>
      </div>

      <div className="prose max-w-none">
        {activeTab === "terms" ? (
          customTerms ? (
            <div className="whitespace-pre-wrap text-gray-600 leading-relaxed text-sm bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-sm">
              {customTerms}
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-3">{isEs ? "1. General" : "1. General"}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {isEs
                    ? `Al acceder y utilizar la tienda en línea de ${config.name}, aceptas estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, por favor no utilices nuestros servicios.`
                    : `By accessing and using ${config.name}'s online store, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.`}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">{isEs ? "2. Productos" : "2. Products"}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {isEs
                    ? `Todos los productos que se muestran en nuestra tienda están sujetos a disponibilidad. Nos reservamos el derecho de modificar los precios, las descripciones y la disponibilidad sin previo aviso. Las imágenes de los productos son de carácter ilustrativo y pueden diferir ligeramente del producto real.`
                    : `All products displayed on our store are subject to availability. We reserve the right to modify prices, descriptions, and availability without prior notice. Product images are for illustrative purposes and may differ slightly from the actual product.`}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">{isEs ? "3. Pedidos" : "3. Orders"}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {isEs
                    ? `Los pedidos se confirman después de la verificación del pago. Nos reservamos el derecho de cancelar cualquier pedido si hay un error en el precio, la descripción del producto o si el producto está agotado. Se te notificará por WhatsApp o correo electrónico si tu pedido es cancelado.`
                    : `Orders are confirmed after payment verification. We reserve the right to cancel any order if there is an error in pricing, product description, or if the product is out of stock. You will be notified via WhatsApp or email if your order is cancelled.`}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">{isEs ? "4. Pago" : "4. Payment"}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {isEs
                    ? `El pago debe completarse antes de que se procese tu pedido. Aceptamos transferencias bancarias y otros métodos de pago como se muestra al finalizar la compra. Los precios están en ${config.settings.currency}.`
                    : `Payment must be completed before your order is processed. We accept bank transfers and other payment methods as displayed at checkout. Prices are in ${config.settings.currency}.`}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">{isEs ? "5. Envíos" : "5. Shipping"}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {isEs
                    ? `Los costos de envío se calculan en función de tu ubicación y se comunicarán antes del despacho. Los plazos de entrega son estimaciones y pueden variar. No nos hacemos responsables de los retrasos causados por la empresa de envíos.`
                    : `Shipping costs are calculated based on your location and will be communicated before dispatch. Delivery times are estimates and may vary. We are not responsible for delays caused by the shipping carrier.`}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">{isEs ? "6. Devoluciones y Reembolsos" : "6. Returns & Refunds"}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {isEs
                    ? `Puedes solicitar una devolución dentro de los 30 días posteriores a la recepción de tu pedido. Los productos deben estar en su estado original con todas las etiquetas colocadas. Los costos de envío para las devoluciones son responsabilidad del cliente, a menos que el producto sea defectuoso.`
                    : `You may request a return within 35 days of receiving your order. Products must be in their original condition with all tags attached. Shipping costs for returns are the responsibility of the customer unless the product is defective.`}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">{isEs ? "7. Contacto" : "7. Contact"}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {isEs
                    ? "Para cualquier pregunta relacionada con estos términos, contáctanos en "
                    : "For any questions regarding these terms, please contact us at "}
                  {config.settings.email && (
                    <a
                      href={`mailto:${config.settings.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {config.settings.email}
                    </a>
                  )}
                  {isEs ? " o por WhatsApp al " : " or via WhatsApp at "}
                  {config.settings.whatsappNumber || config.settings.phone}.
                </p>
              </section>
            </div>
          )
        ) : customPrivacy ? (
          <div className="whitespace-pre-wrap text-gray-600 leading-relaxed text-sm bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-sm">
            {customPrivacy}
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-3">{isEs ? "1. Recopilación de Información" : "1. Collection of Information"}</h2>
              <p className="text-gray-600 leading-relaxed">
                {isEs
                  ? `Recopilamos información cuando realiza una compra, se suscribe a nuestro boletín o se pone en contacto con nosotros. La información recopilada incluye su nombre, dirección de correo electrónico, número de teléfono y dirección de envío.`
                  : `We collect information when you make a purchase, subscribe to our newsletter, or contact us. The information collected includes your name, email address, phone number, and shipping address.`}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">{isEs ? "2. Uso de la Información" : "2. Use of Information"}</h2>
              <p className="text-gray-600 leading-relaxed">
                {isEs
                  ? `Cualquiera de las informaciones que recopilamos de usted puede ser utilizada para: procesar transacciones, mejorar el servicio al cliente, enviar correos electrónicos periódicos o gestionar envíos de productos.`
                  : `Any of the information we collect from you may be used to: process transactions, improve customer service, send periodic emails, or manage product shipments.`}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">{isEs ? "3. Seguridad de los Datos" : "3. Data Security"}</h2>
              <p className="text-gray-600 leading-relaxed">
                {isEs
                  ? `Implementamos una variedad de medidas de seguridad para mantener la seguridad de su información personal. Sus datos de pago se procesan a través de canales seguros y cifrados y nunca se almacenan en nuestros servidores.`
                  : `We implement a variety of security measures to maintain the safety of your personal information. Your payment details are processed through secure and encrypted channels and are never stored on our servers.`}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">{isEs ? "4. Divulgación a Terceros" : "4. Third-Party Disclosure"}</h2>
              <p className="text-gray-600 leading-relaxed">
                {isEs
                  ? `No vendemos, comercializamos ni transferimos de otro modo a terceros su información de identificación personal. Esto no incluye a los terceros de confianza que nos asisten en la operación de nuestro sitio web o la realización de nuestro negocio, como las empresas de transporte.`
                  : `We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website or conducting our business, such as shipping carriers.`}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">{isEs ? "5. Contacto de Privacidad" : "5. Privacy Contact"}</h2>
              <p className="text-gray-600 leading-relaxed">
                {isEs
                  ? "Si tiene preguntas sobre esta Política de Privacidad, contáctenos en "
                  : "If you have questions regarding this Privacy Policy, please contact us at "}
                {config.settings.email && (
                  <a
                    href={`mailto:${config.settings.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {config.settings.email}
                  </a>
                )}
                .
              </p>
            </section>
          </div>
        )}
      </div>

      <div className="mt-12 pt-6 border-t">
        <Link href="/" className="text-blue-600 hover:underline font-semibold text-sm">
          {isEs ? "← Volver al Inicio" : "← Back to Home"}
        </Link>
      </div>
    </div>
  );
}
