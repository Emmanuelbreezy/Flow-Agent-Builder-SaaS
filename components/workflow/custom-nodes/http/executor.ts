/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * HTTP Node Executor
 * Makes HTTP requests and returns response data
 */
export async function executeHttp(
  data: any,
  inputs: Record<string, any>
): Promise<Record<string, any>> {
  const { method = "GET", url = "", headers = {}, body = "" } = data;

  try {
    // Replace variables in URL and body
    const finalUrl = replaceVariables(url, inputs);
    let finalBody = body;

    if (typeof body === "string" && body.trim()) {
      finalBody = replaceVariables(body, inputs);
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

    // Get headers as object
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      "output.status": response.status,
      "output.headers": responseHeaders,
      "output.body": responseBody,
    };
  } catch (error) {
    console.error("HTTP executor error:", error);
    throw error;
  }
}

/**
 * Replace variables in text with values from inputs
 * Supports {{nodeName.fieldName}} syntax
 */
function replaceVariables(text: string, inputs: Record<string, any>): string {
  return text.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    const keys = path.split(".");
    let value = inputs;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }

    return value !== undefined ? String(value) : match;
  });
}
