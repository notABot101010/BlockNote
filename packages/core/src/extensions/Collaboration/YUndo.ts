import { redoCommand, undoCommand, yUndoPlugin, yUndoPluginKey } from "y-prosemirror";
import { createExtension } from "../../editor/BlockNoteExtension.js";

// eslint-disable-next-line no-empty-pattern
export const YUndoExtension = createExtension(({}) => {
  // Apply the Tiptap workaround for y-prosemirror issues #114 and #102
  // See: https://github.com/yjs/y-prosemirror/issues/114
  const yUndoPluginInstance = yUndoPlugin();
  const originalUndoPluginView = yUndoPluginInstance.spec.view;

  yUndoPluginInstance.spec.view = (view) => {
    const pluginState = yUndoPluginKey.getState(view.state);
    if (!pluginState) {
      return {};
    }
    const undoManager = pluginState.undoManager as any;

    if (undoManager.restore) {
      undoManager.restore();
      undoManager.restore = () => {
        // noop
      };
    }

    const viewRet = originalUndoPluginView ? originalUndoPluginView(view) : undefined;

    return {
      destroy: () => {
        const hasUndoManSelf = undoManager.trackedOrigins.has(undoManager);
        const observers = undoManager._observers;

        undoManager.restore = () => {
          if (hasUndoManSelf) {
            undoManager.trackedOrigins.add(undoManager);
          }

          undoManager.doc.on('afterTransaction', undoManager.afterTransactionHandler);
          undoManager._observers = observers;
        };

        if (viewRet?.destroy) {
          viewRet.destroy();
        }
      },
    };
  };

  return {
    key: "yUndo",
    prosemirrorPlugins: [yUndoPluginInstance],
    undoCommand: undoCommand,
    redoCommand: redoCommand,
  } as const;
});
