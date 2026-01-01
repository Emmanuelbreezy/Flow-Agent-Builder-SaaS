import { DefaultChatTransport } from "ai";

export const createWorkflowTransport = ({
  workflowId,
}: {
  workflowId: string;
}) =>
  new DefaultChatTransport({
    api: `/api/upstash/trigger`,
    async prepareSendMessagesRequest({ messages }) {
      return {
        body: {
          workflowId,
          messages,
        },
      };
    },
    fetch: async (input, init) => {
      // 1. POST to trigger endpoint
      const triggerRes = await fetch(input, init);
      const triggerData = await triggerRes.json();
      const workflowRunId = triggerData.workflowRunId;

      // 2. GET to chat endpoint for streaming
      return fetch(`/api/workflow/${workflowId}/chat?id=${workflowRunId}`, {
        method: "GET",
      });
    },
  });

// import { DefaultChatTransport } from "ai";

// export const createWorkflowTransport = ({
//   workflowId,
// }: {
//   workflowId: string;
// }) =>
//   new DefaultChatTransport({
//     api: `/api/workflow/${workflowId}/chat`,
//     async prepareSendMessagesRequest({ messages, id }) {
//       return {
//         body: {
//           workflowId,
//           id,
//           messages,
//         },
//       };
//     },
//     fetch: async (input, init) => {
//       const body = JSON.parse(init?.body as string);
//       const chatId = body.id;

//       // Open SSE stream (GET) while sending message (POST)
//       const [res] = await Promise.all([
//         fetch(input + `?id=${chatId}`, { method: "GET" }), // ← Opens SSE stream
//         fetch(input, init), // ← Sends POST request
//       ]);

//       return res;
//     },
//   });
