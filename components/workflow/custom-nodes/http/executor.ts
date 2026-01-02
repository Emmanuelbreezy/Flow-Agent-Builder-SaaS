import { Node } from "@xyflow/react";
import { ExecutorContextType, ExecutorResultType } from "@/types/workflow";
import { replaceVariables } from "@/lib/helper";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function executeHttp(
  node: Node,
  context: ExecutorContextType
): Promise<ExecutorResultType> {
  const { outputs } = context;
  const {
    method = "GET",
    url = "",
    headers = {},
    body = "",
  } = node.data as any;

  try {
    // Replace variables in URL and body
    const finalUrl = replaceVariables(url, outputs);
    let finalBody = body;

    if (typeof body === "string" && body.trim()) {
      finalBody = replaceVariables(body, outputs);
    }

    // Build fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    // Add body for methods that support it
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && finalBody) {
      fetchOptions.body = finalBody;
    }

    // Make request
    const response = await fetch(finalUrl, fetchOptions);

    // Get response data
    let responseBody: any;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    return {
      output: {
        status: response.status,
        body: responseBody,
      },
    };
  } catch (error) {
    console.error("HTTP executor error:", error);
    throw error;
  }
}

// Get headers as object
// const responseHeaders: Record<string, string> = {};
// response.headers.forEach((value, key) => {
//   responseHeaders[key] = value;
// });
