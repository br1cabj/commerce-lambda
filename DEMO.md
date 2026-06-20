# 🎮 Demo Store - Showcase del Sistema

Este seed crea una tienda demo completamente funcional con datos realistas para mostrar todas las capacidades del sistema.

## 🚀 Uso Rápido

### Ejecutar el Seed

```bash
cd backend
node scripts/seedDemo.js
```

O usando npm:

```bash
npm run seed:demo
```

### Acceso al Demo

Una vez ejecutado el seed, puedes acceder de tres formas:

#### 1. Variable de Entorno (Recomendado para desarrollo)
```bash
# En platform-frontend/.env.local
NEXT_PUBLIC_DEFAULT_TENANT=demo
```

#### 2. Subdominio (Para producción)
```
http://demo.yourdomain.com
```

#### 3. Header HTTP (Para testing)
```bash
curl -H "X-Tenant-Slug: demo" http://localhost:3001/api/store/config
```

## 📊 Contenido del Demo

### Credenciales de Admin
- **Email:** admin@demo.com
- **Password:** demo123

### Estadísticas
- **Categorías:** 8 (Fashion, Electronics, Home & Living, Sports, Beauty, Books, Accessories, Toys)
- **Productos:** 40+ productos mixtos
- **Reviews:** 3 reviews con fotos
- **Featured Products:** 12 productos destacados
- **New Arrivals:** 10 productos nuevos
- **Best Sellers:** 10 más vendidos
- **Special Offers:** 8 productos con descuento (20-60% off)

### Secciones del Home
✅ Hero Carousel (3 slides)
✅ Trust Signals (4 señales)
✅ Promotional Banners (3 banners)
✅ Categories Section (8 categorías con layout grid)
✅ Special Offers (con countdown timer)
✅ Featured Products
✅ New Arrivals
✅ Best Sellers
✅ Brands Section (6 marcas)
✅ Why Choose Us (4 beneficios)
✅ How It Works (4 pasos)
✅ Reviews Section (3 reviews)
✅ Payment Methods
✅ FAQ Section (5 preguntas)
✅ Newsletter

### Configuración del Home
- **Layout:** Grid
- **Columnas:** 3
- **Card Style:** Overlay
- **Hover Effect:** Zoom
- **Border Radius:** 2xl
- **Max Height:** 256px

## 🎨 Características Visuales

### Imágenes
Todas las imágenes son de **Unsplash** (gratuitas y de alta calidad):
- Productos reales con fotos profesionales
- Categorías con imágenes representativas
- Reviews con fotos de perfil
- Banners promocionales atractivos

### Productos Mixtos
El demo incluye productos de diferentes rubros:
- 👕 **Fashion:** Sneakers, jackets, dresses
- 💻 **Electronics:** Headphones, smartwatches, speakers
- 🏠 **Home & Living:** Candles, pillows, wall art
- ⚽ **Sports:** Yoga mats, running shoes, gym bags
- 💄 **Beauty:** Moisturizers, perfumes, hair tools
- 📚 **Books:** Novels, cookbooks, art books
- ⌚ **Accessories:** Belts, sunglasses
- 🎮 **Toys:** LEGO, board games, action figures

### Precios Realistas
- Productos desde $14.99 hasta $399.99
- Descuentos de 15% a 60%
- Stock variado (algunos productos con stock bajo para demo)

## 🗑️ Eliminar Demo

### Opción 1: Desde Super Admin
1. Accede a `/super/tenants`
2. Busca "Demo Store"
3. Click en "Delete"

### Opción 2: Script de limpieza
```bash
cd backend
node scripts/removeDemo.js
```

### Opción 3: Manualmente desde MongoDB
```javascript
// En MongoDB shell
use ecommerce
db.tenants.deleteOne({ slug: "demo" })
db.users.deleteMany({ tenantId: ObjectId("...") })
db.categories.deleteMany({ tenantId: ObjectId("...") })
db.products.deleteMany({ tenantId: ObjectId("...") })
db.reviews.deleteMany({ tenantId: ObjectId("...") })
```

## 📸 Screenshots para Ventas

El demo está diseñado para mostrar:

### 1. **Variedad de Productos**
- Muestra que el sistema soporta cualquier tipo de producto
- Diferentes categorías, tallas, precios

### 2. **Todas las Features**
- Hero carousel con múltiples slides
- Secciones configurables
- Layouts de categorías
- Countdown timers
- Reviews con fotos

### 3. **Profesionalismo**
- Imágenes de alta calidad
- Diseño moderno y limpio
- Responsive design
- Multi-idioma (EN/ES)

### 4. **Personalización**
- Colores configurables
- Layouts editables
- Secciones activables/desactivables
- Textos traducibles

## 🎯 Casos de Uso

### Para Vender el Sistema
1. **Demo en vivo:** Muestra el sistema funcionando con datos reales
2. **Screenshots:** Captura las diferentes secciones del home
3. **Video demo:** Graba navegando por el sitio
4. **Personalización:** Cambia colores/layouts en tiempo real

### Para Clientes
1. **Onboarding:** El cliente ve cómo se verá su tienda
2. **Pruebas:** Puede probar todas las features antes de configurar
3. **Inspiración:** Ve ejemplos de productos y categorías
4. **Training:** Aprende a usar el admin con datos de ejemplo

## 🔧 Personalización del Demo

### Cambiar Datos
Edita `backend/scripts/seedDemo.js` y modifica:
- `demoData.tenant` - Configuración de la tienda
- `demoData.categories` - Categorías
- `demoData.products` - Productos
- `demoData.reviews` - Reviews

### Cambiar Imágenes
Reemplaza las URLs de Unsplash con tus propias imágenes:
```javascript
images: ["https://tu-imagen.jpg"]
```

### Cambiar Colores
Modifica el tema en `demoData.tenant.theme`:
```javascript
theme: {
  primaryColor: "#tu-color",
  secondaryColor: "#tu-color",
  accentColor: "#tu-color",
}
```

## 🌐 URLs de Interés

- **Home:** http://localhost:3000
- **Admin:** http://localhost:3000/admin
- **Catálogo:** http://localhost:3000/catalog
- **Producto:** http://localhost:3000/product/[id]
- **Super Admin:** http://localhost:3000/super

## 💡 Tips

1. **Primera vez:** Ejecuta el seed y espera a que termine
2. **Cambios rápidos:** Edita desde el admin, no necesitas re-ejecutar el seed
3. **Múltiples demos:** Puedes crear varios tenants demo con diferentes slugs
4. **Producción:** No uses el demo en producción, crea un tenant real
5. **Performance:** El demo tiene 40+ productos, considera paginación si crece

## 🆘 Troubleshooting

### Error: "Demo tenant already exists"
El script automáticamente elimina los datos existentes y los recrea.

### Error: "Cannot connect to database"
Verifica que MongoDB esté corriendo y que `MONGODB_URI` esté configurado en `.env`.

### Las imágenes no cargan
Verifica tu conexión a internet. Las imágenes son de Unsplash y requieren conexión.

### El home se ve vacío
Asegúrate de que `NEXT_PUBLIC_DEFAULT_TENANT=demo` esté en `.env.local` del frontend.

## 📝 Notas

- El seed es **idempotente**: puedes ejecutarlo múltiples veces
- Los datos son **realistas** pero ficticios
- Las imágenes son de **Unsplash** (licencia gratuita)
- El demo es **completo**: incluye todas las features del sistema
- Es **fácil de eliminar**: un click desde Super Admin

---

**¿Necesitas ayuda?** Revisa la documentación principal del proyecto o contacta al equipo de desarrollo.
