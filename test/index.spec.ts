import { env, createExecutionContext, waitOnExecutionContext, SELF } from "cloudflare:test";
import worker from "../src/index";
import { describe, it, expect, beforeAll } from "vitest";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;
const testEnv = env as any; 

describe("Hello World worker", () => {
  beforeAll(async () => {
    // Inicializa la tabla en memoria y asegura que esté vacía al inicio
    await testEnv.p6.prepare("CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)").run();
    await testEnv.p6.prepare("DELETE FROM Users").run();
  });

  it("responds with HTTP status 200 OK", async () => {
    const request = new IncomingRequest("http://example.com");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, testEnv, ctx);
    await waitOnExecutionContext(ctx);
    
    expect(response.status).toBe(200);
  });

  it("responds with empty dbData when database has no records", async () => {
    const request = new IncomingRequest("http://example.com");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, testEnv, ctx);
    await waitOnExecutionContext(ctx);
    
    const data = await response.json();
    expect(data).toEqual({
      message: "Hello world 3!",
      dbData: []
    });
  });

  it("returns populated dbData after inserting a user into D1", async () => {
    // Insertamos un usuario de prueba en la base de datos en memoria
    await testEnv.p6.prepare("INSERT INTO Users (name) VALUES ('John Doe')").run();

    const request = new IncomingRequest("http://example.com");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, testEnv, ctx);
    await waitOnExecutionContext(ctx);
    
    const data = (await response.json()) as any;
    expect(data.message).toBe("Hello world 3!");
    
    // Verificamos que el arreglo dbData ahora contenga el registro insertado
    expect(data.dbData.length).toBe(1);
    expect(data.dbData[0].name).toBe("John Doe");
    expect(data.dbData[0].id).toBeDefined();
  });

  it("responds correctly using the integration style (SELF)", async () => {
    const response = await SELF.fetch("https://example.com");
    const data = (await response.json()) as any;
    
    // Verificamos la estructura general en la prueba de integración
    expect(response.status).toBe(200);
    expect(data.message).toBe("Hello world 3!");
    expect(Array.isArray(data.dbData)).toBe(true);
  });
});