import { POST } from "@/app/api/locale/route";

test("writes zh locale cookie", async () => {
  const response = await POST(
    new Request("http://localhost/api/locale", {
      method: "POST",
      body: JSON.stringify({ locale: "zh" }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );

  expect(response.status).toBe(200);
  expect(response.headers.get("set-cookie")).toContain("locale=zh");
});
