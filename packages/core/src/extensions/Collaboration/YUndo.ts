import { redoCommand, undoCommand, yUndoPlugin } from "y-prosemirror";
import { createExtension } from "../../editor/BlockNoteExtension.js";

// eslint-disable-next-line no-empty-pattern
export const YUndoExtension = createExtension(({}) => {
  return {
    key: "yUndo",
    prosemirrorPlugins: [yUndoPlugin()],
    dependsOn: ["ySync"],
    undoCommand: undoCommand,
    redoCommand: redoCommand,
  } as const;
});
