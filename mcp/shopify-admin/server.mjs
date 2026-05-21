#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { shopifyGraphql } from "./lib.mjs";

function text(value) {
  return {
    content: [
      {
        type: "text",
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2)
      }
    ]
  };
}

function toolError(error) {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: error instanceof Error ? error.message : String(error)
      }
    ]
  };
}

const server = new McpServer({
  name: "context-commerce-shopify-admin",
  version: "0.1.0"
});

server.registerTool(
  "shopify_check_connection",
  {
    title: "Check Shopify Agent Connection",
    description: "Use this to verify the agent's Shopify Admin API token and identify the configured shop without exposing the token.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false
    }
  },
  async () => {
    try {
      const result = await shopifyGraphql(`
        query AgentConnectionCheck {
          shop {
            name
            myshopifyDomain
          }
        }
      `);

      return text(result);
    } catch (error) {
      return toolError(error);
    }
  }
);

server.registerTool(
  "shopify_list_products",
  {
    title: "List Shopify Products",
    description: "Use this to inspect a small product sample from the configured Shopify shop.",
    inputSchema: {
      first: z.number().int().min(1).max(20).default(5)
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false
    }
  },
  async ({ first }) => {
    try {
      const result = await shopifyGraphql(`
        query AgentProductSample($first: Int!) {
          products(first: $first) {
            nodes {
              id
              title
              handle
              status
            }
          }
        }
      `, { first });

      return text(result);
    } catch (error) {
      return toolError(error);
    }
  }
);

server.registerTool(
  "shopify_graphql",
  {
    title: "Run Shopify Admin GraphQL",
    description: "Use this for explicit Shopify Admin GraphQL queries or mutations against the configured shop. Do not use for destructive writes unless the user asked for that exact action.",
    inputSchema: {
      query: z.string().min(1),
      variables: z.record(z.unknown()).default({})
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true
    }
  },
  async ({ query, variables }) => {
    try {
      const result = await shopifyGraphql(query, variables);
      return text(result);
    } catch (error) {
      return toolError(error);
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
