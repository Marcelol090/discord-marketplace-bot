import { describe, it, expect } from "vitest";

describe("Supabase Credentials Validation", () => {
  it("deve validar SUPABASE_URL", () => {
    const url = process.env.SUPABASE_URL;
    expect(url).toBeDefined();
    expect(url).toContain("supabase.co");
    expect(url).toBe("https://orwgrdqyahuppfipdtbr.supabase.co");
    console.log(`✅ SUPABASE_URL válida: ${url}`);
  });

  it("deve validar SUPABASE_ANON_KEY", () => {
    const key = process.env.SUPABASE_ANON_KEY;
    expect(key).toBeDefined();
    expect(key).toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    expect(key.split(".").length).toBe(3); // JWT com 3 partes
    console.log(`✅ SUPABASE_ANON_KEY válida (JWT com ${key.length} caracteres)`);
  });

  it("deve validar SUPABASE_SERVICE_KEY", () => {
    const key = process.env.SUPABASE_SERVICE_KEY;
    expect(key).toBeDefined();
    expect(key).toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    expect(key.split(".").length).toBe(3); // JWT com 3 partes
    console.log(`✅ SUPABASE_SERVICE_KEY válida (JWT com ${key.length} caracteres)`);
  });

  it("deve decodificar JWT do Supabase", () => {
    const key = process.env.SUPABASE_ANON_KEY;
    if (!key) throw new Error("SUPABASE_ANON_KEY não definida");

    const parts = key.split(".");
    expect(parts.length).toBe(3);

    // Decodificar payload (segunda parte)
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    expect(payload.iss).toBe("supabase");
    expect(payload.ref).toBe("orwgrdqyahuppfipdtbr");
    expect(payload.role).toBe("anon");

    console.log(`✅ JWT decodificado com sucesso:`);
    console.log(`   - Issuer: ${payload.iss}`);
    console.log(`   - Project: ${payload.ref}`);
    console.log(`   - Role: ${payload.role}`);
  });

  it("deve validar service key JWT", () => {
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!key) throw new Error("SUPABASE_SERVICE_KEY não definida");

    const parts = key.split(".");
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    expect(payload.role).toBe("service_role");
    console.log(`✅ Service key JWT validada com role: ${payload.role}`);
  });

  it("deve confirmar que credenciais estão sincronizadas", () => {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    expect(url).toBeDefined();
    expect(anonKey).toBeDefined();
    expect(serviceKey).toBeDefined();

    // Ambas as chaves devem ser do mesmo projeto
    const anonPayload = JSON.parse(
      Buffer.from(anonKey!.split(".")[1], "base64").toString("utf-8")
    );
    const servicePayload = JSON.parse(
      Buffer.from(serviceKey!.split(".")[1], "base64").toString("utf-8")
    );

    expect(anonPayload.ref).toBe(servicePayload.ref);
    console.log(
      `✅ Credenciais sincronizadas para projeto: ${anonPayload.ref}`
    );
  });
});
