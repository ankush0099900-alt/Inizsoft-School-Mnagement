import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { exec } from "child_process";

const server = app.listen(env.PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);

  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("🌱 Database is empty! Running initial seed...");
      exec("npx tsx prisma/seed.ts", (err, stdout, stderr) => {
        if (err) {
          console.error("❌ Auto-seed error:", err);
        } else {
          console.log("✅ Auto-seed completed successfully!\n", stdout);
        }
      });
    } else {
      console.log(`ℹ️ Database already has ${userCount} users.`);
    }
  } catch (err) {
    console.error("⚠️ Failed to check user count on startup:", err);
  }
});

server.on("error", (err) => {
  console.error("Server error:", err);
});
