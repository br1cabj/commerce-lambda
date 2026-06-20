const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/page.tsx',
  'src/app/admin/coupons/page.tsx',
  'src/app/admin/home-builder/page.tsx',
  'src/app/admin/orders/page.tsx',
  'src/app/admin/reviews/page.tsx',
  'src/app/admin/settings/page.tsx',
  'src/app/admin/templates/page.tsx',
  'src/app/super/layout.tsx',
  'src/app/super/page.tsx',
  'src/app/tracking/page.tsx'
];

files.forEach(file => {
  const fullPath = path.join('C:/Users/esqui/Desktop/project/Ecommerce-lambda/platform-frontend', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    
    // Check if the component has useAuth
    if (content.includes('useAuth()')) {
      const authMatch = content.match(/const \{([^}]*isAuthenticated[^}]*)\} = useAuth\(\);/);
      if (authMatch && !authMatch[0].includes('isHydrated')) {
        content = content.replace(/const \{([^}]*isAuthenticated[^}]*)\} = useAuth\(\);/, (match, p1) => {
          changed = true;
          return `const {${p1}, isHydrated} = useAuth();`;
        });
      }
      
      const routerMatch = content.match(/(if\s*\([^)]*(?:isAuthenticated)[^)]*\)\s*\{[\s\S]*?router\.push\([\s\S]*?\n\s*\})/);
      if (routerMatch && !content.includes('!isHydrated')) {
        content = content.replace(/(if\s*\([^)]*(?:isAuthenticated)[^)]*\)\s*\{[\s\S]*?router\.push\([\s\S]*?\n\s*\})/, (match) => {
          changed = true;
          return `if (!isHydrated) return;\n    ${match}`;
        });
      }
      
      // Update dependency array
      if (changed) {
        content = content.replace(/\[([^\]]*isAuthenticated[^\]]*)\]/g, (match, p1) => {
          if (!p1.includes('isHydrated')) {
            return `[${p1}, isHydrated]`;
          }
          return match;
        });
      }
    }

    if (changed) {
      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${file}`);
    }
  }
});
