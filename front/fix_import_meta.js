const fs = require('fs');
const path = require('path');

const files = [
  'src/api/deliveryApi/ownerDeliveryApi.js',
  'src/api/getOAuthStartUrl.js',
  'src/api/ownerApi/ownerMetricsApi.js',
  'src/api/qnaApi/qnaApi.js',
  'src/api/reportApi.js',
  'src/common/ResponsiveAppBar.js',
  'src/common/Sidebar.js',
  'src/hooks/useAuth.js',
  'src/hooks/useCustomLogin.js',
  'src/hooks/useLogout.js',
  'src/layout/component/auth/EmailVerifyDialog.js',
  'src/layout/component/auth/RequireAuth.js',
  'src/layout/component/mypage/DeliveryInform.js',
  'src/layout/component/mypage/EditMyInform.js',
  'src/layout/component/mypage/EditVehicleInform.js',
  'src/layout/component/mypage/MyInform.js',
  'src/layout/component/users/FindIdComponent.js',
  'src/layout/component/users/FindPasswordComponent.js',
  'src/layout/component/users/SignUPComponent.js',
  'src/layout/component/users/SNSLoginComponent.js',
  'src/lib/apiFetch.js',
  'src/pages/GoogleRedirectPage.js',
  'src/pages/KakaoRedirectPage.js',
  'src/pages/NaverRedirectPage.js',
  'src/slice/loginSlice.js',
];

// 패턴들을 CRA 문법으로 교체
function fixContent(content) {
  // 패턴 1: (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  content = content.replace(
    /\(typeof import\.meta !== ["']undefined["'] && import\.meta\.env\?\.VITE_API_BASE\) \|\|/g,
    'process.env.REACT_APP_API_BASE ||'
  );

  // 패턴 2: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  // (위에서 이미 처리됨 - 동일 패턴)

  // 패턴 3: import.meta?.env?.VITE_API_BASE ||
  content = content.replace(
    /import\.meta\?\.env\?\.VITE_API_BASE \|\|/g,
    'process.env.REACT_APP_API_BASE ||'
  );

  // 패턴 4: import.meta?.env?.VITE_API_BASE (|| 없이 끝나는 경우)
  content = content.replace(
    /import\.meta\?\.env\?\.VITE_API_BASE/g,
    'process.env.REACT_APP_API_BASE'
  );

  // 패턴 5: import.meta.env?.VITE_API_BASE (남은 것들)
  content = content.replace(
    /import\.meta\.env\?\.VITE_API_BASE/g,
    'process.env.REACT_APP_API_BASE'
  );

  // 패턴 6: import.meta.env.VITE_API_BASE (남은 것들)
  content = content.replace(
    /import\.meta\.env\.VITE_API_BASE/g,
    'process.env.REACT_APP_API_BASE'
  );

  return content;
}

let fixedCount = 0;
let errorCount = 0;

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  파일 없음 (스킵): ${filePath}`);
    return;
  }

  try {
    const original = fs.readFileSync(filePath, 'utf8');
    const fixed = fixContent(original);

    if (original !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ 수정됨: ${filePath}`);
      fixedCount++;
    } else {
      console.log(`➡️  변경 없음: ${filePath}`);
    }
  } catch (err) {
    console.log(`❌ 오류: ${filePath} - ${err.message}`);
    errorCount++;
  }
});

console.log(`\n완료: ${fixedCount}개 파일 수정, ${errorCount}개 오류`);

// 잔여 import.meta 확인
console.log('\n--- 잔여 import.meta 검사 중 ---');
let remaining = 0;
files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('import.meta')) {
    console.log(`⚠️  아직 남아있음: ${filePath}`);
    remaining++;
  }
});
if (remaining === 0) console.log('✅ 모든 import.meta 제거 완료!');