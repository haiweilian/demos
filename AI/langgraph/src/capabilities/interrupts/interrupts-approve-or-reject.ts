import { Command, MemorySaver, START, END, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import * as z from "zod";

const State = new StateSchema({
  actionDetails: z.string(),
  status: z.enum(["pending", "approved", "rejected"]).nullable(),
});

const graphBuilder = new StateGraph(State)
  .addNode(
    "approval",
    async (state) => {
      // Expose details so the caller can render them in a UI
      const decision = interrupt({
        question: "Approve this action?",
        details: state.actionDetails,
      });
      return new Command({ goto: decision ? "proceed" : "cancel" });
    },
    { ends: ["proceed", "cancel"] },
  )
  .addNode("proceed", () => ({ status: "approved" }))
  .addNode("cancel", () => ({ status: "rejected" }))
  .addEdge(START, "approval")
  .addEdge("proceed", END)
  .addEdge("cancel", END);

// Use a more durable checkpointer in production
const checkpointer = new MemorySaver();
const graph = graphBuilder.compile({ checkpointer });

const config = { configurable: { thread_id: "approval-123" } };
const initial = await graph.invoke({ actionDetails: "Transfer $500", status: "pending" }, config);
console.log(initial.__interrupt__);
// [{ value: { question: ..., details: ... } }]

// Resume with the decision; true routes to proceed, false to cancel
const resumed = await graph.invoke(new Command({ resume: true }), config);
// const resumed = await graph.invoke(new Command({ resume: { [initial.__interrupt__[0].id]: true } }), config);
// const resumed = await graph.invoke(new Command({ resume: { [initial.__interrupt__[0].id]: false } }), config);
console.log(resumed.status); // -> "approved"
