const req = {
  projectId: "10e95d19-75a0-4577-a79f-dc4c9c32962a",
  workflow: {
    schema_version: 1,
    nodes: [
      {
        id: "_placeholder-16fd8ac4",
        type: "Gemini3FlashTextGenerate",
        data: {
          class_type: "Gemini3FlashTextGenerate",
          params: {
            prompt: "",
            thinking_level: "low",
            temperature: 0.7,
            preset: "prompt_enhancer",
            max_tokens: 4096,
          },
          inputs: [
            {
              name: "prompt",
              type: "text",
            },
            {
              name: "image_1",
              type: "image",
            },
            {
              name: "image_2",
              type: "image",
            },
            {
              name: "image_3",
              type: "image",
            },
            {
              name: "image_4",
              type: "image",
            },
            {
              name: "image_5",
              type: "image",
            },
            {
              name: "video_1",
              type: "video",
            },
            {
              name: "video_2",
              type: "video",
            },
            {
              name: "video_3",
              type: "video",
            },
            {
              name: "video_4",
              type: "video",
            },
            {
              name: "video_5",
              type: "video",
            },
            {
              name: "audio_1",
              type: "any",
            },
            {
              name: "audio_2",
              type: "any",
            },
            {
              name: "audio_3",
              type: "any",
            },
          ],
          outputs: [
            {
              name: "text",
              type: "text",
            },
          ],
          group: "LLM Models",
          model: "gemini-3-flash",
          _sources: {},
        },
        position: {
          y: 138,
          x: 1705,
        },
      },
      {
        id: "Gemini3FlashTextGenerate-3700c2b6",
        type: "Gemini3FlashTextGenerate",
        data: {
          class_type: "Gemini3FlashTextGenerate",
          params: {
            prompt: "",
            thinking_level: "low",
            temperature: 0.7,
            max_tokens: 4096,
            preset: "prompt_enhancer",
          },
          inputs: [
            {
              name: "prompt",
              type: "text",
            },
            {
              name: "image_1",
              type: "image",
            },
            {
              name: "image_2",
              type: "image",
            },
            {
              name: "image_3",
              type: "image",
            },
            {
              name: "image_4",
              type: "image",
            },
            {
              name: "image_5",
              type: "image",
            },
            {
              name: "video_1",
              type: "video",
            },
            {
              name: "video_2",
              type: "video",
            },
            {
              name: "video_3",
              type: "video",
            },
            {
              name: "video_4",
              type: "video",
            },
            {
              name: "video_5",
              type: "video",
            },
            {
              name: "audio_1",
              type: "any",
            },
            {
              name: "audio_2",
              type: "any",
            },
            {
              name: "audio_3",
              type: "any",
            },
          ],
          outputs: [
            {
              name: "text",
              type: "text",
            },
          ],
          group: "LLM Models",
          model: "gemini-3-flash",
          _sources: {},
        },
        position: {
          x: 1374,
          y: 296,
        },
      },
      {
        id: "Gemini3FlashTextGenerate-bd8e13c8",
        type: "Gemini3FlashTextGenerate",
        data: {
          class_type: "Gemini3FlashTextGenerate",
          params: {
            preset: "prompt_enhancer",
            prompt: "生成小狗",
            thinking_level: "low",
            temperature: 0.7,
            max_tokens: 4096,
          },
          inputs: [
            {
              name: "prompt",
              type: "text",
            },
            {
              name: "image_1",
              type: "image",
            },
            {
              name: "image_2",
              type: "image",
            },
            {
              name: "image_3",
              type: "image",
            },
            {
              name: "image_4",
              type: "image",
            },
            {
              name: "image_5",
              type: "image",
            },
            {
              name: "video_1",
              type: "video",
            },
            {
              name: "video_2",
              type: "video",
            },
            {
              name: "video_3",
              type: "video",
            },
            {
              name: "video_4",
              type: "video",
            },
            {
              name: "video_5",
              type: "video",
            },
            {
              name: "audio_1",
              type: "any",
            },
            {
              name: "audio_2",
              type: "any",
            },
            {
              name: "audio_3",
              type: "any",
            },
          ],
          outputs: [
            {
              name: "text",
              type: "text",
            },
          ],
          group: "LLM Models",
          model: "gemini-3-flash",
        },
        position: {
          x: 1039.4745516956607,
          y: 665.1231044303806,
        },
      },
    ],
    edges: [
      {
        id: "Gemini3FlashTextGenerate-3700c2b6-edge-out__placeholder-16fd8ac4-edge-in-text_input-1",
        source: "Gemini3FlashTextGenerate-3700c2b6",
        target: "_placeholder-16fd8ac4",
        sourceHandle: "edge-out",
        targetHandle: "edge-in-text_input-1",
        sourceNodeId: "Gemini3FlashTextGenerate-3700c2b6",
        targetNodeId: "_placeholder-16fd8ac4",
        sourceHandleId: "edge-out",
        targetHandleId: "edge-in-text_input-1",
        type: "bling",
      },
      {
        id: "Gemini3FlashTextGenerate-bd8e13c8-edge-out_Gemini3FlashTextGenerate-3700c2b6-edge-in-text_input-1",
        source: "Gemini3FlashTextGenerate-bd8e13c8",
        target: "Gemini3FlashTextGenerate-3700c2b6",
        sourceHandle: "edge-out",
        targetHandle: "edge-in-text_input-1",
        sourceNodeId: "Gemini3FlashTextGenerate-bd8e13c8",
        targetNodeId: "Gemini3FlashTextGenerate-3700c2b6",
        sourceHandleId: "edge-out",
        targetHandleId: "edge-in-text_input-1",
        type: "bling",
      },
    ],
  },
  locale: "zh",
};

const res = {
  code: 0,
  message: "Execution started",
  data: {
    runId: "d7809f7f-4c03-40f8-80cb-eeb77796667a",
    executionArn: "arn:aws:states:us-west-2:785636837158:execution:ai-art-workflow-dag-sm:3877cbbd-4aa0-4e11-87d0-b063d3b476ea",
    projectId: "10e95d19-75a0-4577-a79f-dc4c9c32962a",
    nodeCount: 3,
    scopedNodeCount: 3,
    reservedCredits: 0,
    nodes: [
      {
        nodeId: "_placeholder-16fd8ac4",
        status: "QUEUED",
        inputs: {
          "Gemini3FlashTextGenerate-3700c2b6": {
            label: "edge-in-text_input-1",
          },
        },
        outputs: {},
      },
      {
        nodeId: "Gemini3FlashTextGenerate-3700c2b6",
        status: "QUEUED",
        inputs: {
          "Gemini3FlashTextGenerate-bd8e13c8": {
            label: "edge-in-text_input-1",
          },
        },
        outputs: {},
      },
      {
        nodeId: "Gemini3FlashTextGenerate-bd8e13c8",
        status: "QUEUED",
        inputs: {},
        outputs: {},
      },
    ],
  },
};
