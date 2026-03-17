import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url);
jiti.import("./server.ts").catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
