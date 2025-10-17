// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';

// --- START OF CHANGES ---
// 1. ใช้ Port ที่ Render กำหนดมาให้ หรือถ้าไม่มีให้ใช้ 3000
const port = parseInt(process.env.PORT || "3000", 10);
// 2. เปลี่ยน Host ให้เป็น 0.0.0.0 เพื่อให้ Render ตรวจจับได้
const host = "0.0.0.0";
// --- END OF CHANGES ---


// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO
    const server = createServer((req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }
      handle(req, res);
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // เรียกใช้ฟังก์ชัน setupSocket ของคุณ (ผมเดาว่าคุณต้องเรียกใช้มัน)
    setupSocket(io);

    // --- APPLYING CHANGES TO .listen() ---
    // สั่งให้ Server เริ่มทำงานด้วย port และ host ที่แก้ไขแล้ว
    server.listen(port, host, (err?: any) => {
      if (err) throw err;
      // เปลี่ยน Log ให้แสดงผลถูกต้อง
      console.log(`> Server ready on http://${host}:${port}`);
    });

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

// สั่งให้เซิร์ฟเวอร์เริ่มทำงาน
createCustomServer();