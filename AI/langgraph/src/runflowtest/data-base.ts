export const edges = [
  {
    source: "RyImageInput-XLyQh",
    sourceHandle: "{œdataTypeœ:œRyImageInputœ,œidœ:œRyImageInput-XLyQhœ,œnameœ:œdataœ,œoutput_typesœ:[œJSONœ]}",
    target: "RyImageHandle-xF9bh",
    targetHandle: "in-RyImageHandle-xF9bh-image-1",
  },
  {
    source: "RyImageInput-xwkIr",
    sourceHandle: "out-RyImageInput-xwkIr",
    target: "RyImageHandle-xF9bh",
    targetHandle: "in-RyImageHandle-xF9bh-image-2",
  },
  {
    source: "RyPromptInput-zXwmv",
    sourceHandle: "out-RyPromptInput-zXwmv",
    target: "RyImageHandle-xF9bh",
    targetHandle: "in-RyImageHandle-xF9bh-prompt-1",
  },
];

export const nodes = [
  {
    id: "RyPromptInput-zXwmv",
    type: "promptInput",
    position: {
      x: 12,
      y: 850,
    },
    params: {
      prompt: "生成小猫",
    },
    selected: false,
    measured: {
      width: 322,
      height: 369,
    },
    dragging: false,
  },
  {
    id: "RyPromptInput-zXwmv2",
    type: "promptInput",
    position: {
      x: 12,
      y: 850,
    },
    params: {
      prompt: "生成小狗",
    },
    selected: false,
    measured: {
      width: 322,
      height: 369,
    },
    dragging: false,
  },
  {
    id: "RyImageInput-xwkIr",
    type: "imageInput",
    position: {
      x: 12,
      y: 431,
    },
    params: {
      image: "https://example.com/image.png",
    },
    selected: false,
    measured: {
      width: 322,
      height: 319,
    },
  },
  {
    id: "RyImageInput-XLyQh",
    type: "imageInput",
    position: {
      x: 12,
      y: 12,
    },
    params: {
      image: "https://example.com/image2.png",
    },
    selected: false,
    measured: {
      width: 322,
      height: 319,
    },
  },
  {
    id: "RyImageHandle-xF9bh",
    type: "imageHandle",
    position: {
      x: 534,
      y: 456,
    },
    params: {
      size: "medium",
      ratio: 1,
    },
    selected: false,
    measured: {
      width: 322,
      height: 675,
    },
  },
];
