import {} from "@0xsequence/network";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

interface IEnv {
  PROJECT_ACCESS_KEY: string; // From sequence.build
  season_pass: KVNamespace;
}

function fastResponse(message: string, status = 400) {
  return new Response(message, { status });
}

export const onRequest: PagesFunction<IEnv> = async (ctx) => {
  try {
    const [address, signature] = ctx.request.headers
      .get("authorization")
      .split(":") as Array<`0x${string}`>;
    const isValid = await createPublicClient({
      chain: arbitrumSepolia,
      transport: http(),
    }).verifyMessage({ address, message: "let me in", signature });
    if (!isValid) {
      return fastResponse(
        JSON.stringify({ result: "signature not valid" }),
        401,
      );
    }

    if (ctx.request.method === "GET") {
      try {
        const result = (await ctx.env.season_pass.get(address)) || "false";
        return fastResponse(JSON.stringify({ result }), 200);
      } catch (err) {
        // In a production application, you could instead choose to retry your KV
        // read or fall back to a default code path.
        console.error(`KV returned error: ${err}`);
        return new Response(err, { status: 500 });
      }
    } else if (ctx.request.method === "POST") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = (await ctx.request.json()) as any;
      if (body.action === "buy") {
        try {
          await ctx.env.season_pass.put(address, "true");
          return fastResponse(JSON.stringify({ result: "true" }), 200);
        } catch (err) {
          // In a production application, you could instead choose to retry your KV
          // read or fall back to a default code path.
          console.error(`KV returned error: ${err}`);
          return new Response(err, { status: 500 });
        }
      }
      if (body.action === "burn") {
        try {
          await ctx.env.season_pass.put(address, "false");
          return fastResponse(JSON.stringify({ result: "false" }), 200);
        } catch (err) {
          // In a production application, you could instead choose to retry your KV
          // read or fall back to a default code path.
          console.error(`KV returned error: ${err}`);
          return new Response(err, { status: 500 });
        }
      }
    } else {
      return fastResponse(`Method not supported: ${ctx.request.method}`, 405);
    }
  } catch (err) {
    console.error(`error: ${err}`);
    return fastResponse(err, 500);
  }
};
