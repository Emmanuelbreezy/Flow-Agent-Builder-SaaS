import { DefaultChatTransport } from "ai";

export const createWorkflowTransport = ({
  workflowId,
}: {
  workflowId: string;
}) =>
  new DefaultChatTransport({
    api: `/api/workflow/${workflowId}/trigger`,
    async prepareSendMessagesRequest({ messages, id }) {
      return {
        body: {
          workflowId,
          id,
          messages,
        },
      };
    },
    fetch: async (input, init) => {
      const body = JSON.parse(init?.body as string);
      const chatId = body.id;

      // Open SSE stream (GET) while sending message (POST)
      const [res] = await Promise.all([
        fetch(input + `?id=${chatId}`, { method: "GET" }), // ← Opens SSE stream
        fetch(input, init), // ← Sends POST request
      ]);

      return res;
    },
  });
