/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/ui/code-block";
import { Code } from "lucide-react";

const EMBED_HTML = `
<iframe
  src="https://yourdomain.com/widget"
  style="width:350px;height:600px;border:none;border-radius:12px;"
  title="AI Chat"
></iframe>
`;

const EMBED_SCRIPT = `<button id="open-my-ai-chat">Chat with AI</button>
<script src="https://yourdomain.com/embed.js"></script>`;

const code = [
  {
    language: "html",
    filename: "Embed as iframe",
    code: EMBED_HTML,
  },
  {
    language: "html",
    filename: "Embed with script",
    code: EMBED_SCRIPT,
  },
];

const CodeDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5">
          <Code className="h-3.5 w-3.5" />
          Code
        </Button>
      </DialogTrigger>
      <DialogContent
        overlayClass="bg-black/10"
        className="w-full! sm:max-w-md! "
      >
        <DialogHeader className="">
          <DialogTitle>Embed AI Chat on your site</DialogTitle>
          <DialogDescription>
            Copy and paste the code snippet into your website.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full max-w-sm! h-full">
          <CodeBlock
            className="h-full!"
            data={code}
            defaultValue={code[0].filename}
          >
            <CodeBlockHeader>
              <CodeBlockCopyButton />
            </CodeBlockHeader>
            <CodeBlockBody>
              {(item) => (
                <CodeBlockItem key={item.filename} value={item.filename}>
                  <CodeBlockContent language={item.language as any}>
                    {item.code}
                  </CodeBlockContent>
                </CodeBlockItem>
              )}
            </CodeBlockBody>
          </CodeBlock>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CodeDialog;
