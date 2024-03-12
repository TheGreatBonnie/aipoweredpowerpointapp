"use client";

import {
  CopilotKit,
} from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import "@copilotkit/react-textarea/styles.css";
import "./style.css";
import { Presentation } from "./components/Presentation";

export default function AIPresentation() {
  
  return (
    <CopilotKit url="/api/copilotkit/">
      <CopilotSidebar
        instructions="Help the user create and edit a powerpoint-style presentation. IMPORTANT NOTE: SOMETIMES you may want to research a topic, before taking further action. BUT FIRST ASK THE USER if they would like you to research it. If they answer 'no', do your best WITHOUT researching the topic first."
        defaultOpen={true}
        labels={{
          title: "Presentation Copilot",
          initial:
            "Hi you! 👋 I can help you create a presentation on any topic.",
        }}
        clickOutsideToClose={false}
      >
        <Presentation  />
      </CopilotSidebar>
    </CopilotKit>
  );
}