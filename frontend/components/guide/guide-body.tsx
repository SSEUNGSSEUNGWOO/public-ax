"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface ImageInfo {
  id: string;
  url?: string;
}

interface GuideBodyProps {
  body: string;
  imageMap: Record<string, ImageInfo>;
}

function slugify(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w가-힣-]/g, "");
}

const mdComponents: Components = {
  h2: ({ children, ...props }) => (
    <h2 {...props} id={slugify(String(children))} className="scroll-mt-24">
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 {...props} id={slugify(String(children))} className="scroll-mt-24">
      {children}
    </h3>
  ),
};

// CommonMark right-flanking delimiter fix:
// closing ** after punctuation (e.g. ')') followed by Korean text fails to parse as bold
function fixBoldDelimiters(text: string) {
  return text.replace(/([^\w\s가-힣])\*\*([^\s*])/g, "$1** $2");
}

export function GuideBody({ body, imageMap }: GuideBodyProps) {
  const parts = body.split(/({{image:[^}]+}})/);

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^{{image:([^}]+)}}$/);
        if (match) {
          const img = imageMap[match[1]];
          if (!img?.url) return null;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={img.url} alt={img.id} className="w-full rounded-xl my-8 not-prose" />
          );
        }
        return (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={mdComponents}>
            {fixBoldDelimiters(part)}
          </ReactMarkdown>
        );
      })}
    </>
  );
}
