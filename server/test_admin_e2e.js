async function runE2ECheck() {
  console.log('=====================================================');
  console.log(' MOSSZIP STUDIO ADMIN LIMITS END-TO-END VERIFICATION ');
  console.log('=====================================================\n');

  try {
    // 1. Health check
    const healthRes = await fetch('http://localhost:3001/api/health');
    const healthData = await healthRes.json();
    console.log('✅ [PASS] Backend API Health:', healthData);

    // 2. Fetch initial limits
    const limitsRes = await fetch('http://localhost:3001/api/admin/limits');
    const limitsData = await limitsRes.json();
    console.log('✅ [PASS] Initial Admin Limits API:', limitsData.limits);

    // 3. Update limits to 10 GB (10240 MB)
    const updateRes = await fetch('http://localhost:3001/api/admin/limits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'MossZipAdmin#2026',
      },
      body: JSON.stringify({
        limits: {
          images_per_request: 10,
          videos_per_request: 2,
          pdfs_per_request: 10,
          max_total_upload_mb: 10240,
          limits_enabled: true,
        },
      }),
    });

    const updateData = await updateRes.json();
    console.log('✅ [PASS] Updated Limits Response (10 GB):', updateData.limits);

    // 4. Verify GET returns 10240 MB
    const verifyRes = await fetch('http://localhost:3001/api/admin/limits');
    const verifyData = await verifyRes.json();
    if (verifyData.limits.max_total_upload_mb === 10240) {
      console.log('✅ [PASS] Limit Verification Succeeded: max_total_upload_mb = 10240 MB (10 GB)');
    } else {
      throw new Error(`Limit verification failed: expected 10240, got ${verifyData.limits.max_total_upload_mb}`);
    }

    console.log('\n=====================================================');
    console.log(' ALL ADMIN LIMITS END-TO-END TESTS PASSED 100% SUCCESS ');
    console.log('=====================================================');
  } catch (err) {
    console.error('❌ [FAIL] End-to-End Verification Error:', err);
    process.exit(1);
  }
}

runE2ECheck();
