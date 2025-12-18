/**
 * Script Test Video Call Configuration
 * Chạy script này trong Console của trình duyệt (F12) để kiểm tra cấu hình
 */

console.log('🔍 Bắt đầu kiểm tra cấu hình Video Call...\n');

// Test 1: Kiểm tra Token
console.log('📋 Test 1: Kiểm tra Token');
const token = import.meta.env.VITE_TOKKEN_VIDEOCALL;
if (!token) {
    console.error('❌ Token chưa được cấu hình!');
    console.log('   → Hãy thêm VITE_TOKKEN_VIDEOCALL vào file .env');
    console.log('   → Restart server sau khi thêm');
} else {
    console.log('✅ Token đã được load');
    console.log('   → Độ dài:', token.length, 'ký tự');
    console.log('   → Bắt đầu với:', token.substring(0, 20) + '...');
}

// Test 2: Kiểm tra Token hợp lệ
console.log('\n📋 Test 2: Kiểm tra Token hợp lệ');
if (token) {
    fetch('https://api.videosdk.live/v2/rooms', {
        method: 'POST',
        headers: {
            'authorization': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(async res => {
        const data = await res.json();
        if (res.ok && data.roomId) {
            console.log('✅ Token hợp lệ!');
            console.log('   → Room ID mẫu:', data.roomId);
        } else {
            console.error('❌ Token không hợp lệ!');
            console.error('   → Lỗi:', data);
            if (res.status === 401) {
                console.error('   → Token đã hết hạn hoặc không hợp lệ');
                console.error('   → Hãy tạo token mới trên VideoSDK dashboard');
            }
        }
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối:', err.message);
        console.error('   → Kiểm tra kết nối internet');
    });
} else {
    console.log('⏭️  Bỏ qua (chưa có token)');
}

// Test 3: Kiểm tra Quyền Camera/Mic
console.log('\n📋 Test 3: Kiểm tra Quyền Camera và Microphone');
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            console.log('✅ Camera và Microphone hoạt động!');
            const videoTracks = stream.getVideoTracks();
            const audioTracks = stream.getAudioTracks();
            console.log('   → Video tracks:', videoTracks.length);
            console.log('   → Audio tracks:', audioTracks.length);
            
            if (videoTracks.length > 0) {
                console.log('   → Camera:', videoTracks[0].label);
            }
            if (audioTracks.length > 0) {
                console.log('   → Microphone:', audioTracks[0].label);
            }
            
            // Dừng stream
            stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
            console.error('❌ Lỗi truy cập camera/microphone:', err.name);
            if (err.name === 'NotAllowedError') {
                console.error('   → Bạn đã từ chối quyền truy cập');
                console.error('   → Hãy cho phép trong Settings của trình duyệt');
            } else if (err.name === 'NotFoundError') {
                console.error('   → Không tìm thấy camera hoặc microphone');
            } else if (err.name === 'NotReadableError') {
                console.error('   → Camera/microphone đang được sử dụng bởi ứng dụng khác');
            }
        });
} else {
    console.error('❌ Trình duyệt không hỗ trợ getUserMedia');
    console.error('   → Hãy dùng Chrome, Edge, hoặc Firefox');
}

// Test 4: Kiểm tra Dependencies
console.log('\n📋 Test 4: Kiểm tra Dependencies');
console.log('   → Kiểm tra trong terminal: npm list @videosdk.live/react-sdk react-player');

// Test 5: Kiểm tra HTTPS/Localhost
console.log('\n📋 Test 5: Kiểm tra HTTPS/Localhost');
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
const isHTTPS = window.location.protocol === 'https:';

if (isLocalhost || isHTTPS) {
    console.log('✅ Đang dùng localhost hoặc HTTPS');
    console.log('   → Protocol:', window.location.protocol);
    console.log('   → Hostname:', window.location.hostname);
} else {
    console.error('❌ Đang dùng HTTP (không phải localhost)');
    console.error('   → Video call yêu cầu HTTPS hoặc localhost');
    console.error('   → Hãy chuyển sang HTTPS hoặc dùng localhost');
}

// Tổng kết
console.log('\n' + '='.repeat(50));
console.log('📊 Tổng kết:');
console.log('   → Xem kết quả các test ở trên');
console.log('   → Nếu có lỗi, xem hướng dẫn chi tiết:');
console.log('   → HUONG-DAN-CHI-TIET-VIDEO-CALL.md');
console.log('='.repeat(50));
