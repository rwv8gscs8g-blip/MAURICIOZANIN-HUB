import { personSchema, inovajuntosSchema } from "@/lib/schema-org";
import { createScholarlyArticleSchema } from "@/lib/schema-org";

interface JsonLdProps {
  type: "person" | "organization" | "article";
  articleData?: {
    title: string;
    description: string;
    author: string;
    publisher: string;
    datePublished: string;
    url: string;
  };
}

export function JsonLd({ type, articleData }: JsonLdProps) {
  let schema;

  switch (type) {
    case "person":
      schema = personSchema;
      break;
    case "organization":
      schema = inovajuntosSchema;
      break;
    case "article":
      if (!articleData) return null;
      schema = createScholarlyArticleSchema(articleData);
      break;
    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
