"use client";

import Link from "next/link";
import Image from "next/image";
import { useTenant } from "@/hooks/useTenant";
import { useTranslations } from "@/hooks/useTranslations";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import type { FooterLink } from "@/stores/tenantStore";

export default function Footer() {
  const { config } = useTenant();
  const { t, currentLanguage } = useTranslations();

  if (!config) return null;

  const footerConfig = config.settings.footer || {
    preset: "classic",
    bgColorMode: "dark",
    description: {
      en: "Your specialized online store. The best brands, the latest launches, and passion for quality in one place.",
      es: "Tu tienda online especializada. Las mejores marcas, los últimos lanzamientos y pasión por la calidad en un solo lugar.",
    },
    showSocials: true,
    showPaymentMethods: true,
    showContactInfo: true,
    showNewsletter: false,
    socialLinks: {},
    featuredCategories: [],
    customLinks: [],
  };

  const bgColorMode = footerConfig.bgColorMode || "dark";
  const showSocials = footerConfig.showSocials ?? true;
  const showPaymentMethods = footerConfig.showPaymentMethods ?? true;
  const socialLinks = footerConfig.socialLinks || {};
  const customLinks = footerConfig.customLinks || [];
  const featuredCategories = footerConfig.featuredCategories || [];

  // Resolve description text
  const descriptionText =
    t(footerConfig.description) ||
    (currentLanguage === "es"
      ? "Tu tienda online especializada. Las mejores marcas, los últimos lanzamientos y pasión por la calidad en un solo lugar."
      : "Your specialized online store. The best brands, the latest launches, and passion for quality in one place.");

  // Styling maps based on color mode settings
  let bgClass = "bg-gray-900 text-white mt-auto pt-16 pb-8";
  let textMutedClass = "text-gray-400";
  let inlineBgIconClass = "bg-gray-800 hover:bg-gray-700 text-white";
  let borderClass = "border-gray-800";
  let linkHoverClass = "hover:text-white transition-all hover:translate-x-1 duration-200 inline-block";
  let inlineStyle = {};

  if (bgColorMode === "light") {
    bgClass = "bg-gray-50 text-gray-900 mt-auto pt-16 pb-8 border-t border-gray-200";
    textMutedClass = "text-gray-500";
    inlineBgIconClass = "bg-gray-200 hover:bg-gray-300 text-gray-700";
    borderClass = "border-gray-200";
    linkHoverClass = "hover:text-gray-900 transition-all hover:translate-x-1 duration-200 inline-block";
  } else if (bgColorMode === "brand") {
    bgClass = "text-white mt-auto pt-16 pb-8";
    textMutedClass = "text-white/80";
    inlineBgIconClass = "bg-white/10 hover:bg-white/20 text-white";
    borderClass = "border-white/10";
    linkHoverClass = "hover:opacity-90 transition-all hover:translate-x-1 duration-200 inline-block";
    inlineStyle = { backgroundColor: config.theme.primaryColor || "#000000" };
  }

  // Payment rendering helper displaying dynamic high fidelity SVGs
  const activePayments = config.settings.paymentMethods?.filter((p) => p.enabled).map((p) => p.type) || [];
  const paymentDisplayList = activePayments.length > 0 ? activePayments : ["visa", "mastercard", "paypal", "stripe"];

  const renderPaymentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "visa":
        return (
          <div key="visa" className="transition-all hover:scale-105 hover:shadow-md rounded" title="Visa">
            <svg className="h-5 w-8" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="24" rx="4" fill="#1A1F71" />
              <path d="M11.8 16.2H10.1L9 9.3H10.7L11.8 16.2ZM19.2 9.5C18.6 9.3 17.8 9.1 17 9.1C14.7 9.1 13.1 10.3 13 12C12.9 13.3 14.1 14 15 14.4C15.9 14.8 16.2 15.1 16.2 15.5C16.2 16.1 15.5 16.4 14.8 16.4C13.8 16.4 13.2 16.1 12.8 15.9L12.3 17.8C12.9 18.1 13.9 18.3 15 18.3C17.4 18.3 19 17.1 19.1 15.3C19.2 13.8 18.2 13.1 17.1 12.6C16.2 12.1 15.9 11.8 15.9 11.4C15.9 10.9 16.5 10.5 17.4 10.5C18.2 10.5 18.8 10.7 19.1 10.9L19.6 9L19.2 9.5ZM26.3 9.3C25.9 9.3 25.6 9.5 25.4 9.9L22.1 16.2H23.9L24.3 15.1H26.5L26.7 16.2H28.3L27.1 9.3H26.3ZM24.8 13.6L25.9 10.8L26.2 13.6H24.8ZM7.9 9.3H4.7L3.1 14.6C2.3 12.5 1.5 9.7 1.5 9.7C1.5 9.7 2.3 15.3 4.2 16.2H6L7.9 9.3Z" fill="white" />
            </svg>
          </div>
        );
      case "mastercard":
        return (
          <div key="mastercard" className="transition-all hover:scale-105 hover:shadow-md rounded" title="MasterCard">
            <svg className="h-5 w-8" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="24" rx="4" fill="#0A0A0A" />
              <circle cx="14" cy="12" r="7" fill="#EB001B" />
              <circle cx="22" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8" />
            </svg>
          </div>
        );
      case "paypal":
        return (
          <div key="paypal" className="transition-all hover:scale-105 hover:shadow-md rounded" title="PayPal">
            <svg className="h-5 w-8" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="24" rx="4" fill="#003087" />
              <path d="M12.5 7.5H16.5C18.5 7.5 19.5 8.5 19.3 10.3C19.1 12.1 17.9 13.1 15.9 13.1H14.1L13.1 18.5H11L12.5 7.5Z" fill="#0079C1" />
              <path d="M14.5 9.5H18.5C20.5 9.5 21.5 10.5 21.3 12.3C21.1 14.1 19.9 15.1 17.9 15.1H16.1L15.1 20.5H13L14.5 9.5Z" fill="#00457C" fillOpacity="0.6" />
            </svg>
          </div>
        );
      case "stripe":
        return (
          <div key="stripe" className="transition-all hover:scale-105 hover:shadow-md rounded" title="Stripe">
            <svg className="h-5 w-8" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="24" rx="4" fill="#635BFF" />
              <path d="M17.1 11.2C17.1 10.3 16.4 9.9 15.4 9.9C14.3 9.9 13.2 10.3 12.4 10.8L11.7 8.9C12.8 8.1 14.3 7.8 15.7 7.8C18.2 7.8 19.9 9.1 19.9 11.4C19.9 14.5 15.8 14.1 15.8 15.2C15.8 15.7 16.3 16.0 17.1 16.0C18.2 16.0 19.5 15.5 20.4 14.9L21 16.8C19.8 17.7 18.2 18.1 16.8 18.1C14.1 18.1 12.7 16.7 12.7 14.6C12.7 11.5 17.1 11.9 17.1 11.2Z" fill="white" />
            </svg>
          </div>
        );
      case "mercadopago":
        return (
          <div key="mercadopago" className="transition-all hover:scale-105 hover:shadow-md rounded" title="Mercado Pago">
            <svg className="h-5 w-8" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="24" rx="4" fill="#00B1EA" />
              <path d="M9 16.5L12.5 8.5L16 16.5M10.2 13.5H14.8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 16.5V8.5L25 12.5L29 8.5V16.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      case "whatsapp":
        return (
          <div key="whatsapp" className="transition-all hover:scale-105 hover:shadow-md rounded" title="WhatsApp Checkout">
            <svg className="h-5 w-8" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="24" rx="4" fill="#25D366" />
              <path d="M18 6C13.58 6 10 9.58 10 14C10 15.54 10.43 16.97 11.18 18.2L10 22.5L14.45 21.36C15.58 21.98 16.89 22.33 18 22.33C22.42 22.33 26 18.75 26 14.33C26 9.91 22.42 6 18 6ZM18 20.89C16.88 20.89 15.82 20.61 14.88 20.08L14.62 19.93L12.01 20.61L12.7 18.06L12.53 17.79C11.95 16.88 11.64 15.82 11.64 14.73C11.64 11.22 14.5 8.36 18 8.36C21.5 8.36 24.36 11.22 24.36 14.73C24.36 18.24 21.5 20.89 18 20.89Z" fill="white" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSocialIcon = (network: string, url: string | undefined) => {
    if (!url) return null;
    let svgPath = "";
    const viewBox = "0 0 24 24";

    switch (network) {
      case "facebook":
        svgPath = "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";
        break;
      case "instagram":
        svgPath = "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z";
        break;
      case "twitter":
        svgPath = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z";
        break;
      case "tiktok":
        svgPath = "M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.99-1.72-.08-.07-.17-.17-.25-.25v6.07c0 3.7-2.5 7.34-6.31 7.82-3.8.48-7.7-1.84-8.85-5.55-1.15-3.7 1.15-8.1 4.96-8.91 1.21-.26 2.47-.07 3.61.43V.02z";
        break;
      case "youtube":
        svgPath = "M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z";
        break;
    }

    if (!svgPath) return null;
    return (
      <a
        key={network}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${inlineBgIconClass}`}
        aria-label={network}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox={viewBox}>
          <path d={svgPath} />
        </svg>
      </a>
    );
  };

  const socialsList = showSocials ? (
    <div className="flex gap-2">
      {renderSocialIcon("facebook", socialLinks.facebook)}
      {renderSocialIcon("instagram", socialLinks.instagram)}
      {renderSocialIcon("twitter", socialLinks.twitter)}
      {renderSocialIcon("tiktok", socialLinks.tiktok)}
      {renderSocialIcon("youtube", socialLinks.youtube)}
    </div>
  ) : null;

  // Resolve Column 3: Featured Categories
  const hasFeaturedCategories = featuredCategories && featuredCategories.length > 0;
  const categoriesToRender = hasFeaturedCategories
    ? featuredCategories
        .map((id) => config.categories.find((c) => c._id === id))
        .filter((c): c is NonNullable<typeof c> => !!c && c.isActive)
        .slice(0, 5)
    : config.categories.filter((c) => c.isActive).slice(0, 5);

  // Resolve Column 4: Contact details (auto-hiding logic)
  const whatsapp = config.settings.whatsappNumber;
  const email = config.settings.email;
  const address = config.settings.address;
  const openingHours = config.settings.openingHours;
  const phone = config.settings.phone;

  const hasContactInfo = !!(whatsapp || email || address || openingHours || phone);

  // Fallback links for Column 2
  const fallbackLinks = [
    { label: currentLanguage === "es" ? "Inicio" : "Home", url: "/" },
    { label: currentLanguage === "es" ? "Productos" : "Products", url: "/catalog" },
    { label: currentLanguage === "es" ? "Ofertas" : "Offers", url: "/catalog?sort=bestselling" },
    {
      label: currentLanguage === "es" ? "Contacto" : "Contact",
      url: whatsapp
        ? `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`
        : email
        ? `mailto:${email}`
        : "/",
    },
    { label: currentLanguage === "es" ? "Preguntas Frecuentes" : "FAQ", url: "/faq" },
  ];

  return (
    <footer id="global-footer" className={bgClass} style={inlineStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {config.theme.logoUrl && (
                <Image
                  src={config.theme.logoUrl}
                  alt={config.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover border border-white/10"
                  unoptimized
                />
              )}
              <h5 className="font-bold text-lg tracking-wider" style={{ color: config.theme.accentColor }}>
                {config.name}
              </h5>
            </div>
            {descriptionText && (
              <p className={`text-sm ${textMutedClass} leading-relaxed`}>{descriptionText}</p>
            )}
            {socialsList}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h6 className="font-bold text-uppercase mb-4 text-sm tracking-wider">
              {currentLanguage === "es" ? "Enlaces Rápidos" : "Quick Links"}
            </h6>
            <ul className={`space-y-3 text-sm ${textMutedClass}`}>
              {customLinks.length > 0
                ? customLinks.map((link: FooterLink) => (
                    <li key={link.id || link.url}>
                      <Link href={link.url} className={linkHoverClass}>
                        {link.label[currentLanguage] || link.label.en || link.label.es || ""}
                      </Link>
                    </li>
                  ))
                : fallbackLinks.map((link, idx) => (
                    <li key={idx}>
                      {link.url.startsWith("http") || link.url.startsWith("mailto:") ? (
                        <a href={link.url} className={linkHoverClass} target={link.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.url} className={linkHoverClass}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
            </ul>
          </div>

          {/* Column 3: Featured Categories */}
          <div>
            <h6 className="font-bold text-uppercase mb-4 text-sm tracking-wider">
              {currentLanguage === "es" ? "Categorías" : "Categories"}
            </h6>
            <ul className={`space-y-3 text-sm ${textMutedClass}`}>
              {categoriesToRender.map((cat) => (
                <li key={cat._id}>
                  <Link href={`/catalog/${cat.slug}`} className={linkHoverClass}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Details (Conditional layout) */}
          {hasContactInfo ? (
            <div>
              <h6 className="font-bold text-uppercase mb-4 text-sm tracking-wider">
                {currentLanguage === "es" ? "Contacto" : "Contact"}
              </h6>
              <div className={`space-y-3 text-sm ${textMutedClass}`}>
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:opacity-85 transition-opacity"
                  >
                    <svg className="h-4 w-4 flex-shrink-0" style={{ color: config.theme.accentColor }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.9 9.9 0 0 0-6.98-2.879c-5.443 0-9.87 4.37-9.874 9.8.001 1.761.472 3.486 1.365 5.022L1.87 21.05l5.223-1.37a9.78 9.78 0 0 0-4.446-4.526zm11.33-4.512c-.287-.143-1.697-.838-1.959-.933-.263-.096-.454-.143-.646.143-.192.287-.743.933-.91 1.124-.167.192-.334.215-.621.072-2.876-1.433-4.726-2.879-6.623-6.136-.184-.316.184-.293.527-.976.096-.192.048-.36-.024-.503-.072-.143-.646-1.555-.885-2.128-.233-.561-.47-.484-.646-.493-.167-.008-.359-.01-.55-.01s-.502.072-.765.36c-.263.287-1.004.98-1.004 2.39s1.028 2.775 1.171 2.966c.143.192 2.024 3.09 4.904 4.33.685.295 1.22.471 1.637.603.689.219 1.316.188 1.812.114.553-.083 1.697-.693 1.937-1.362.24-.669.24-1.243.167-1.362-.072-.119-.263-.215-.55-.358z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                    <Phone className="h-4 w-4 flex-shrink-0" style={{ color: config.theme.accentColor }} />
                    <span>{phone}</span>
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                    <Mail className="h-4 w-4 flex-shrink-0" style={{ color: config.theme.accentColor }} />
                    <span className="break-all">{email}</span>
                  </a>
                )}
                {address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: config.theme.accentColor }} />
                    <span>{address}</span>
                  </div>
                )}
                {openingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: config.theme.accentColor }} />
                    <span className="whitespace-pre-wrap">{openingHours}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

        </div>

        <hr className={borderClass} />

        <div className={`mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${textMutedClass}`}>
          <p>
            &copy; {new Date().getFullYear()} {config.name}. {currentLanguage === "es" ? "Todos los derechos reservados." : "All rights reserved."}
          </p>
          <div className="flex gap-6">
            <Link href="/terms?tab=privacy" className={linkHoverClass}>
              {currentLanguage === "es" ? "Política de Privacidad" : "Privacy Policy"}
            </Link>
            <Link href="/terms?tab=terms" className={linkHoverClass}>
              {currentLanguage === "es" ? "Términos del Servicio" : "Terms of Service"}
            </Link>
          </div>
          {showPaymentMethods && activePayments.length > 0 && (
            <div className="flex gap-2">
              {paymentDisplayList.map((method) => renderPaymentIcon(method))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
