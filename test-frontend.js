const BASE_URL = 'https://stellargame.up.railway.app';

async function checkFrontend() {
  console.log('🔄 CHECKING FRONTEND STATUS...');
  console.log('');
  
  const timestamp = Date.now();
  const cacheBuster = `?v=${timestamp}&nocache=true`;
  
  try {
    const response = await fetch(BASE_URL + '/' + cacheBuster, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      
      console.log('📊 Frontend Status:');
      console.log('   Status:', response.status);
      console.log('   HTML Size:', html.length, 'chars');
      
      const hasReactRoot = html.includes('id="root"');
      const hasViteScript = html.includes('index-') && html.includes('.js');
      const hasCSS = html.includes('index-') && html.includes('.css');
      
      console.log('   Has React Root:', hasReactRoot);
      console.log('   Has Vite Script:', hasViteScript);
      console.log('   Has CSS:', hasCSS);
      
      if (hasReactRoot && hasViteScript && hasCSS) {
        console.log('');
        console.log('✅ FRONTEND IS READY!');
        console.log('🎯 Admin bypass should work now!');
        console.log('');
        console.log('📋 CARA TEST ADMIN LOGIN:');
        console.log('1. Buka INCOGNITO/PRIVATE browser');
        console.log('2. Kunjungi: https://stellargame.up.railway.app/');
        console.log('3. Klik "Admin Access" di bawah form login');
        console.log('4. Masukkan: admin / stellar2026!');
        console.log('   ATAU: adminresta / adminresta123');
        console.log('5. Admin panel akan terbuka otomatis');
        console.log('');
        console.log('⚠️  PENTING: WAJIB gunakan incognito mode!');
      } else {
        console.log('');
        console.log('⚠️  Frontend belum siap, tunggu sebentar...');
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkFrontend().catch(console.error);