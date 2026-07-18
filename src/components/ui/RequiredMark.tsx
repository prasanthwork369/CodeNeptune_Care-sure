import React from "react";
import { Text } from "react-native";

// Red asterisk marking a mandatory field. Nest inside a label <Text> so it
// inherits the label's font size and baseline: `<Text>Name<RequiredMark /></Text>`.
export const RequiredMark = () => (
  <Text style={{ color: "#EF4444" }}>{" *"}</Text>
);
