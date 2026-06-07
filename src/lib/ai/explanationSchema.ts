type JsonSchema =
  | {
      readonly type: "object";
      readonly required?: readonly string[];
      readonly properties: Record<string, JsonSchema>;
      readonly additionalProperties?: boolean;
    }
  | {
      readonly type: "array";
      readonly items: JsonSchema;
    }
  | {
      readonly type: "string";
      readonly enum?: readonly string[];
      readonly const?: string;
    }
  | {
      readonly type: "number";
    }
  | {
      readonly type: "boolean";
      readonly const?: boolean;
    };

const sectionSchema: JsonSchema = {
  type: "object",
  required: ["title", "items"],
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    items: {
      type: "array",
      items: { type: "string" }
    }
  }
};

const constraintSchema: JsonSchema = {
  type: "object",
  required: ["id", "title", "description"],
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    description: { type: "string" }
  }
};

export const explanationOutputSchema: JsonSchema = {
  type: "object",
  required: [
    "source",
    "usesExternalApi",
    "sourceModelProbabilities",
    "summary",
    "probabilityExplanation",
    "marketExplanation",
    "riskNotes",
    "counterArguments",
    "dataLimitations",
    "nextChecks",
    "constraints"
  ],
  additionalProperties: false,
  properties: {
    source: {
      type: "string",
      const: "local-deterministic-draft"
    },
    usesExternalApi: {
      type: "boolean",
      const: false
    },
    sourceModelProbabilities: {
      type: "object",
      required: ["home", "draw", "away"],
      additionalProperties: false,
      properties: {
        home: { type: "number" },
        draw: { type: "number" },
        away: { type: "number" }
      }
    },
    sourceMarketProbabilities: {
      type: "object",
      required: ["home", "draw", "away"],
      additionalProperties: false,
      properties: {
        home: { type: "number" },
        draw: { type: "number" },
        away: { type: "number" }
      }
    },
    summary: sectionSchema,
    probabilityExplanation: sectionSchema,
    marketExplanation: sectionSchema,
    riskNotes: {
      type: "array",
      items: {
        type: "object",
        required: ["level", "message"],
        additionalProperties: false,
        properties: {
          level: {
            type: "string",
            enum: ["info", "caution"]
          },
          message: { type: "string" }
        }
      }
    },
    counterArguments: sectionSchema,
    dataLimitations: sectionSchema,
    nextChecks: sectionSchema,
    constraints: {
      type: "array",
      items: constraintSchema
    }
  }
};
